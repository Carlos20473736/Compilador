import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRouter from './server/uploadRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// API Routes - ANTES do fallback para SPA
app.use(uploadRouter);

// Servir arquivos estáticos do build (ANTES DO FALLBACK)
app.use(express.static(path.join(__dirname, 'dist/public')));

// Fallback para SPA (DEVE SER POR ÚLTIMO)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Compilador Android ativo - Aguardando uploads...`);
});
