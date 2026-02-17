# Setup Completo - Android Compiler

## 1. GitHub Secrets (Obrigatório)

Acesse: `https://github.com/Carlos20473736/Compilador/settings/secrets/actions`

Adicione os seguintes secrets:

### `GITHUB_TOKEN`
- Já vem automático do GitHub Actions
- Não precisa fazer nada

### `AWS_ACCESS_KEY_ID`
- Obtenha em: AWS Console → IAM → Access Keys
- Copie e cole aqui

### `AWS_SECRET_ACCESS_KEY`
- Obtenha em: AWS Console → IAM → Access Keys
- Copie e cole aqui

## 2. Variáveis de Ambiente (.env)

Crie um arquivo `.env` na raiz do projeto:

```env
# GitHub
GITHUB_TOKEN=ghp_seu_token_aqui

# AWS S3
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket-compilador

# Database (opcional para testes)
DATABASE_URL=mysql://user:password@localhost:3306/compilador

# JWT
JWT_SECRET=sua_chave_secreta_aleatoria

# Node
NODE_ENV=production
PORT=3000
```

## 3. Configurar S3 Bucket

1. Acesse AWS Console
2. Vá para S3
3. Crie um bucket: `seu-bucket-compilador`
4. Habilite "Block all public access" = OFF
5. Adicione política de bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::seu-bucket-compilador/*"
    }
  ]
}
```

## 4. Deploy no Railway

### Opção A: Via CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Opção B: Via GitHub

1. Acesse https://railway.app
2. Clique "New Project" → "Deploy from GitHub repo"
3. Selecione `Carlos20473736/Compilador`
4. Configure:
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `node dist/index.js`
   - **Root Directory**: `/`

5. Adicione as variáveis de ambiente no Railway:
   - `GITHUB_TOKEN`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_S3_BUCKET`
   - `JWT_SECRET`
   - `NODE_ENV=production`

## 5. Usar o Compilador

### Upload e Compilação

1. Acesse seu site no Railway
2. Faça upload do projeto Android (ZIP)
3. Selecione "Debug" ou "Release"
4. Clique "Compilar APK"
5. Aguarde 5-10 minutos
6. Baixe o APK compilado

### Monitorar Compilação

- Acesse GitHub Actions: `https://github.com/Carlos20473736/Compilador/actions`
- Veja o status em tempo real
- Logs detalhados disponíveis

## 6. Troubleshooting

### Erro: "Cannot find GITHUB_TOKEN"
- Adicione `GITHUB_TOKEN` nos secrets do GitHub

### Erro: "S3 Access Denied"
- Verifique AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY
- Verifique permissões do IAM user

### Erro: "Gradle build failed"
- Verifique se o projeto tem `build.gradle` ou `build.gradle.kts`
- Verifique se `gradlew` está no repositório

### Build muito lento
- GitHub Actions oferece 2000 minutos/mês grátis
- Cada compilação = ~5-10 minutos
- Máximo ~200 compilações/mês com plano gratuito

## 7. Estrutura do Projeto

```
.
├── .github/workflows/
│   └── android-build.yml          # Workflow GitHub Actions
├── client/                         # Frontend React
│   └── src/
│       ├── pages/Compiler.tsx      # Página principal
│       └── components/
├── server/                         # Backend Express
│   ├── _core/index.ts             # Servidor principal
│   ├── githubActions.ts           # Integração GitHub API
│   ├── buildRouter.ts             # Rotas de build
│   └── uploadRouter.ts            # Rotas de upload
├── package.json
└── vite.config.ts
```

## 8. Documentação Adicional

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [AWS S3 SDK](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Railway Docs](https://docs.railway.app)
- [Android Gradle Plugin](https://developer.android.com/studio/build)

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs no GitHub Actions
2. Verifique os logs no Railway
3. Verifique as variáveis de ambiente
4. Consulte a documentação dos serviços
