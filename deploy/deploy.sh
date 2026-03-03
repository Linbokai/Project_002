#!/bin/bash
set -e

SERVER_USER="fy-linbokai"
SERVER_IP="106.15.191.84"
REMOTE_DIR="~/ai-model-hub"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "========== 1/4 构建项目 =========="
cd "$PROJECT_DIR"
pnpm build

echo "========== 2/4 打包构建产物 =========="
tar -czf deploy/ai-model-hub.tar.gz dist/

echo "========== 3/4 上传到服务器 =========="
scp deploy/ai-model-hub.tar.gz "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

echo "========== 4/4 服务器解压并重启 =========="
ssh "$SERVER_USER@$SERVER_IP" "cd $REMOTE_DIR && tar -xzf ai-model-hub.tar.gz && bash deploy/setup.sh"

echo ""
echo "========== 部署完成 =========="
