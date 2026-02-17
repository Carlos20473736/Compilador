# 🚀 Deploy do Android Compiler na Render

Este guia explica como fazer o deploy do Android Compiler na Render.

## ✅ Vantagens da Render

- ✅ Suporte completo a Node.js e Docker
- ✅ Banco de dados MySQL integrado
- ✅ Escalabilidade automática
- ✅ Plano gratuito disponível
- ✅ Deploy automático via GitHub
- ✅ Melhor performance para compilações Android

## 📋 Pré-requisitos

1. Conta na Render (https://render.com)
2. Repositório GitHub com este código
3. Token de acesso GitHub (para deploy automático)

## 🔧 Configuração Passo-a-Passo

### 1. Criar Banco de Dados MySQL

1. Acesse https://dashboard.render.com
2. Clique em "New +" → "MySQL"
3. Configure:
   - **Name**: `android-compiler-db`
   - **Database**: `compiler`
   - **User**: `compiler_user`
   - **Region**: Escolha a mais próxima
   - **Plan**: Free (ou Standard para produção)
4. Clique em "Create Database"
5. **Copie a URL de conexão** (Internal Database URL)

### 2. Deploy da Aplicação

#### Opção A: Deploy com render.yaml (Recomendado)

1. Acesse https://dashboard.render.com
2. Clique em "New +" → "Web Service"
3. Selecione "Deploy existing repository"
4. Conecte seu repositório GitHub `Compilador`
5. Configure:
   - **Name**: `android-apk-compiler`
   - **Environment**: `Docker`
   - **Region**: Mesma do banco de dados
   - **Branch**: `main`
   - **Plan**: Standard (mínimo 2GB RAM recomendado)
6. Clique em "Create Web Service"
7. A Render lerá automaticamente `render.yaml`

#### Opção B: Deploy Manual

1. Acesse https://dashboard.render.com
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `android-apk-compiler`
   - **Environment**: `Docker`
   - **Region**: Mesma do banco de dados
   - **Branch**: `main`
   - **Plan**: Standard (mínimo 2GB RAM)
5. Clique em "Create Web Service"

### 3. Configurar Variáveis de Ambiente

Na seção **Environment** do serviço, adicione:

```
NODE_ENV=production
JWT_SECRET=<gere_uma_chave_aleatoria_segura>
DATABASE_URL=<URL_DO_MYSQL_COPIADA>
```

**Opcional** (se quiser integração com OAuth):
```
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

### 4. Deploy

1. Clique em "Deploy" ou aguarde o deploy automático via GitHub
2. O build pode levar 10-15 minutos na primeira vez
3. Acesse a URL fornecida pela Render

## 📊 Monitoramento

Após o deploy, você pode monitorar:

1. **Logs**: Em "Logs" na página do serviço
2. **Métricas**: CPU, memória, requisições
3. **Deploy Status**: Histórico de deploys

## 🔄 Deploy Automático

Qualquer push para a branch `main` acionará um novo deploy automaticamente.

Para desabilitar, vá em "Settings" → "Auto-Deploy" → desabilitar.

## 📝 Requisitos do Servidor

- **RAM**: Mínimo 2GB (4GB recomendado)
- **Disco**: 10GB livre
- **CPU**: 2 cores mínimo

## 🐛 Troubleshooting

### Erro: "Build failed"
- Verifique os logs de build
- Certifique-se de que `pnpm-lock.yaml` está no repositório
- Execute `pnpm install` localmente e teste

### Erro: "Database connection failed"
- Verifique se a URL do banco está correta
- Teste a conexão com o banco de dados
- Confirme que o banco foi criado

### Erro: "Out of memory"
- Aumente o plano para 4GB+ RAM
- Otimize a compilação Android (reduza o tamanho do projeto)

### Erro: "Timeout"
- Aumente o timeout nas configurações
- Considere usar um plano com mais recursos

## 📈 Escalabilidade

A Render permite escalar automaticamente:

1. Vá em "Settings" → "Scaling"
2. Configure:
   - **Min Instances**: 1
   - **Max Instances**: 3-5
3. Salve as configurações

## 💾 Backup do Banco de Dados

A Render faz backup automático. Para restaurar:

1. Vá em "Database" → "Backups"
2. Selecione o backup desejado
3. Clique em "Restore"

## 🔗 Links Úteis

- [Documentação Render](https://render.com/docs)
- [Render Dashboard](https://dashboard.render.com)
- [MySQL na Render](https://render.com/docs/deploy-mysql)
- [Docker na Render](https://render.com/docs/docker)

## 📞 Suporte

Para problemas, acesse:
- [Render Support](https://support.render.com)
- [Discord Render](https://discord.gg/render)
