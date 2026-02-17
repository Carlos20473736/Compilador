# 🤖 Android APK Compiler

Compilador web de projetos Android para APK com interface profissional estilo Android Studio.

## ✨ Funcionalidades

- 📤 Upload de projetos Android (ZIP)
- ✅ Validação automática de estrutura
- 🔨 Compilação Debug e Release
- 📊 Logs em tempo real
- 📥 Download automático de APK
- 📜 Histórico de compilações
- 🎨 Interface tema Android Studio

## 🚀 Deploy na Render

Para instruções completas de deploy na Render, veja [README-RENDER.md](./README-RENDER.md)

**Resumo rápido:**

1. Crie uma conta em [render.com](https://render.com)
2. Crie um banco de dados MySQL
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente
5. Deploy automático via Docker

A Render é a plataforma recomendada para este projeto, pois oferece melhor suporte para compilações Android com mais recursos de RAM e CPU.

## 📋 Requisitos do Servidor

- **RAM**: Mínimo 2GB (4GB recomendado)
- **Disco**: 10GB livre
- **CPU**: 2 cores mínimo

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Configurar .env
cp .env.example .env
# Edite .env com suas credenciais

# Rodar em desenvolvimento
pnpm dev

# Build para produção
pnpm build
pnpm start
```

## 📦 Estrutura do Projeto

```
├── client/          # Frontend React + Vite
├── server/          # Backend Express + tRPC
├── drizzle/         # Schema do banco de dados
├── Dockerfile       # Configuração Docker
└── render.yaml      # Configuração Render
```

## 🔧 Tecnologias

- **Frontend**: React 19, Tailwind CSS 4, tRPC
- **Backend**: Node.js, Express, tRPC
- **Banco**: MySQL (Drizzle ORM)
- **Build**: Vite, esbuild
- **Android**: Gradle, Android SDK, Java 17

## 📝 Notas

- O primeiro build pode demorar devido ao download do Android SDK (~500MB)
- Compilações Android consomem bastante RAM (mínimo 2GB)
- APKs gerados são salvos temporariamente e podem ser baixados
- A aplicação funciona sem banco de dados (usando memória como fallback)

## 🐛 Troubleshooting

### Erro de memória durante compilação
- Aumente o plano da Render para 4GB+ RAM

### Erro de timeout
- Aumente o timeout do servidor nas configurações da Render

### Erro de permissão do Android SDK
- Verifique se o Dockerfile tem permissões corretas

## 📄 Licença

MIT License
