# Android Compiler - Setup Guide

## Arquitetura

```
┌─────────────────────┐
│   Web App (React)   │
│   + Express Server  │
│   (Render/Railway)  │
└──────────┬──────────┘
           │
           │ Dispara workflow
           ▼
┌─────────────────────────────────┐
│   GitHub Actions                │
│   - Android SDK                 │
│   - Gradle                       │
│   - Compila APK REAL             │
│   - Salva artifacts              │
└─────────────────────────────────┘
           │
           │ Download APK
           ▼
┌─────────────────────┐
│   Storage (S3/CDN)  │
│   APK pronto        │
└─────────────────────┘
```

## Variáveis de Ambiente Necessárias

### No Render/Railway

```env
# Database
DATABASE_URL=mysql://user:password@host/database

# Storage (Manus)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=seu_token_aqui

# GitHub Actions
GITHUB_TOKEN=ghp_seu_token_aqui
```

### No GitHub Actions

O `GITHUB_TOKEN` é fornecido automaticamente pelo GitHub.

## Setup Passo a Passo

### 1. Criar Personal Access Token no GitHub

1. Vá para https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione escopos:
   - `repo` (acesso completo ao repositório)
   - `workflow` (acesso aos workflows)
4. Copie o token

### 2. Adicionar Secret no GitHub

1. Vá para https://github.com/Carlos20473736/Compilador/settings/secrets/actions
2. Clique em "New repository secret"
3. Nome: `GITHUB_TOKEN`
4. Valor: Cole o token gerado

### 3. Configurar Render/Railway

1. Adicione as variáveis de ambiente:
   - `DATABASE_URL`: Sua conexão MySQL
   - `BUILT_IN_FORGE_API_URL`: URL da API
   - `BUILT_IN_FORGE_API_KEY`: Sua chave de API
   - `GITHUB_TOKEN`: O token do GitHub

### 4. Deploy

```bash
# Push para main dispara o deploy automático
git push origin main
```

## Como Funciona

### Fluxo de Compilação

1. **Usuário faz upload** do projeto Android ZIP
2. **Express server** valida o arquivo
3. **Dispara GitHub Actions workflow** com:
   - Build ID
   - URL do arquivo ZIP
   - Tipo de build (debug/release)
4. **GitHub Actions**:
   - Baixa o projeto ZIP
   - Compila com Gradle + Android SDK
   - Gera APK real
   - Salva como artifact
5. **Express server**:
   - Monitora o status da compilação
   - Faz download do APK
   - Envia para storage (S3/CDN)
   - Retorna URL para download

### Vantagens

✅ **Servidor leve** - Apenas Node.js + React (200 MB)
✅ **Compilação rápida** - GitHub Actions com cache
✅ **APK real** - Usa Android SDK oficial
✅ **Escalável** - Múltiplas compilações simultâneas
✅ **Econômico** - GitHub Actions é gratuito (até 2000 min/mês)

## Troubleshooting

### Workflow não dispara

- Verifique se `GITHUB_TOKEN` está configurado
- Verifique se o repositório é público
- Verifique os logs em GitHub Actions

### APK não é encontrado

- Verifique se o projeto Android é válido
- Verifique se tem `build.gradle` e `gradlew`
- Verifique os logs do workflow no GitHub

### Timeout na compilação

- Aumente o timeout em `.github/workflows/android-build.yml`
- Verifique a conexão de internet
- Tente compilar localmente primeiro

## Estrutura de Arquivos

```
.
├── .github/
│   └── workflows/
│       └── android-build.yml          # GitHub Actions workflow
├── server/
│   ├── uploadRouter.ts                # API de upload
│   ├── androidCompiler.ts             # Compilação (não usado com GitHub Actions)
│   ├── triggerBuild.ts                # Dispara GitHub Actions
│   ├── buildDb.ts                     # Gerencia builds no DB
│   └── storage.ts                     # Upload de APK
├── client/                            # React frontend
├── Dockerfile                         # Imagem leve (sem Android SDK)
├── render.yaml                        # Configuração do Render
└── server.ts                          # Express server
```

## Próximos Passos

1. ✅ Configurar GitHub Token
2. ✅ Configurar variáveis de ambiente no Render
3. ✅ Fazer deploy
4. ✅ Testar com um projeto Android real
