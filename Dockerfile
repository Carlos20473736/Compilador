# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependências do build
RUN apk add --no-cache python3 make g++ git

# Copiar package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instalar dependências
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Build
RUN pnpm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Instalar Java e Android SDK
RUN apk add --no-cache \
    openjdk17-jdk \
    android-tools \
    wget \
    unzip \
    git \
    bash

# Configurar Android SDK
ENV ANDROID_HOME=/opt/android-sdk \
    ANDROID_SDK_ROOT=/opt/android-sdk \
    PATH=$PATH:/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools:/opt/android-sdk/build-tools/34.0.0

# Instalar Android SDK
RUN mkdir -p $ANDROID_HOME && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip -q commandlinetools-linux-9477386_latest.zip -d $ANDROID_HOME && \
    rm commandlinetools-linux-9477386_latest.zip && \
    mv $ANDROID_HOME/cmdline-tools $ANDROID_HOME/cmdline-tools-tmp && \
    mkdir -p $ANDROID_HOME/cmdline-tools/latest && \
    mv $ANDROID_HOME/cmdline-tools-tmp/* $ANDROID_HOME/cmdline-tools/latest/ && \
    yes | sdkmanager --licenses > /dev/null 2>&1 && \
    sdkmanager "build-tools;34.0.0" "platforms;android-34" "platform-tools" > /dev/null 2>&1

# Copiar dependências do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json .

# Criar diretórios necessários
RUN mkdir -p uploads builds

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expor porta
EXPOSE 3000

# Start
CMD ["node", "dist/index.js"]
