from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
import json
import os
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from functools import wraps
import re
from config import SYSTEM_PROMPT
import time
import dotenv

# 設定日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

# 設定 Gemini API
api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    logger.warning("GEMINI_API_KEY 環境變數未設定，使用預設值")

# 請求限制裝飾器
def rate_limit(max_requests=10, window_seconds=60):
    """簡單的請求限制裝飾器"""
    request_times = []
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            # 清理過期的請求記錄
            request_times[:] = [t for t in request_times if now - t < window_seconds]
            
            if len(request_times) >= max_requests:
                return jsonify({
                    'error': '請求過於頻繁，請稍後再試',
                    'status': 'rate_limit_exceeded'
                }), 429
            
            request_times.append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator

# 輸入驗證裝飾器
def validate_json(required_fields=None):
    """JSON 輸入驗證裝飾器"""
    if required_fields is None:
        required_fields = []
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return jsonify({
                    'error': '請求必須是 JSON 格式',
                    'status': 'invalid_format'
                }), 400
            
            data = request.get_json()
            if not data:
                return jsonify({
                    'error': '請求內容不能為空',
                    'status': 'empty_request'
                }), 400
            
            # 檢查必需欄位
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    'error': f'缺少必要欄位: {", ".join(missing_fields)}',
                    'status': 'missing_fields'
                }), 400
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


@app.route('/')
def index():
    """首頁 - 積木編輯器"""
    return render_template('index.html')


@app.route('/about')
def about():
    """關於頁面"""
    return render_template('about.html')

@app.route('/open')
def open():
    """開放頁面"""
    return render_template('open.html')


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    """聯絡表單"""
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        
        # 簡單的表單驗證
        if not name or not email or not message:
            flash('請填寫所有欄位', 'error')
            return render_template('contact.html')
        
        flash(f'感謝您的來信，{name}！我們會盡快回覆您。', 'success')
        return redirect(url_for('contact_success'))
    
    return render_template('contact.html')


@app.route('/contact/success')
def contact_success():
    """聯絡成功頁面"""
    return render_template('contact_success.html')


@app.route('/api/generate-recipe', methods=['POST'])
def generate_recipe():
    """生成分析的主要 API"""
    try:
        data = request.get_json()
        
        if not data or 'blocks' not in data:
            return jsonify({
                'error': '請求格式錯誤',
                'status': 'error'
            }), 400
        
        blocks = data['blocks']
        style = data.get('style', '正式')  # 預設正式風格
        
        # 將積木轉換為自然語言描述
        steps_description = blocks_to_description(blocks)
        
        # 生成 AI 食譜
        recipe = generate_ai_ans(steps_description, style)
        
        return jsonify({
            'recipe': recipe,
            'status': 'success',
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'生成食譜時發生錯誤: {str(e)}',
            'status': 'error'
        }), 500


@app.route('/api/suggest-ingredients', methods=['POST'])
def suggest_ingredients():
    """根據現有材料建議食譜"""
    try:
        data = request.get_json()
        available_ingredients = data.get('ingredients', [])
        
        if not available_ingredients:
            return jsonify({
                'error': '請提供可用材料',
                'status': 'error'
            }), 400
        
        # 生成建議食譜
        suggestions = generate_ingredient_suggestions(available_ingredients)
        
        return jsonify({
            'suggestions': suggestions,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': f'生成建議時發生錯誤: {str(e)}',
            'status': 'error'
        }), 500


def blocks_to_description(blocks: List[Dict[str, Any]]) -> str:
    """將積木陣列轉換為自然語言描述"""
    descriptions = []
    
    for i, block in enumerate(blocks, 1):
        if 'description' in block:
            # 自由輸入積木
            descriptions.append(f"{i}. {block['description']}")
        else:
            # 結構化積木
            action = block.get('action', '')
            ingredient = block.get('ingredient', '')
            time = block.get('time', '')
            
            desc = f"{i}. {action}"
            if ingredient:
                desc += f" {ingredient}"
            if time:
                desc += f"，{time}"
            
            descriptions.append(desc)
    
    return '\n'.join(descriptions)

