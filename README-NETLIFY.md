# 🚀 Deploy do Android Compiler na Netlify

Este guia explica como fazer o deploy do Android Compiler na Netlify.

## ⚠️ Limitações Importantes

A Netlify tem limitações que podem afetar a compilação Android:

- **Timeout de Função**: Máximo 26 segundos (plano gratuito) ou 900 segundos (plano pago)
- **Memória**: Limitada a 1GB por função
- **Espaço em Disco**: Limitado no ambiente de build
- **Compilação Android**: Pode não funcionar completamente devido aos requisitos de RAM e tempo

Para melhor desempenho com compilações Android, recomendamos usar **Render**, **Railway** ou **DigitalOcean App Platform**.

## 📋 Pré-requisitos

1. Conta na Netlify (https://netlify.com)
2. Repositório GitHub com este código
3. Banco de dados MySQL externo (PlanetScale, AWS RDS, DigitalOcean, etc.)
4. (Opcional) Bucket S3 para armazenar APKs gerados

## 🔧 Configuração Passo-a-Passo

### 1. Preparar o Banco de Dados

Crie um banco de dados MySQL e obtenha a URL de conexão:

```
mysql://user:password@host:port/database
```

**Opções recomendadas:**
- **PlanetScale** (gratuito): https://planetscale.com
- **AWS RDS** (free tier): https://aws.amazon.com
- **DigitalOcean Managed Databases**: https://digitalocean.com

### 2. Conectar GitHub à Netlify

1. Acesse https://app.netlify.com
2. Clique em "Add new site" → "Import an existing project"
3. Selecione GitHub e autorize
4. Escolha o repositório `Compilador`

### 3. Configurar Build

Na tela de configuração:

- **Build command**: `pnpm install && pnpm run build`
- **Publish directory**: `dist/public`
- **Functions directory**: `dist/functions`
- **Node version**: `22.13.0`

### 4. Adicionar Variáveis de Ambiente

Clique em "Site settings" → "Build & deploy" → "Environment" e adicione:

**Obrigatórias:**
```
DATABASE_URL=mysql://user:password@host:port/database
NODE_ENV=production
JWT_SECRET=<gere_uma_chave_aleatoria_segura>
```

**Opcionais (OAuth):**
```
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

**Opcionais (S3 para APKs):**
```
AWS_ACCESS_KEY_ID=sua_chave_aws
AWS_SECRET_ACCESS_KEY=sua_chave_secreta_aws
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu_bucket_name
```

### 5. Deploy

Clique em "Deploy site" e aguarde a conclusão (pode levar 5-10 minutos).

## 🔄 Atualizações Automáticas

Qualquer push para a branch `main` acionará um novo deploy automaticamente.

Para desabilitar, vá em "Site settings" → "Build & deploy" → "Deploy contexts".

## 📊 Monitoramento

Após o deploy, você pode monitorar:

1. **Logs de Build**: Em "Deploys" → clique no deploy
2. **Logs de Função**: Em "Functions" → clique na função
3. **Logs de Erro**: Em "Analytics"

## 🐛 Troubleshooting

### Erro: "Function execution timeout"
**Causa**: A compilação Android é muito pesada
**Solução**: Use um serviço com mais recursos (Render, Railway, etc.)

### Erro: "DATABASE_URL is required"
**Causa**: Variável de ambiente não configurada
**Solução**: Verifique se foi adicionada em "Site settings" → "Environment"

### Erro: "Cannot find module"
**Causa**: Dependências não instaladas corretamente
**Solução**: Execute `pnpm install` localmente e verifique se há erros

### Erro: "404 Page not found"
**Causa**: Build falhou ou arquivo não foi gerado
**Solução**: Verifique os logs de build em "Deploys"

## 💡 Alternativas Recomendadas

Se a Netlify não atender suas necessidades:

| Serviço | Vantagens | Desvantagens |
|---------|-----------|-------------|
| **Render** | Melhor suporte Node.js, Docker | Plano pago mais caro |
| **Railway** | Simples, bom preço | Menos recursos |
| **Fly.io** | Excelente para global | Curva de aprendizado |
| **DigitalOcean** | Bom custo-benefício | Setup mais complexo |

## 📝 Notas Importantes

- O primeiro build pode demorar devido ao download de dependências
- Compilações Android podem exceder o timeout da Netlify
- APKs gerados são salvos temporariamente e podem ser baixados
- Considere usar um serviço com Docker para melhor compatibilidade

## 🔗 Links Úteis

- [Documentação Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Guia de Deploy Netlify](https://docs.netlify.com/site-deploys/overview/)
- [PlanetScale MySQL](https://planetscale.com)
- [AWS RDS Free Tier](https://aws.amazon.com/rds/free/)
