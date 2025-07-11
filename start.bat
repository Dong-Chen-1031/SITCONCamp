@echo off
REM Flask 應用程式啟動腳本 (Windows 版本)

echo 🚀 正在啟動 SITCONCamp Flask 應用程式...

REM 檢查是否有 .env 檔案
if not exist .env (
    echo ⚠️  找不到 .env 檔案，正在建立...
    copy .env.example .env
    echo ✅ 已建立 .env 檔案，請編輯該檔案設定您的環境變數
)

REM 檢查是否安裝了依賴套件
if not exist venv if not exist uv.lock (
    echo 📦 正在安裝依賴套件...
    
    REM 如果有 uv，使用 uv
    where uv >nul 2>nul
    if %errorlevel% equ 0 (
        uv sync
    ) else (
        REM 否則使用 pip
        pip install -r requirements.txt
    )
)

REM 設定環境變數
set FLASK_APP=main.py
set FLASK_ENV=development

echo 🌟 Flask 應用程式已啟動！
echo 📱 請前往 http://localhost:5000 查看您的應用程式
echo 🛑 按 Ctrl+C 停止應用程式

REM 啟動應用程式
python main.py

pause
