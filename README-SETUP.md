# Android Compiler - Setup Automático

## 🚀 Quick Start

### Opção 1: Deploy no Railway (Recomendado)

```bash
# Clonar repositório
git clone https://github.com/Carlos20473736/Compilador.git
cd Compilador

# Executar setup automático
bash scripts/setup-railway.sh
```

Pronto! Seu app estará rodando em `https://seu-app.railway.app`

### Opção 2: Setup Local

```bash
# Clonar repositório
git clone https://github.com/Carlos20473736/Compilador.git
cd Compilador

# Executar setup local
bash scripts/setup-local.sh

# Iniciar servidor
pnpm start
```

Acesse em `http://localhost:3000`

## 📋 O que os scripts fazem

### `scripts/generate-env.mjs`
- Gera JWT_SECRET automaticamente
- Configura DATABASE_URL
- Cria arquivo `.env` com valores padrão

### `scripts/setup-railway.sh`
- Instala Railway CLI
- Faz login no Railway
- Gera `.env`
- Configura variáveis de ambiente
- Faz deploy automático

### `scripts/setup-local.sh`
- Verifica Node.js e pnpm
- Instala dependências
- Gera `.env`
- Faz build do projeto

## 🔧 Configuração Manual (Se necessário)

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `.env` com seus valores:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host/db
JWT_SECRET=sua_chave_secreta
```

### 2. Banco de Dados

**Opção A: SQLite (Padrão)**
```env
DATABASE_URL=file:./compilador.db
```

**Opção B: MySQL**
```env
DATABASE_URL=mysql://user:password@localhost:3306/compilador
```

**Opção C: PostgreSQL**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/compilador
```

### 3. AWS S3 (Opcional)

Para armazenar APKs compilados:

```env
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket-compilador
```

## 🐳 Docker

### Build local

```bash
docker build -t compilador .
docker run -p 3000:3000 compilador
```

### Deploy no Railway via Docker

```bash
railway add --name compilador
railway up
```

## 📊 Estrutura do Projeto

```
.
├── client/              # Frontend React
│   └── src/
│       ├── pages/       # Páginas
│       └── components/  # Componentes
├── server/              # Backend Express
│   ├── _core/          # Core do servidor
│   ├── uploadRouter.ts # Upload de arquivos
│   └── buildDb.ts      # Banco de dados
├── scripts/            # Scripts de setup
│   ├── generate-env.mjs
│   ├── setup-railway.sh
│   └── setup-local.sh
├── Dockerfile          # Docker
├── railway.json        # Configuração Railway
└── package.json
```

## 🔐 Segurança

### Secrets no Railway

1. Acesse https://railway.app
2. Selecione seu projeto
3. Vá em "Variables"
4. Adicione:
   - `JWT_SECRET` - Chave secreta JWT
   - `DATABASE_URL` - URL do banco
   - `AWS_*` - Credenciais AWS (se usar)

### .env local

Nunca faça commit de `.env` com valores reais:

```bash
echo ".env" >> .gitignore
```

## 🐛 Troubleshooting

### Erro: "Cannot find pnpm"
```bash
npm install -g pnpm
```

### Erro: "Railway CLI not found"
```bash
npm install -g @railway/cli
```

### Erro: "Database connection failed"
- Verifique `DATABASE_URL` em `.env`
- Verifique se o banco está rodando
- Verifique credenciais

### Erro: "Port 3000 already in use"
```bash
# Mude a porta em .env
PORT=3001
```

## 📚 Documentação

- [Railway Docs](https://docs.railway.app)
- [Express.js](https://expressjs.com)
- [React](https://react.dev)
- [Drizzle ORM](https://orm.drizzle.team)

## 📞 Suporte

Para dúvidas:
1. Verifique os logs: `railway logs`
2. Verifique as variáveis: `railway variables`
3. Consulte a documentação acima

## 📝 Licença

MIT
