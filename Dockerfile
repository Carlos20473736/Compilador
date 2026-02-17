# Build stage
FROM node:22-alpine AS builder

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

# Runtime stage - com Android SDK
FROM ubuntu:22.04

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    unzip \
    openjdk-17-jdk-headless \
    android-sdk \
    gradle \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN npm install -g pnpm

# Configurar Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools

# Copiar build do stage anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Copiar código do servidor
COPY server ./server
COPY server.ts ./
COPY drizzle ./drizzle
COPY drizzle.config.ts ./

# Criar diretório de uploads
RUN mkdir -p /app/uploads /tmp/uploads

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "server.ts"]
