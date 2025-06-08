#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否存在certs目录
if [ ! -d "certs" ]; then
  mkdir -p certs
  echo -e "${BLUE}📁 创建certs目录${NC}"
fi

# 检查是否已存在证书
if [ -f "certs/localhost.key" ] && [ -f "certs/localhost.crt" ]; then
  echo -e "${GREEN}✅ 证书文件已存在${NC}"
else
  echo -e "${YELLOW}🔄 需要生成证书...${NC}"
  
  # 检查是否安装了mkcert
  if ! command -v mkcert &> /dev/null; then
    echo -e "${YELLOW}⚠️ 未安装mkcert，尝试安装...${NC}"
    
    # 检测操作系统并安装mkcert
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      if command -v brew &> /dev/null; then
        echo -e "${BLUE}📦 使用Homebrew安装mkcert...${NC}"
        brew install mkcert
      else
        echo -e "${RED}❌ 请先安装Homebrew，然后再运行此脚本${NC}"
        exit 1
      fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
      # Linux
      if command -v apt &> /dev/null; then
        echo -e "${BLUE}📦 使用apt安装mkcert...${NC}"
        sudo apt install mkcert
      else
        echo -e "${RED}❌ 请手动安装mkcert后再运行此脚本${NC}"
        exit 1
      fi
    elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "win"* ]]; then
      # Windows
      echo -e "${RED}❌ Windows系统请使用Chocolatey手动安装mkcert:${NC}"
      echo "choco install mkcert"
      exit 1
    else
      echo -e "${RED}❌ 未知操作系统，请手动安装mkcert${NC}"
      exit 1
    fi
  fi
  
  # 安装mkcert CA
  echo -e "${BLUE}🔑 安装mkcert CA...${NC}"
  mkcert -install
  
  # 生成证书
  echo -e "${BLUE}📜 生成本地证书...${NC}"
  mkcert -key-file certs/localhost.key -cert-file certs/localhost.crt localhost 127.0.0.1 ::1 192.168.0.119
  
  echo -e "${GREEN}✅ 证书生成完成！${NC}"
fi

# 确保astro.config.mjs中有Vite HTTPS配置
if ! grep -q "vite:" astro.config.mjs; then
  echo -e "${YELLOW}⚠️ astro.config.mjs中没有找到vite配置，将添加vite配置...${NC}"
  # 在配置文件结尾前添加vite配置
  sed -i.bak '/^})$/i\  vite: {\n    server: {\n      https: {\n        key: '\''./certs/localhost.key'\'',\n        cert: '\''./certs/localhost.crt'\'',\n      }\n    }\n  },' astro.config.mjs
  rm -f astro.config.mjs.bak
  echo -e "${GREEN}✅ vite配置已添加！${NC}"
elif grep -q "// key: './certs/localhost.key'" astro.config.mjs; then
  echo -e "${YELLOW}🔄 更新astro.config.mjs中的证书配置...${NC}"
  # 使用sed替换注释的证书配置
  sed -i.bak 's|// key: \x27\./certs/localhost.key\x27,|key: \x27\./certs/localhost.key\x27,|g' astro.config.mjs
  sed -i.bak 's|// cert: \x27\./certs/localhost.crt\x27,|cert: \x27\./certs/localhost.crt\x27,|g' astro.config.mjs
  rm -f astro.config.mjs.bak
  echo -e "${GREEN}✅ 证书配置已更新！${NC}"
elif ! grep -q "key: './certs/localhost.key'" astro.config.mjs; then
  echo -e "${YELLOW}🔄 更新astro.config.mjs中的https配置...${NC}"
  # 如果https配置存在但没有配置证书，则添加证书配置
  sed -i.bak '/https: {/a\        key: '\''./certs/localhost.key'\'',\n        cert: '\''./certs/localhost.crt'\'',\n' astro.config.mjs
  rm -f astro.config.mjs.bak
  echo -e "${GREEN}✅ 证书配置已添加！${NC}"
else
  echo -e "${GREEN}✅ astro.config.mjs中已有HTTPS证书配置${NC}"
fi

echo -e "${GREEN}🚀 HTTPS证书设置完成！${NC}"
echo -e "${BLUE}💡 请运行 npm run dev 启动HTTPS服务器${NC}" 