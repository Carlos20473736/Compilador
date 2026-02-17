# Deploy no Railway - Passo a Passo

## ✅ Pré-requisitos

- [x] Código enviado para GitHub
- [x] Dockerfile pronto
- [x] .env.example criado
- [x] Build testado localmente

## 🚀 Opção 1: Deploy via Web (Mais Fácil)

### Passo 1: Criar conta no Railway
1. Acesse https://railway.app
2. Clique "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize o Railway a acessar seus repositórios

### Passo 2: Criar novo projeto
1. Clique "New Project"
2. Selecione "Deploy from GitHub repo"
3. Procure por `Carlos20473736/Compilador`
4. Clique "Deploy Now"

### Passo 3: Configurar variáveis
1. Seu projeto será criado automaticamente
2. Vá para "Variables"
3. Adicione as variáveis necessárias:

```
PORT=3000
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_aqui
DATABASE_URL=file:./compilador.db
```

### Passo 4: Deploy automático
1. Railway detectará o Dockerfile
2. Fará o build automaticamente
3. Seu app estará em: `https://seu-app.railway.app`

## 🚀 Opção 2: Deploy via CLI

### Passo 1: Instalar Railway CLI
```bash
npm install -g @railway/cli
```

### Passo 2: Fazer login
```bash
railway login
```

### Passo 3: Inicializar projeto
```bash
cd /home/ubuntu/compilador_android_studio
railway init
```

### Passo 4: Configurar variáveis
```bash
railway variables set PORT 3000
railway variables set NODE_ENV production
railway variables set JWT_SECRET $(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
railway variables set DATABASE_URL "file:./compilador.db"
```

### Passo 5: Deploy
```bash
railway up
```

## 📊 Verificar Deploy

### Via Web
1. Acesse https://railway.app
2. Selecione seu projeto
3. Vá para "Deployments"
4. Veja o status em tempo real

### Via CLI
```bash
railway status
railway logs
```

## 🔗 Acessar seu app

Após o deploy, seu app estará em:
```
https://seu-app.railway.app
```

Você pode customizar o domínio em "Settings" → "Domain"

## 🐛 Troubleshooting

### Erro: "Build failed"
```bash
# Verifique os logs
railway logs --build
```

### Erro: "Port already in use"
- Railway gerencia as portas automaticamente
- Não precisa fazer nada

### Erro: "Database connection failed"
- Verifique DATABASE_URL em "Variables"
- Para SQLite local, use: `file:./compilador.db`

### App não responde
```bash
# Verifique se está rodando
railway status

# Veja os logs
railway logs
```

## 💰 Custos

- **Plano Gratuito**: $5/mês de créditos
  - Suficiente para testes
  - Compilações Android consomem muita CPU

- **Plano Pro**: $20/mês
  - Mais créditos
  - Suporte prioritário

## 📝 Variáveis Importantes

| Variável | Valor | Obrigatória |
|----------|-------|------------|
| PORT | 3000 | Sim |
| NODE_ENV | production | Sim |
| JWT_SECRET | Chave aleatória | Sim |
| DATABASE_URL | file:./compilador.db | Sim |
| AWS_ACCESS_KEY_ID | Sua key | Não |
| AWS_SECRET_ACCESS_KEY | Sua secret | Não |
| AWS_S3_BUCKET | Seu bucket | Não |

## 🎯 Próximos Passos

1. ✅ Deploy no Railway
2. Teste o upload de um projeto Android
3. Verifique os logs em caso de erro
4. Configure domínio customizado (opcional)
5. Configure backups (opcional)

## 📚 Links Úteis

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/cli/quick-start)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Production](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## ✉️ Suporte

Se tiver dúvidas:
1. Verifique os logs: `railway logs`
2. Consulte a documentação: https://docs.railway.app
3. Abra uma issue no GitHub

---

**Status**: ✅ Pronto para deploy!
