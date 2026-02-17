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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Armazenar builds em memória
const builds = new Map();

// API de upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const buildType = req.body.buildType || 'release';
    const buildId = Date.now();
    
    const projectName = req.file.originalname.replace(/\.[^/.]+$/, '');
    
    // Armazenar informações do build
    builds.set(buildId, {
      projectName,
      buildType,
      status: 'iniciado',
      logs: [],
      apkUrl: null
    });
    
    res.json({
      buildId,
      projectName,
      buildType,
      status: 'iniciado'
    });

    // Simular compilação em background
    simulateCompilation(buildId);

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao processar upload' });
  }
});

// Função para simular compilação
function simulateCompilation(buildId) {
  const build = builds.get(buildId);
  if (!build) return;

  const logs = [
    'Iniciando compilação...',
    'Configurando ambiente Android...',
    'Compilando projeto...',
    'Gerando APK...',
    'Compilação concluída com sucesso!'
  ];

  let logIndex = 0;
  const interval = setInterval(() => {
    if (logIndex < logs.length) {
      build.logs.push(logs[logIndex]);
      logIndex++;
    } else {
      build.status = 'concluído';
      build.apkUrl = `/apk/sample-${buildId}.apk`;
      clearInterval(interval);
    }
  }, 1000);
}

// API de logs SSE
app.get('/api/build/:buildId/logs', (req, res) => {
  const buildId = parseInt(req.params.buildId);
  const build = builds.get(buildId);

  if (!build) {
    res.status(404).json({ error: 'Build não encontrado' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Enviar status conectado
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Enviar logs já existentes
  build.logs.forEach(log => {
    res.write(`data: ${JSON.stringify({ type: 'log', message: log })}\n\n`);
  });

  // Monitorar novos logs
  let lastLogCount = build.logs.length;
  const interval = setInterval(() => {
    // Enviar novos logs
    while (lastLogCount < build.logs.length) {
      const log = build.logs[lastLogCount];
      res.write(`data: ${JSON.stringify({ type: 'log', message: log })}\n\n`);
      lastLogCount++;
    }

    // Se compilação terminou
    if (build.status === 'concluído') {
      res.write(`data: ${JSON.stringify({ 
        type: 'complete', 
        success: true, 
        apkUrl: build.apkUrl 
      })}\n\n`);
      clearInterval(interval);
      res.end();
    }
  }, 500);

  // Limpar intervalo quando cliente desconectar
  req.on('close', () => {
    clearInterval(interval);
  });
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
