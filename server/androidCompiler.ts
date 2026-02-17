import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import AdmZip from "adm-zip";
import { storagePut } from "./storage";

export interface CompilationResult {
  success: boolean;
  apkPath?: string;
  apkUrl?: string;
  apkFileKey?: string;
  logs: string;
  errorMessage?: string;
}

export interface ValidationResult {
  isValid: boolean;
  projectName?: string;
  errorMessage?: string;
}

/**
 * Validate if the uploaded ZIP contains a valid Android project
 */
export async function validateAndroidProject(zipPath: string): Promise<ValidationResult> {
  try {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    // Check for required Android project files
    const hasGradle = entries.some(entry => entry.entryName.includes("build.gradle") || entry.entryName.includes("build.gradle.kts"));
    const hasGradleWrapper = entries.some(entry => entry.entryName.includes("gradlew"));
    const hasManifest = entries.some(entry => entry.entryName.includes("AndroidManifest.xml"));

    if (!hasGradle) {
      return {
        isValid: false,
        errorMessage: "Projeto inválido: build.gradle não encontrado"
      };
    }

    if (!hasGradleWrapper) {
      return {
        isValid: false,
        errorMessage: "Projeto inválido: gradlew não encontrado. O projeto deve incluir o Gradle Wrapper."
      };
    }

    if (!hasManifest) {
      return {
        isValid: false,
        errorMessage: "Projeto inválido: AndroidManifest.xml não encontrado"
      };
    }

    // Try to extract project name from settings.gradle
    const settingsEntry = entries.find(entry => 
      entry.entryName.endsWith("settings.gradle") || 
      entry.entryName.endsWith("settings.gradle.kts")
    );

    let projectName = "android-project";
    if (settingsEntry) {
      const content = zip.readAsText(settingsEntry);
      const match = content.match(/rootProject\.name\s*=\s*['"]([^'"]+)['"]/);
      if (match && match[1]) {
        projectName = match[1];
      }
    }

    return {
      isValid: true,
      projectName
    };
  } catch (error) {
    return {
      isValid: false,
      errorMessage: `Erro ao validar projeto: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Extract ZIP file to a temporary directory
 */
export async function extractZip(zipPath: string, extractPath: string): Promise<void> {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);

  // Find the root project directory (might be nested)
  const files = fs.readdirSync(extractPath);
  
  // If there's only one directory, use it as root
  if (files.length === 1 && fs.statSync(path.join(extractPath, files[0]!)).isDirectory()) {
    const nestedDir = path.join(extractPath, files[0]!);
    const nestedFiles = fs.readdirSync(nestedDir);
    
    // Move all files from nested directory to extract path
    for (const file of nestedFiles) {
      fs.renameSync(
        path.join(nestedDir, file),
        path.join(extractPath, file)
      );
    }
    
    // Remove empty nested directory
    fs.rmdirSync(nestedDir);
  }
}

/**
 * Compile Android project and return APK
 */
export async function compileAndroidProject(
  projectPath: string,
  buildType: "debug" | "release",
  onLog: (log: string) => void
): Promise<CompilationResult> {
  return new Promise((resolve) => {
    let logs = "";
    const addLog = (text: string) => {
      logs += text + "\n";
      onLog(text);
    };

    try {
      // Make gradlew executable
      const gradlewPath = path.join(projectPath, "gradlew");
      if (!fs.existsSync(gradlewPath)) {
        resolve({
          success: false,
          logs,
          errorMessage: "gradlew não encontrado no projeto"
        });
        return;
      }

      fs.chmodSync(gradlewPath, "755");

      // Create local.properties with SDK location
      const androidHome = process.env.ANDROID_HOME || "/opt/android-sdk";
      const localPropertiesPath = path.join(projectPath, "local.properties");
      const localPropertiesContent = `sdk.dir=${androidHome}\n`;
      fs.writeFileSync(localPropertiesPath, localPropertiesContent);
      addLog(`📝 Criado local.properties com sdk.dir=${androidHome}`);

      // Pre-download dependencies to avoid cache issues
      addLog(`📥 Baixando dependências do projeto...`);
      const downloadDeps = spawn("./gradlew", ["dependencies", "--no-daemon", "--console=plain"], {
        cwd: projectPath,
        env: {
          ...process.env,
          ANDROID_HOME: androidHome,
          JAVA_HOME: process.env.JAVA_HOME || "/usr/lib/jvm/java-17-openjdk-amd64"
        }
      });

      downloadDeps.stdout.on("data", (data) => {
        // Silent - apenas para baixar dependências
      });

      downloadDeps.stderr.on("data", (data) => {
        // Silent - apenas para baixar dependências
      });

      downloadDeps.on("close", (code) => {
        if (code !== 0) {
          addLog(`⚠️  Aviso: Falha ao baixar dependências (código ${code}), continuando...`);
        } else {
          addLog(`✅ Dependências baixadas com sucesso!`);
        }

        // Determine build command
        const buildTask = buildType === "debug" ? "assembleDebug" : "assembleRelease";
        
        addLog(`🚀 Iniciando compilação em modo ${buildType.toUpperCase()}...`);
        addLog(`📦 Executando: ./gradlew ${buildTask}`);
        addLog("─".repeat(60));

        // Run gradle build
        const gradle = spawn("./gradlew", [buildTask, "--no-daemon", "--console=plain"], {
        cwd: projectPath,
        env: {
          ...process.env,
          ANDROID_HOME: process.env.ANDROID_HOME || "/opt/android-sdk",
          JAVA_HOME: process.env.JAVA_HOME || "/usr/lib/jvm/java-17-openjdk-amd64"
        }
      });

      gradle.stdout.on("data", (data) => {
        const text = data.toString();
        addLog(text);
      });

      gradle.stderr.on("data", (data) => {
        const text = data.toString();
        addLog(`⚠️  ${text}`);
      });

      gradle.on("close", async (code) => {
        if (code !== 0) {
          addLog("─".repeat(60));
          addLog(`❌ Compilação falhou com código de saída ${code}`);
          resolve({
            success: false,
            logs,
            errorMessage: `Gradle build failed with exit code ${code}`
          });
          return;
        }

        addLog("─".repeat(60));
        addLog("✅ Compilação concluída com sucesso!");
        addLog("📱 Procurando APK gerado...");

        // Find generated APK
        const apkDir = buildType === "debug" 
          ? path.join(projectPath, "app", "build", "outputs", "apk", "debug")
          : path.join(projectPath, "app", "build", "outputs", "apk", "release");

        if (!fs.existsSync(apkDir)) {
          resolve({
            success: false,
            logs,
            errorMessage: "Diretório de APK não encontrado"
          });
          return;
        }

        const apkFiles = fs.readdirSync(apkDir).filter(f => f.endsWith(".apk"));
        
        if (apkFiles.length === 0) {
          resolve({
            success: false,
            logs,
            errorMessage: "APK não encontrado após compilação"
          });
          return;
        }

        const apkPath = path.join(apkDir, apkFiles[0]!);
        const apkSize = (fs.statSync(apkPath).size / (1024 * 1024)).toFixed(2);
        
        addLog(`📦 APK encontrado: ${apkFiles[0]}`);
        addLog(`💾 Tamanho: ${apkSize} MB`);
        addLog("☁️  Fazendo upload para storage...");

        try {
          // Upload APK to S3
          const apkBuffer = fs.readFileSync(apkPath);
          const timestamp = Date.now();
          const fileKey = `apks/${timestamp}-${apkFiles[0]}`;
          
          const { url } = await storagePut(fileKey, apkBuffer, "application/vnd.android.package-archive");
          
          addLog(`✅ Upload concluído!`);
          addLog(`🔗 URL: ${url}`);

          resolve({
            success: true,
            apkPath,
            apkUrl: url,
            apkFileKey: fileKey,
            logs
          });
        } catch (uploadError) {
          addLog(`❌ Erro ao fazer upload: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
          resolve({
            success: false,
            logs,
            errorMessage: `Erro ao fazer upload do APK: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`
          });
        }
      });

        gradle.on("error", (error) => {
          addLog(`❌ Erro ao executar Gradle: ${error.message}`);
          resolve({
            success: false,
            logs,
            errorMessage: error.message
          });
        });
      });

    } catch (error) {
      addLog(`❌ Erro inesperado: ${error instanceof Error ? error.message : String(error)}`);
      resolve({
        success: false,
        logs,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFiles(dirPath: string): Promise<void> {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Error cleaning up temp files:", error);
  }
}
