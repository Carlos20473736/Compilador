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

# Runtime stage - Android SDK + Node.js
FROM ubuntu:22.04

WORKDIR /app

# Variáveis de ambiente
ENV ANDROID_HOME=/opt/android-sdk \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
    GRADLE_HOME=/opt/gradle \
    PATH=$PATH:/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools:/opt/gradle/bin \
    ANDROID_SDK_ROOT=/opt/android-sdk

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    openjdk-17-jdk-headless \
    nodejs \
    npm \
    build-essential \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Criar diretórios do Android SDK
RUN mkdir -p $ANDROID_HOME/cmdline-tools

# Baixar e instalar Android SDK Command-line Tools (versão mais recente)
RUN cd $ANDROID_HOME/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip -q commandlinetools-linux-11076708_latest.zip && \
    rm commandlinetools-linux-11076708_latest.zip && \
    mv cmdline-tools latest

# Aceitar licenças do Android SDK
RUN yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses

# Instalar componentes essenciais do Android SDK
RUN $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \
    "platforms;android-34" \
    "platforms;android-33" \
    "build-tools;34.0.0" \
    "build-tools;33.0.2" \
    "platform-tools" \
    "tools" \
    "ndk;26.1.10909125"

# Baixar e instalar Gradle (versão 8.6)
RUN mkdir -p /opt/gradle && \
    cd /opt/gradle && \
    wget -q https://services.gradle.org/distributions/gradle-8.6-bin.zip && \
    unzip -q gradle-8.6-bin.zip && \
    rm gradle-8.6-bin.zip && \
    mv gradle-8.6 gradle && \
    ln -s gradle gradle-8.6

# Verificar instalações
RUN java -version && \
    $GRADLE_HOME/bin/gradle --version && \
    $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --list_installed

# Copiar build do frontend
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/package.json ./
COPY --from=frontend-builder /app/pnpm-lock.yaml ./

# Copiar código do servidor e configuração
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
