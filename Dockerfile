# Build stage - Frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependência
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Build do frontend
RUN pnpm run build

# Runtime stage - Leve (sem Android SDK)
FROM node:22-alpine

WORKDIR /app

# Instalar apenas o necessário
RUN apk add --no-cache \
    curl \
    ca-certificates

# Instalar pnpm
RUN npm install -g pnpm

# Copiar build do frontend
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/package.json ./
COPY --from=frontend-builder /app/pnpm-lock.yaml ./

# Copiar código do servidor
COPY server ./server
COPY server.ts ./
COPY drizzle ./drizzle
COPY drizzle.config.ts ./

# Criar diretórios necessários
RUN mkdir -p /app/uploads /tmp/uploads && \
    chmod -R 755 /app/uploads /tmp/uploads

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Comando de inicialização
CMD ["node", "server.ts"]
