import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

// Servir arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'dist/public')));

// API de upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const buildType = req.body.buildType || 'release';
    const buildId = Date.now();
    
    // Simular processamento de compilação
    const projectName = req.file.originalname.replace(/\.[^/.]+$/, '');
    
    res.json({
      buildId,
      projectName,
      buildType,
      status: 'iniciado',
      message: `Compilação iniciada para ${projectName}`
    });

    // Simular compilação em background
    setTimeout(() => {
      // Aqui você poderia adicionar lógica real de compilação
      console.log(`Compilação ${buildId} concluída`);
    }, 3000);

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao processar upload' });
  }
});

// API de logs SSE
app.get('/api/logs/:buildId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Enviar logs simulados
  const logs = [
    'Iniciando compilação...',
    'Configurando ambiente Android...',
    'Compilando projeto...',
    'Gerando APK...',
    'Compilação concluída com sucesso!'
  ];

  let index = 0;
  const interval = setInterval(() => {
    if (index < logs.length) {
      res.write(`data: ${JSON.stringify({ message: logs[index], type: 'log' })}\n\n`);
      index++;
    } else {
      res.write(`data: ${JSON.stringify({ message: 'Compilação finalizada', type: 'complete', apkUrl: '/apk/sample.apk' })}\n\n`);
      clearInterval(interval);
      res.end();
    }
  }, 1000);
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
