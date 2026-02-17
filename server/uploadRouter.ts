import express, { Request, Response } from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { nanoid } from "nanoid";
import { validateAndroidProject, extractZip, compileAndroidProject, cleanupTempFiles } from "./androidCompiler";
import { createBuild, updateBuild } from "./buildDb-memory";
import { sdk } from "./_core/sdk";

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

/**
 * Upload and compile Android project
 */
router.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const buildType = (req.body.buildType as "debug" | "release") || "debug";
    const zipPath = req.file.path;

    // Validate project
    const validation = await validateAndroidProject(zipPath);
    if (!validation.isValid) {
      fs.unlinkSync(zipPath);
      return res.status(400).json({ error: validation.errorMessage });
    }

    // Create build record (using userId = 1 for public access)
    const build = await createBuild({
      userId: 1,
      projectName: validation.projectName || "android-project",
      buildType,
      status: "validating",
      zipFileKey: zipPath,
    });

    // Start compilation in background
    compileInBackground(build.id, zipPath, buildType, validation.projectName || "android-project");

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

  // Store client connection
  sseClients.set(buildId, res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
  res.flush?.();

  // Clean up on disconnect
  req.on("close", () => {
    sseClients.delete(buildId);
  });
});

/**
 * Background compilation process
 */
async function compileInBackground(
  buildId: number,
  zipPath: string,
  buildType: "debug" | "release",
  projectName: string
) {
  const tempDir = path.join("/tmp", `build-${buildId}-${nanoid()}`);
  
  try {
    // Send log to SSE client
      const sendLog = (log: string) => {
      const client = sseClients.get(buildId) as any;
      if (client && client.write) {
        try {
          client.write(`data: ${JSON.stringify({ type: "log", message: log })}\n\n`);
          client.flush?.();
        } catch (e) {
          console.error("Error writing log:", e);
        }
      }
    };

    sendLog("📦 Extraindo projeto...");
    await updateBuild(buildId, { status: "validating" });

    // Extract ZIP
    fs.mkdirSync(tempDir, { recursive: true });
    await extractZip(zipPath, tempDir);
    
    sendLog("✅ Projeto extraído com sucesso");
    sendLog("🔨 Iniciando compilação...");
    await updateBuild(buildId, { status: "compiling" });

    // Compile project
    const result = await compileAndroidProject(tempDir, buildType, sendLog);

    if (result.success) {
      await updateBuild(buildId, {
        status: "success",
        apkUrl: result.apkUrl,
        apkFileKey: result.apkFileKey,
        logs: result.logs,
        completedAt: new Date(),
      });

      const client = sseClients.get(buildId) as any;
      if (client && client.write) {
        try {
          client.write(`data: ${JSON.stringify({ 
            type: "complete", 
            success: true,
            apkUrl: result.apkUrl 
          })}\n\n`);
          client.flush?.();
          client.end();
        } catch (e) {
          console.error("Error writing completion:", e);
        }
      }
      sseClients.delete(buildId);
    } else {
      await updateBuild(buildId, {
        status: "failed",
        logs: result.logs,
        errorMessage: result.errorMessage,
        completedAt: new Date(),
      });

      const client = sseClients.get(buildId) as any;
      if (client && client.write) {
        try {
          client.write(`data: ${JSON.stringify({ 
            type: "complete", 
            success: false,
            error: result.errorMessage 
          })}\n\n`);
          client.flush?.();
          client.end();
        } catch (e) {
          console.error("Error writing error:", e);
        }
      }
      sseClients.delete(buildId);
    }

  } catch (error) {
    console.error("Compilation error:", error);
    
    await updateBuild(buildId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : String(error),
      completedAt: new Date(),
    });

    const client = sseClients.get(buildId) as any;
    if (client && client.write) {
      try {
        client.write(`data: ${JSON.stringify({ 
          type: "complete", 
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })}\n\n`);
        client.flush?.();
        client.end();
      } catch (e) {
        console.error("Error writing catch error:", e);
      }
    }
    sseClients.delete(buildId);

  } finally {
    // Cleanup
    await cleanupTempFiles(tempDir);
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
  }
}

export default router;
