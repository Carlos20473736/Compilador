#!/usr/bin/env node

import https from 'https';
import { execSync } from 'child_process';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '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';
const REPO_OWNER = 'Carlos20473736';
const REPO_NAME = 'Compilador';

console.log('🚀 Deploy Automático - Railway');
console.log('================================\n');

// Cores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisição HTTPS
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path,
      method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Android-Compiler-Deploy',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function main() {
  try {
    // 1. Verificar se o repositório existe
    log('blue', '1️⃣  Verificando repositório...');
    const repoResponse = await makeRequest('GET', `/repos/${REPO_OWNER}/${REPO_NAME}`);
    
    if (repoResponse.status !== 200) {
      log('red', `❌ Repositório não encontrado: ${repoResponse.status}`);
      process.exit(1);
    }

    log('green', `✓ Repositório encontrado: ${repoResponse.data.full_name}`);

    // 2. Verificar se o Dockerfile existe
    log('blue', '\n2️⃣  Verificando Dockerfile...');
    const dockerfileResponse = await makeRequest(
      'GET',
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/Dockerfile`
    );

    if (dockerfileResponse.status !== 200) {
      log('red', '❌ Dockerfile não encontrado');
      process.exit(1);
    }

    log('green', '✓ Dockerfile encontrado');

    // 3. Verificar se railway.json existe
    log('blue', '\n3️⃣  Verificando railway.json...');
    const railwayResponse = await makeRequest(
      'GET',
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/railway.json`
    );

    if (railwayResponse.status !== 200) {
      log('red', '❌ railway.json não encontrado');
      process.exit(1);
    }

    log('green', '✓ railway.json encontrado');

    // 4. Verificar branch master
    log('blue', '\n4️⃣  Verificando branch master...');
    const branchResponse = await makeRequest(
      'GET',
      `/repos/${REPO_OWNER}/${REPO_NAME}/branches/master`
    );

    if (branchResponse.status !== 200) {
      log('red', '❌ Branch master não encontrado');
      process.exit(1);
    }

    log('green', `✓ Branch master encontrado (${branchResponse.data.commit.sha.substring(0, 7)})`);

    // 5. Instruções para Railway
    log('yellow', '\n5️⃣  Próximos passos para deploy:');
    console.log(`
${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

${colors.green}✅ Repositório está pronto para deploy!${colors.reset}

${colors.yellow}Opção 1: Deploy via Web (Recomendado)${colors.reset}
1. Acesse https://railway.app
2. Clique "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha: ${REPO_OWNER}/${REPO_NAME}
5. Clique "Deploy Now"

${colors.yellow}Opção 2: Deploy via CLI${colors.reset}
1. Instale Railway CLI: npm install -g @railway/cli
2. Faça login: railway login
3. Execute: railway init
4. Configure variáveis: railway variables set ...
5. Deploy: railway up

${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

${colors.green}📊 Informações do Repositório:${colors.reset}
  • Owner: ${REPO_OWNER}
  • Repo: ${REPO_NAME}
  • Branch: master
  • Commit: ${branchResponse.data.commit.sha.substring(0, 7)}
  • Dockerfile: ✓ Pronto
  • railway.json: ✓ Pronto

${colors.green}💡 Dicas:${colors.reset}
  • Railway fará o build automaticamente
  • Seu app estará em: https://seu-app.railway.app
  • Configure variáveis em "Variables" no Railway
  • Verifique logs em "Deployments"

${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
    `);

    log('green', '\n✅ Verificação concluída com sucesso!');

  } catch (error) {
    log('red', `\n❌ Erro: ${error.message}`);
    process.exit(1);
  }
}

main();
