import base64
import os
from google import genai
from google.genai import types
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
from ai import ai_ans,generate_picture,generate_ingredient_suggestions
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
def open():
    """開放頁面"""
    return render_template('open.html')


@app.route('/about')
def about():
    """關於頁面"""
    return render_template('about.html')

@app.route('/index')
def index():
    """首頁 - 積木編輯器"""
    return render_template('index.html')

@app.route('/peding_putato_bounce')
def peding_putato_bounce():
    """開放頁面"""
    return render_template('peding_putato_bounce.html')


@app.route('/trail_and_error')
def trail_and_error():
    """開放頁面"""
    return render_template('trail_and_error.html')

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
        
        ans = ai_ans(blocks,style)
        return jsonify({
            'recipe': ans,
            'status': 'success',
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'生成食譜時發生錯誤: {str(e)}',
            'status': 'error'
        }), 500
    
@app.route('/api/generate-img', methods=['POST'])
def generate_img():
    """生成圖片的 API"""
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({
                'error': '請求格式錯誤',
                'status': 'error'
            }), 400
        
        prompt = data['prompt']
        
        image_b64 = generate_picture(prompt)
        
        if image_b64 is None:
            return jsonify({
                'error': '圖片生成失敗，請稍後再試',
                'status': 'error'
            }), 500
        
        return jsonify({
            'image': image_b64,
            'status': 'success',
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'生成圖片時發生錯誤: {str(e)}',
            'status': 'error'
        }), 500


@app.route('/api/suggest-ingredients', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=60)
@validate_json(['ingredients'])
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
        
        # 生成建議文本
        suggestions_text = generate_ingredient_suggestions(available_ingredients)
        
        return jsonify({
            'suggestions': suggestions_text,
            'status': 'success',
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"生成材料建議時發生錯誤: {str(e)}")
        return jsonify({
            'error': f'生成建議時發生錯誤: {str(e)}',
            'status': 'error'
        }), 500






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
