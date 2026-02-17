import { Router } from "express";
import multer from "multer";
import { triggerAndroidBuild, getWorkflowRuns } from "./githubActions";
import { uploadFileToS3 } from "./_core/storage";

const router = Router();
const upload = multer({ dest: "uploads/" });

// Trigger build via GitHub Actions
router.post("/api/build/trigger", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const buildType = (req.body.buildType as "debug" | "release") || "release";

    // Upload file to S3 to get a public URL
    const projectUrl = await uploadFileToS3(req.file);

    if (!projectUrl) {
      return res.status(500).json({ error: "Erro ao fazer upload do arquivo" });
    }

    // Trigger GitHub Actions workflow
    const result = await triggerAndroidBuild(projectUrl, buildType);

    if (result.success) {
      res.json({
        buildId: Date.now(),
        status: "iniciado",
        message: "Build iniciado no GitHub Actions",
        projectUrl,
      });
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Erro ao disparar build:", error);
    res.status(500).json({ error: "Erro ao processar requisição" });
  }
});

// Get build status
router.get("/api/build/status", async (req, res) => {
  try {
    const runs = await getWorkflowRuns();
    res.json({ runs });
  } catch (error) {
    console.error("Erro ao buscar status:", error);
    res.status(500).json({ error: "Erro ao buscar status" });
  }
});

export default router;
