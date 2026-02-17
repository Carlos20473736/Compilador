#!/bin/bash

set -e

echo "🏠 Setup Local - Android Compiler"
echo "=================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado${NC}"
    echo "   Instale de: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando pnpm...${NC}"
    npm install -g pnpm
fi

echo -e "${GREEN}✓ pnpm $(pnpm -v)${NC}"

# Instalar dependências
echo ""
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
pnpm install

# Gerar .env
echo ""
echo -e "${YELLOW}🔧 Gerando arquivo .env...${NC}"
node scripts/generate-env.mjs

# Criar diretórios necessários
echo ""
echo -e "${YELLOW}📁 Criando diretórios...${NC}"
mkdir -p uploads builds

# Build
echo ""
echo -e "${YELLOW}🔨 Fazendo build...${NC}"
pnpm run build

echo ""
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo ""
echo -e "${GREEN}💡 Para iniciar o servidor:${NC}"
echo "   pnpm run dev     (desenvolvimento)"
echo "   pnpm start       (produção)"
echo ""
echo -e "${GREEN}📝 Arquivo .env foi criado em: .env${NC}"
echo "   Configure as variáveis AWS/GitHub conforme necessário"
echo ""
