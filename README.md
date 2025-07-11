# SITCONCamp Flask 基本架構

這是一個使用 Flask 框架建立的基本 Web 應用程式架構，包含了現代化的前端界面和完整的後端功能。

## 功能特色

- 🎨 **現代化界面**：使用 Bootstrap 5 打造響應式設計
- 🔗 **RESTful API**：提供 API 端點供前端呼叫
- 📝 **表單處理**：包含聯絡表單和資料驗證
- 🚨 **錯誤處理**：自訂 404 和 500 錯誤頁面
- 🎯 **模板系統**：使用 Jinja2 模板引擎
- 📱 **響應式設計**：支援各種裝置螢幕大小

## 專案結構

```
sitconcamp/
├── main.py                 # 主要應用程式檔案
├── config.py               # 配置檔案
├── pyproject.toml          # 專案設定檔
├── requirements.txt        # Python 依賴套件
├── .env.example           # 環境變數範例
├── README.md              # 專案說明文件
├── templates/             # HTML 模板目錄
│   ├── base.html          # 基礎模板
│   ├── index.html         # 首頁
│   ├── about.html         # 關於頁面
│   ├── contact.html       # 聯絡頁面
│   ├── contact_success.html # 聯絡成功頁面
│   ├── 404.html           # 404 錯誤頁面
│   └── 500.html           # 500 錯誤頁面
└── static/                # 靜態檔案目錄
    ├── css/
    │   └── style.css      # 自訂樣式
    ├── js/
    │   └── main.js        # JavaScript 功能
    └── images/            # 圖片檔案
```

## 安裝與設定

### 1. 安裝依賴套件

```bash
# 使用 uv（推薦）
uv sync

# 或使用 pip
pip install -r requirements.txt
```

### 2. 設定環境變數

```bash
# 複製環境變數範例檔案
cp .env.example .env

# 編輯 .env 檔案，填入您的設定
```

### 3. 執行應用程式

```bash
python main.py
```

應用程式將在 `http://localhost:5000` 上運行。

## 路由說明

| 路由 | 方法 | 說明 |
|------|------|------|
| `/` | GET | 首頁 |
| `/about` | GET | 關於頁面 |
| `/contact` | GET, POST | 聯絡表單 |
| `/contact/success` | GET | 聯絡成功頁面 |
| `/api/data` | GET, POST | API 端點 |

## API 使用範例

### GET 請求
```bash
curl http://localhost:5000/api/data
```

### POST 請求
```bash
curl -X POST http://localhost:5000/api/data \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from API"}'
```

## 自訂功能

### 1. 新增路由

在 `main.py` 中添加新的路由函數：

```python
@app.route('/new-page')
def new_page():
    return render_template('new_page.html')
```

### 2. 建立新模板

在 `templates/` 目錄中建立新的 HTML 檔案：

```html
{% extends "base.html" %}

{% block title %}新頁面 - SITCONCamp{% endblock %}

{% block content %}
<h1>新頁面</h1>
<p>您的內容在這裡...</p>
{% endblock %}
```

### 3. 添加靜態檔案

將 CSS、JavaScript 或圖片檔案放在 `static/` 目錄中，然後在模板中使用：

```html
<link href="{{ url_for('static', filename='css/custom.css') }}" rel="stylesheet">
<script src="{{ url_for('static', filename='js/custom.js') }}"></script>
<img src="{{ url_for('static', filename='images/logo.png') }}" alt="Logo">
```

## 部署

### 使用 Gunicorn

```bash
# 安裝 Gunicorn
pip install gunicorn

# 執行應用程式
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

### 使用 Docker

建立 `Dockerfile`：

```dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "main.py"]
```

## 貢獻

歡迎提交 Pull Request 或開 Issue 來改善這個專案。

## 授權

本專案採用 MIT 授權條款。