#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

// Gerar valores aleatórios seguros
function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWT() {
  return crypto.randomBytes(32).toString('base64');
}

// Variáveis de ambiente
const envVars = {
  PORT: '3000',
  NODE_ENV: 'production',
  
  // Database - usar SQLite para simplicidade (pode mudar depois)
  DATABASE_URL: 'file:./compilador.db',
  
  // JWT
  JWT_SECRET: generateJWT(),
  
  // AWS S3 (deixar vazio por enquanto)
  AWS_ACCESS_KEY_ID: '',
  AWS_SECRET_ACCESS_KEY: '',
  AWS_REGION: 'us-east-1',
  AWS_S3_BUCKET: '',
  
  // GitHub (deixar vazio por enquanto)
  GITHUB_TOKEN: '',
  
  // OAuth (deixar vazio por enquanto)
  OAUTH_SERVER_URL: '',
  OWNER_OPEN_ID: '',
  
  // Analytics (deixar vazio por enquanto)
  VITE_ANALYTICS_ENDPOINT: '',
  VITE_ANALYTICS_WEBSITE_ID: '',
};

// Criar conteúdo do .env
const envContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Escrever arquivo
fs.writeFileSync(envPath, envContent, 'utf-8');

console.log('✅ Arquivo .env gerado com sucesso!');
console.log(`📁 Localização: ${envPath}`);
console.log('\n📝 Variáveis geradas:');
console.log('  ✓ JWT_SECRET - Gerado automaticamente');
console.log('  ✓ DATABASE_URL - SQLite local');
console.log('  ✓ PORT - 3000');
console.log('\n⚠️  Variáveis vazias (configure depois):');
console.log('  - AWS_ACCESS_KEY_ID');
console.log('  - AWS_SECRET_ACCESS_KEY');
console.log('  - AWS_S3_BUCKET');
console.log('  - GITHUB_TOKEN');
console.log('  - OAUTH_SERVER_URL');
console.log('  - VITE_ANALYTICS_ENDPOINT');
console.log('\n💡 Para Railway, adicione essas variáveis nos secrets do projeto.');
