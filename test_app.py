#!/usr/bin/env python3
"""
測試 AI 食譜生成器應用程式
"""
import os
import sys
from flask import Flask, render_template, jsonify, request
from datetime import datetime

# 創建簡單的測試應用程式
app = Flask(__name__)
app.config['SECRET_KEY'] = 'test-secret-key'

@app.route('/')
def index():
    """首頁 - 積木編輯器"""
    return render_template('index.html')

@app.route('/about')
def about():
    """關於頁面"""
    return render_template('about.html')

@app.route('/contact')
def contact():
    """聯絡頁面"""
    return render_template('contact.html')

@app.route('/api/generate-recipe', methods=['POST'])
def generate_recipe():
    """生成食譜的測試 API"""
    try:
        data = request.get_json()
        
        if not data or 'blocks' not in data:
            return jsonify({
                'error': '請求格式錯誤',
                'status': 'error'
            }), 400
        
        blocks = data['blocks']
        style = data.get('style', '正式')
        
        # 模擬食譜生成（因為沒有真正的 AI API）
        mock_recipe = {
            'name': f'AI 創意料理（{style}風格）',
            'ingredients': [
                '主要食材（根據積木內容）',
                '調味料 適量',
                '油 1大匙',
                '鹽 少許'
            ],
            'steps': [
                '準備所有材料',
                '按照積木順序進行操作',
                '適時調味',
                '完成後擺盤'
            ],
            'cooking_time': '約 30 分鐘',
            'servings': '2-3 人份',
            'difficulty': '中等',
            'tips': '這是一道模擬的創意料理，實際操作時請注意安全！',
            'style': style,
            'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # 根據積木內容調整食譜
        if blocks:
            mock_recipe['steps'] = [f"步驟 {i+1}: 根據積木內容執行" for i in range(len(blocks))]
        
        return jsonify({
            'recipe': mock_recipe,
            'status': 'success',
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'生成食譜時發生錯誤: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/validate-recipe', methods=['POST'])
def validate_recipe():
    """驗證食譜安全性（模擬）"""
    try:
        data = request.get_json()
        
        # 模擬驗證結果
        validation_result = {
            'safety_score': 7,
            'feasibility_score': 8,
            'nutrition_score': 6,
            'death_risk': '低',
            'diarrhea_risk': '低',
            'warnings': ['這是模擬驗證，實際操作請謹慎'],
            'suggestions': ['建議諮詢專業廚師', '注意食材新鮮度']
        }
        
        return jsonify({
            'validation': validation_result,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': f'驗證食譜時發生錯誤: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/suggest-ingredients', methods=['POST'])
def suggest_ingredients():
    """根據材料建議食譜（模擬）"""
    try:
        data = request.get_json()
        available_ingredients = data.get('ingredients', [])
        
        # 模擬建議
        suggestions = [
            {
                'name': '快速炒菜',
                'additional_ingredients': ['蒜頭', '醬油'],
                'steps': ['洗菜', '切菜', '下鍋炒製', '調味'],
                'time': '15分鐘'
            },
            {
                'name': '簡單湯品',
                'additional_ingredients': ['高湯', '調料'],
                'steps': ['準備食材', '煮水', '下料', '調味'],
                'time': '20分鐘'
            }
        ]
        
        return jsonify({
            'suggestions': suggestions,
            'status': 'success'
        })
        
    except Exception as e:
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
    print("🍳 AI 食譜生成器 - 測試模式")
    print("=" * 50)
    print("這是一個測試版本，不需要真正的 AI API")
    print("可以測試所有前端功能和 UI 交互")
    print("=" * 50)
    print("啟動位置: http://localhost:5000")
    print("按 Ctrl+C 停止服務")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
