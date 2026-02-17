#!/bin/bash

# Script de instalação automática do Android SDK
# Uso: bash scripts/install-android-sdk.sh

set -e

echo "🤖 Instalando Android SDK..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações
ANDROID_SDK_ROOT="${ANDROID_HOME:-/opt/android-sdk}"
JAVA_VERSION="17"

# Função para imprimir mensagens
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then 
    print_error "Este script precisa ser executado como root (use sudo)"
    exit 1
fi

# Atualizar pacotes
print_step "Atualizando pacotes do sistema..."
apt-get update
apt-get upgrade -y

# Instalar Java 17
print_step "Instalando Java 17..."
apt-get install -y openjdk-17-jdk-headless

# Verificar Java
java_version=$(java -version 2>&1 | grep -oP '(?<=version ")[^"]*')
print_success "Java instalado: $java_version"

# Criar diretório do Android SDK
print_step "Criando diretório do Android SDK em $ANDROID_SDK_ROOT..."
mkdir -p "$ANDROID_SDK_ROOT"
chmod 777 "$ANDROID_SDK_ROOT"

# Baixar Android SDK Command Line Tools
print_step "Baixando Android SDK Command Line Tools..."
cd "$ANDROID_SDK_ROOT"
wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
print_success "Download concluído"

# Extrair
print_step "Extraindo Command Line Tools..."
unzip -q commandlinetools-linux-9477386_latest.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
rm -rf commandlinetools-linux-9477386_latest.zip

# Configurar PATH
print_step "Configurando variáveis de ambiente..."
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# Aceitar licenças
print_step "Aceitando licenças do Android SDK..."
yes | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --licenses > /dev/null 2>&1

# Instalar componentes essenciais
print_step "Instalando componentes do Android SDK..."
"$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0" \
    "ndk;27.0.12077973" \
    "cmake;3.22.1" \
    > /dev/null 2>&1

print_success "Componentes instalados"

# Corrigir permissões
print_step "Corrigindo permissões..."
chmod -R 777 "$ANDROID_SDK_ROOT"

# Criar arquivo de configuração
print_step "Criando arquivo de configuração..."
cat > /etc/profile.d/android-sdk.sh << EOF
export ANDROID_HOME=$ANDROID_SDK_ROOT
export PATH=\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools:\$PATH
EOF

# Configurar JAVA_HOME
print_step "Configurando JAVA_HOME..."
cat > /etc/profile.d/java-home.sh << EOF
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=\$JAVA_HOME/bin:\$PATH
EOF

# Verificar instalação
print_step "Verificando instalação..."
source /etc/profile.d/android-sdk.sh
source /etc/profile.d/java-home.sh

sdkmanager_version=$("$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --version 2>&1 | head -1)
print_success "SDK Manager: $sdkmanager_version"

# Resumo
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Android SDK instalado com sucesso!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📍 Localização: $ANDROID_SDK_ROOT"
echo "☕ Java: $(java -version 2>&1 | grep -oP '(?<=version ")[^"]*')"
echo "🔧 Componentes instalados:"
echo "   - Platform Tools"
echo "   - Android 34 (API Level 34)"
echo "   - Build Tools 34.0.0"
echo "   - NDK 27.0.12077973"
echo "   - CMake 3.22.1"
echo ""
echo "Para usar em novos shells, execute:"
echo "  source /etc/profile.d/android-sdk.sh"
echo "  source /etc/profile.d/java-home.sh"
echo ""
