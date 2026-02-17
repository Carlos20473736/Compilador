#!/bin/bash

set -e

echo "🚀 Setup Automático - Android Compiler no Railway"
echo "=================================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando Railway CLI...${NC}"
    npm install -g @railway/cli
fi

# Gerar .env
echo -e "${YELLOW}🔧 Gerando arquivo .env...${NC}"
node scripts/generate-env.mjs

# Fazer login no Railway
echo ""
echo -e "${YELLOW}🔐 Fazendo login no Railway...${NC}"
railway login

# Inicializar projeto
echo ""
echo -e "${YELLOW}📝 Inicializando projeto Railway...${NC}"
railway init

# Adicionar variáveis de ambiente
echo ""
echo -e "${YELLOW}🔐 Configurando variáveis de ambiente...${NC}"

# Ler .env e adicionar ao Railway
while IFS='=' read -r key value; do
    if [ ! -z "$key" ] && [[ ! "$key" =~ ^# ]]; then
        if [ ! -z "$value" ]; then
            echo "  ✓ Adicionando $key"
            railway variables set "$key" "$value"
        fi
    fi
done < .env

# Deploy
echo ""
echo -e "${YELLOW}🚀 Iniciando deploy...${NC}"
railway up

echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo "📊 Seu app está rodando em:"
railway status

echo ""
echo -e "${GREEN}💡 Próximos passos:${NC}"
echo "  1. Acesse seu app no Railway"
echo "  2. Configure as variáveis AWS/GitHub se necessário"
echo "  3. Teste o upload de um projeto Android"
echo ""
