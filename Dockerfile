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

# Runtime stage - Com Android SDK pré-instalado
FROM ubuntu:22.04

WORKDIR /app

# Variáveis de ambiente
ENV ANDROID_HOME=/app/android-sdk \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
    GRADLE_HOME=/app/gradle/gradle-8.6 \
    PATH=$PATH:/app/android-sdk/cmdline-tools/latest/bin:/app/android-sdk/platform-tools:/app/gradle/gradle-8.6/bin \
    ANDROID_SDK_ROOT=/app/android-sdk \
    NODE_ENV=production

# Instalar dependências do sistema (mínimas)
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk-headless \
    nodejs \
    npm \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN npm install -g pnpm

# Copiar Android SDK pré-instalado
COPY android-sdk /app/android-sdk

# Copiar Gradle pré-instalado
COPY gradle /app/gradle

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
    chmod -R 755 /app/uploads /tmp/uploads && \
    chmod +x /app/android-sdk/cmdline-tools/latest/bin/* && \
    chmod +x /app/gradle/gradle-8.6/bin/*

# Verificar instalações
RUN java -version && \
    /app/gradle/gradle-8.6/bin/gradle --version && \
    /app/android-sdk/cmdline-tools/latest/bin/sdkmanager --list_installed | head -10

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Comando de inicialização
CMD ["node", "server.ts"]
