from flask import Flask, render_template, request, jsonify, redirect, url_for, flash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'


@app.route('/')
def index():
    """首頁"""
    return render_template('index.html')


@app.route('/about')
def about():
    """關於頁面"""
    return render_template('about.html')


@app.route('/api/data', methods=['GET', 'POST'])
def api_data():
    """API 端點範例"""
    if request.method == 'GET':
        return jsonify({
            'message': 'Hello from Flask API!',
            'status': 'success'
        })
    elif request.method == 'POST':
        data = request.get_json()
        return jsonify({
            'message': 'Data received successfully',
            'received_data': data,
            'status': 'success'
        })


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
        
        # 這裡可以加入處理表單的邏輯
        # 例如：儲存到資料庫、發送郵件等
        flash(f'感謝您的來信，{name}！我們會盡快回覆您。', 'success')
        
        return redirect(url_for('contact_success'))
    
    return render_template('contact.html')


@app.route('/contact/success')
def contact_success():
    """聯絡成功頁面"""
    return render_template('contact_success.html')


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