# To run this code you need to install the following dependencies:
# pip install google-genai

import base64
import os
from google import genai
from google.genai import types


client = genai.Client(
    api_key=api_key,
)

model = "gemini-2.5-flash"
contents = [
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text=SYSTEM_PROMPT),
        ],
    ),
]
def generate():
    generate_content_config = types.GenerateContentConfig(
        thinking_config = types.ThinkingConfig(
            thinking_budget=-1,
        ),
        response_mime_type="application/json",
        response_schema=genai.types.Schema(
            type = genai.types.Type.OBJECT,
            properties = {
                "食譜名稱": genai.types.Schema(
                    type = genai.types.Type.STRING,
                ),
                "料理過後的結果": genai.types.Schema(
                    type = genai.types.Type.STRING,
                ),
                "腹瀉率％": genai.types.Schema(
                    type = genai.types.Type.NUMBER,
                ),
                "飽食度％": genai.types.Schema(
                    type = genai.types.Type.NUMBER,
                ),
                "綜合評分（1-10）": genai.types.Schema(
                    type = genai.types.Type.INTEGER,
                ),
                "可改進之處": genai.types.Schema(
                    type = genai.types.Type.STRING,
                ),
                "整體總結": genai.types.Schema(
                    type = genai.types.Type.STRING,
                ),
                "生成食物照片的prompt": genai.types.Schema(
                    type = genai.types.Type.STRING,
                ),
                "食品安全性（1-10分）": genai.types.Schema(
                    type = genai.types.Type.INTEGER,
                ),
                "各項內容整體原因分析": genai.types.Schema(
                    type = genai.types.Type.STRING,
                ),
                "操作可行性（1-10分）": genai.types.Schema(
                    type = genai.types.Type.INTEGER,
                ),
                "營養合理性（1-10分）": genai.types.Schema(
                    type = genai.types.Type.INTEGER,
                ),
                "死亡風險評估（低/中/高）": genai.types.Schema(
                    type = genai.types.Type.STRING,
                    enum = ["低", "中", "高"],
                ),
                "腹瀉風險評估（低/中/高）": genai.types.Schema(
                    type = genai.types.Type.STRING,
                    enum = ["低", "中", "高"],
                ),
            },
        ),
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        print(chunk.text, end="")


def generate_ai_ans(steps: str, style: str = '正式') -> Dict[str, Any]:
    """使用 AI 生成完整食譜"""
    
    style_prompts = {
        '正式': '請用專業、正式的語氣',
        '幽默': '請用幽默、有趣的語氣',
        '詩意': '請用詩意、文藝的語氣',
        '科學': '請用科學、理性的語氣分析',
        '瘋狂': '請用瘋狂、誇張的語氣'
    }
    
    style_prompt = style_prompts.get(style, '請用正式的語氣')
    
    prompt = f"""
    {style_prompt}，根據以下步驟生成一份完整的食譜：

    步驟：
    {steps}

    請生成包含以下內容的食譜：
    1. 食譜名稱（創意且吸引人）
    2. 材料清單（包含份量）
    3. 詳細步驟說明
    4. 預計烹飪時間
    5. 建議份量
    6. 難度等級
    7. 小貼士或注意事項

    請以 JSON 格式回覆，格式如下：
    驗證食譜的安全性和合理性
    
    請評估以下食譜的安全性和合理性：

    食譜內容：

    請從以下角度進行評估：
    1. 食品安全性（1-10分）
    2. 操作可行性（1-10分）
    3. 營養合理性（1-10分）
    4. 死亡風險評估（低/中/高）
    5. 腹瀉風險評估（低/中/高）
    6. 具體建議和警告

    請以 JSON 格式回覆：
    {{
        "safety_score": 8,
        "feasibility_score": 7,
        "nutrition_score": 6,
        "death_risk": "低",
        "diarrhea_risk": "中",
        "warnings": ["警告1", "警告2"],
        "suggestions": ["建議1", "建議2"]
    }}
    {{
        "name": "食譜名稱",
        "ingredients": ["材料1", "材料2"],
        "steps": ["步驟1", "步驟2"],
        "cooking_time": "總時間",
        "servings": "份量",
        "difficulty": "難度",
        "tips": "小貼士"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        
        # 嘗試解析 JSON 回應
        recipe_text = response.text
        
        # 清理回應中的 markdown 標記
        if '```json' in recipe_text:
            recipe_text = recipe_text.split('```json')[1].split('```')[0].strip()
        elif '```' in recipe_text:
            recipe_text = recipe_text.split('```')[1].strip()
        
        recipe_data = json.loads(recipe_text)
        
        # 添加額外資訊
        recipe_data['original_steps'] = steps
        recipe_data['style'] = style
        recipe_data['generated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        return recipe_data
        
    except json.JSONDecodeError:
        # 如果 JSON 解析失敗，返回基本格式
        return {
            'name': '創意料理',
            'ingredients': ['請參考原始步驟'],
            'steps': steps.split('\n'),
            'cooking_time': '依步驟而定',
            'servings': '1-2人份',
            'difficulty': '中等',
            'tips': '請小心操作，注意安全',
            'raw_response': response.text,
            'style': style,
            'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        return {
            'name': '錯誤食譜',
            'error': str(e),
            'ingredients': [],
            'steps': [],
            'cooking_time': '未知',
            'servings': '未知',
            'difficulty': '未知',
            'tips': '生成過程中發生錯誤'
        }


def validate_recipe_safety(recipe_text: str) -> Dict[str, Any]:
    """驗證食譜的安全性和合理性"""
    
    prompt = f"""
    請評估以下食譜的安全性和合理性：

    食譜內容：
    {recipe_text}

    請從以下角度進行評估：
    1. 食品安全性（1-10分）
    2. 操作可行性（1-10分）
    3. 營養合理性（1-10分）
    4. 死亡風險評估（低/中/高）
    5. 腹瀉風險評估（低/中/高）
    6. 具體建議和警告

    請以 JSON 格式回覆：
    {{
        "safety_score": 8,
        "feasibility_score": 7,
        "nutrition_score": 6,
        "death_risk": "低",
        "diarrhea_risk": "中",
        "warnings": ["警告1", "警告2"],
        "suggestions": ["建議1", "建議2"]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text
        
        # 清理回應
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0].strip()
        elif '```' in result_text:
            result_text = result_text.split('```')[1].strip()
        
        return json.loads(result_text)
        
    except:
        return {
            'safety_score': 5,
            'feasibility_score': 5,
            'nutrition_score': 5,
            'death_risk': '中',
            'diarrhea_risk': '中',
            'warnings': ['無法評估，請謹慎操作'],
            'suggestions': ['建議諮詢專業人士']
        }


def generate_ingredient_suggestions(ingredients: List[str]) -> List[Dict[str, Any]]:
    """根據現有材料生成建議食譜"""
    
    ingredients_text = ', '.join(ingredients)
    
    prompt = f"""
    我家現在有這些材料：{ingredients_text}

    請建議3個不同的食譜，每個食譜包含：
    1. 食譜名稱
    2. 需要額外購買的材料
    3. 簡單的製作步驟
    4. 預計時間

    請以 JSON 格式回覆：
    {{
        "suggestions": [
            {{
                "name": "食譜名稱",
                "additional_ingredients": ["需要買的材料"],
                "steps": ["步驟1", "步驟2"],
                "time": "30分鐘"
            }}
        ]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text
        
        # 清理回應
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0].strip()
        elif '```' in result_text:
            result_text = result_text.split('```')[1].strip()
        
        result = json.loads(result_text)
        return result.get('suggestions', [])
        
    except:
        return [{
            'name': '簡單料理',
            'additional_ingredients': ['鹽', '油'],
            'steps': ['清洗材料', '簡單調理'],
            'time': '30分鐘'
        }]


@app.errorhandler(404)
def not_found(error):
    """404 錯誤處理"""
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    """500 錯誤處理"""
    return render_template('500.html'), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
