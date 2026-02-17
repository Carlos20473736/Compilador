import express, { Request, Response } from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { nanoid } from "nanoid";
import { validateAndroidProject } from "./androidCompiler";
import { createBuild, updateBuild } from "./buildDb";
import { triggerGitHubBuild, getGitHubRunStatus, downloadGitHubArtifact } from "./triggerBuild";
import { storagePut } from "./storage";

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  dest: "/tmp/uploads",
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/zip" || file.mimetype === "application/x-zip-compressed" || file.originalname.endsWith(".zip")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos ZIP são permitidos"));
    }
  }
});

// SSE connections map
const sseClients = new Map<number, Response>();
const buildStatus = new Map<number, { status: string; logs: string[] }>();

/**
 * Upload and compile Android project via GitHub Actions
 */
router.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const buildType = (req.body.buildType as "debug" | "release") || "debug";
    const zipPath = req.file.path;

    // Validate project structure
    const validation = await validateAndroidProject(zipPath);
    if (!validation.isValid) {
      fs.unlinkSync(zipPath);
      return res.status(400).json({ error: validation.errorMessage });
    }

    // Create build record
    const build = await createBuild({
      userId: 1,
      projectName: validation.projectName || "android-project",
      buildType,
      status: "validating",
      zipFileKey: zipPath,
    });

    // Initialize build status tracking
    buildStatus.set(build.id, {
      status: "validating",
      logs: ["📦 Validando projeto Android..."]
    });

    // Start GitHub Actions build in background
    triggerGitHubBuildInBackground(build.id, zipPath, buildType, validation.projectName || "android-project");

    res.json({
      success: true,
      buildId: build.id,
      projectName: validation.projectName
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao processar upload"
    });
  }
});

/**
 * SSE endpoint for real-time logs
 */
router.get("/api/build/:buildId/logs", async (req: Request, res: Response) => {
  const buildId = parseInt(req.params.buildId);

  if (isNaN(buildId)) {
    return res.status(400).json({ error: "Build ID inválido" });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Store client connection
  sseClients.set(buildId, res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  // Send existing logs
  const status = buildStatus.get(buildId);
  if (status) {
    status.logs.forEach(log => {
      res.write(`data: ${JSON.stringify({ type: "log", message: log })}\n\n`);
    });
  }

  // Clean up on disconnect
  req.on("close", () => {
    sseClients.delete(buildId);
  });
});

/**
 * Background process to trigger GitHub Actions and monitor build
 */
async function triggerGitHubBuildInBackground(
  buildId: number,
  zipPath: string,
  buildType: "debug" | "release",
  projectName: string
) {
  const sendLog = (log: string) => {
    const client = sseClients.get(buildId);
    if (client) {
      client.write(`data: ${JSON.stringify({ type: "log", message: log })}\n\n`);
    }
    
    // Store log
    const status = buildStatus.get(buildId);
    if (status) {
      status.logs.push(log);
    }
  };

  try {
    // Upload ZIP to temporary storage
    sendLog("📤 Fazendo upload do projeto...");
    const zipBuffer = fs.readFileSync(zipPath);
    const zipKey = `builds/${buildId}/project.zip`;
    const { url: projectZipUrl } = await storagePut(zipKey, zipBuffer, "application/zip");
    sendLog(`✅ Projeto enviado: ${projectZipUrl}`);

    // Trigger GitHub Actions
    sendLog("🚀 Disparando compilação no GitHub Actions...");
    await updateBuild(buildId, { status: "compiling" });

    const triggerResult = await triggerGitHubBuild(buildId, projectZipUrl, buildType);
    if (!triggerResult.success) {
      throw new Error(triggerResult.error || "Falha ao disparar GitHub Actions");
    }

    sendLog(`✅ Build disparado no GitHub Actions`);
    sendLog(`🔗 Run ID: ${triggerResult.runId}`);

    // Monitor build status
    await monitorGitHubBuild(buildId, triggerResult.runId!, sendLog);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    sendLog(`❌ Erro: ${errorMsg}`);

    await updateBuild(buildId, {
      status: "failed",
      errorMessage: errorMsg,
      completedAt: new Date(),
    });

    const client = sseClients.get(buildId);
    if (client) {
      client.write(`data: ${JSON.stringify({ 
        type: "complete", 
        success: false,
        error: errorMsg 
      })}\n\n`);
      client.end();
    }
    sseClients.delete(buildId);

  } finally {
    // Cleanup
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
  }
}

/**
 * Monitor GitHub Actions build status
 */
async function monitorGitHubBuild(
  buildId: number,
  runId: string,
  sendLog: (log: string) => void
) {
  let attempts = 0;
  const maxAttempts = 180; // 30 minutos com polling a cada 10 segundos

  while (attempts < maxAttempts) {
    try {
      const status = await getGitHubRunStatus(runId);

      if (status.status === "completed") {
        if (status.conclusion === "success") {
          sendLog("✅ Compilação concluída com sucesso no GitHub!");
          
          // Download APK from artifacts
          sendLog("📥 Baixando APK...");
          const artifactResult = await downloadGitHubArtifact(runId, buildId);
          
          if (artifactResult.success) {
            sendLog(`✅ APK encontrado`);
            
            // For now, store the download URL
            // In a real scenario, you'd download and re-upload to your storage
            await updateBuild(buildId, {
              status: "success",
              apkUrl: artifactResult.downloadUrl,
              apkFileKey: `builds/${buildId}/app.apk`,
              completedAt: new Date(),
            });

            sendLog(`🔗 APK pronto para download`);
            
            const client = sseClients.get(buildId);
            if (client) {
              client.write(`data: ${JSON.stringify({ 
                type: "complete", 
                success: true,
                apkUrl: artifactResult.downloadUrl
              })}\n\n`);
              client.end();
            }
            sseClients.delete(buildId);
          } else {
            throw new Error(artifactResult.error || "Falha ao baixar APK");
          }
          return;

        } else if (status.conclusion === "failure") {
          sendLog("❌ Compilação falhou no GitHub Actions");
          sendLog(`🔗 Verifique os logs: ${status.html_url}`);
          
          await updateBuild(buildId, {
            status: "failed",
            errorMessage: "GitHub Actions build failed",
            completedAt: new Date(),
          });

          const client = sseClients.get(buildId);
          if (client) {
            client.write(`data: ${JSON.stringify({ 
              type: "complete", 
              success: false,
              error: "Build failed"
            })}\n\n`);
            client.end();
          }
          sseClients.delete(buildId);
          return;
        }
      }

      sendLog(`⏳ Aguardando compilação... (${status.status})`);
      
      // Wait 10 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;

    } catch (error) {
      sendLog(`⚠️ Erro ao verificar status: ${error instanceof Error ? error.message : String(error)}`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }
  }

  // Timeout
  sendLog("❌ Timeout: compilação levou muito tempo");
  await updateBuild(buildId, {
    status: "failed",
    errorMessage: "Build timeout",
    completedAt: new Date(),
  });

  const client = sseClients.get(buildId);
  if (client) {
    client.write(`data: ${JSON.stringify({ 
      type: "complete", 
      success: false,
      error: "Build timeout"
    })}\n\n`);
    client.end();
  }
  sseClients.delete(buildId);
}

export default router;
