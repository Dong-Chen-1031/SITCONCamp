import os
from typing import Optional

class Config:
    """基本配置類別"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    
    # 資料庫配置
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    
    # 郵件配置
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    
    # 上傳檔案配置
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    
    # 分頁配置
    POSTS_PER_PAGE = 10
    
    # 其他配置
    DEBUG = os.environ.get('DEBUG', 'false').lower() in ['true', 'on', '1']
    TESTING = False


class DevelopmentConfig(Config):
    """開發環境配置"""
    DEBUG = True


class ProductionConfig(Config):
    """生產環境配置"""
    DEBUG = False
    
    # 生產環境應該使用更安全的密鑰
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'production-secret-key'


class TestingConfig(Config):
    """測試環境配置"""
    TESTING = True
    WTF_CSRF_ENABLED = False
    DATABASE_URL = 'sqlite:///:memory:'


# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
