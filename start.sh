#!/bin/bash

# Flask 應用程式啟動腳本

echo "🚀 正在啟動 SITCONCamp Flask 應用程式..."

# 檢查是否有 .env 檔案
if [ ! -f .env ]; then
    echo "⚠️  找不到 .env 檔案，正在建立..."
    cp .env.example .env
    echo "✅ 已建立 .env 檔案，請編輯該檔案設定您的環境變數"
fi

# 檢查是否安裝了依賴套件
if [ ! -d "venv" ] && [ ! -f "uv.lock" ]; then
    echo "📦 正在安裝依賴套件..."
    
    # 如果有 uv，使用 uv
    if command -v uv &> /dev/null; then
        uv sync
    else
        # 否則使用 pip
        pip install -r requirements.txt
    fi
fi

# 設定環境變數
export FLASK_APP=main.py
export FLASK_ENV=development

echo "🌟 Flask 應用程式已啟動！"
echo "📱 請前往 http://localhost:5000 查看您的應用程式"
echo "🛑 按 Ctrl+C 停止應用程式"

# 啟動應用程式
python main.py
