// 主要 JavaScript 功能 - 配合 Tailwind CSS
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SITCONCamp 網站已載入');
    
    // 行動裝置選單功能
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // 自動隱藏 Flash 訊息
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(function(message) {
        setTimeout(function() {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-20px)';
            setTimeout(function() {
                message.remove();
            }, 300);
        }, 5000);
    });
    
    // 平滑滾動效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 表單驗證增強
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('form-error')) {
                    validateInput(this);
                }
            });
        });
    });
});

// API 測試功能
async function testAPI() {
    const responseDiv = document.getElementById('api-response');
    
    if (!responseDiv) return;
    
    // 顯示載入狀態
    responseDiv.innerHTML = `
        <div class="flex items-center justify-center h-24">
            <div class="loading-spinner mr-3"></div>
            <span class="text-gray-600">載入中...</span>
        </div>
    `;
    
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        responseDiv.innerHTML = `
            <h5 class="text-lg font-semibold mb-2 text-gray-800">API 回應：</h5>
            <pre class="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">${JSON.stringify(data, null, 2)}</pre>
        `;
        
        // 添加成功動畫
        responseDiv.classList.add('animate-fade-in');
        
    } catch (error) {
        responseDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex">
                    <svg class="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                        <h5 class="text-red-800 font-medium">錯誤</h5>
                        <p class="text-red-700 text-sm">${error.message}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// 表單驗證函數
function validateInput(input) {
    const value = input.value.trim();
    const isRequired = input.hasAttribute('required');
    const type = input.type;
    
    // 移除現有的錯誤樣式
    input.classList.remove('form-error', 'form-success');
    
    // 移除現有的錯誤訊息
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    let isValid = true;
    let errorMessage = '';
    
    // 必填欄位驗證
    if (isRequired && !value) {
        isValid = false;
        errorMessage = '此欄位為必填';
    }
    
    // 電子郵件驗證
    if (type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = '請輸入有效的電子郵件地址';
    }
    
    // 應用樣式
    if (isValid) {
        input.classList.add('form-success');
    } else {
        input.classList.add('form-error');
        showInputError(input, errorMessage);
    }
    
    return isValid;
}

// 顯示輸入錯誤訊息
function showInputError(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
}

// 電子郵件驗證
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 顯示成功訊息
function showSuccessMessage(message) {
    const alertHTML = `
        <div class="flash-message bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div class="flex">
                <svg class="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <p class="text-green-800">${message}</p>
                </div>
            </div>
        </div>
    `;
    
    const container = document.querySelector('main');
    if (container) {
        container.insertAdjacentHTML('afterbegin', alertHTML);
    }
}

// 顯示錯誤訊息
function showErrorMessage(message) {
    const alertHTML = `
        <div class="flash-message bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div class="flex">
                <svg class="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <p class="text-red-800">${message}</p>
                </div>
            </div>
        </div>
    `;
    
    const container = document.querySelector('main');
    if (container) {
        container.insertAdjacentHTML('afterbegin', alertHTML);
    }
}

// 格式化日期
function formatDate(date) {
    return new Intl.DateTimeFormat('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// 複製到剪貼板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showSuccessMessage('已複製到剪貼板');
    }, function(err) {
        showErrorMessage('複製失敗：' + err);
    });
}

// 節流函數
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    }
}

// 防抖函數
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// 滾動到頂部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 檢查元素是否在可視範圍內
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 載入頁面時顯示當前日期
window.addEventListener('load', function() {
    const dateElements = document.querySelectorAll('.current-date');
    dateElements.forEach(element => {
        element.textContent = formatDate(new Date());
    });
    
    // 添加淡入動畫到所有卡片
    const cards = document.querySelectorAll('.card-hover');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('animate-fade-in');
        }, index * 100);
    });
});

// 處理表單提交
document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.tagName === 'FORM') {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            // 顯示載入狀態
            const originalText = submitButton.textContent;
            submitButton.innerHTML = `
                <div class="loading-spinner mr-2"></div>
                處理中...
            `;
            submitButton.disabled = true;
            
            // 如果是聯絡表單，5秒後恢復按鈕
            setTimeout(() => {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }, 5000);
        }
    }
});

// 監聽窗口大小變化
window.addEventListener('resize', debounce(function() {
    // 在這裡處理響應式相關的邏輯
    console.log('視窗大小已改變');
}, 250));

// 錯誤處理
window.addEventListener('error', function(e) {
    console.error('發生錯誤:', e.error);
    // 可以在這裡發送錯誤報告到服務器
});

// 處理未捕獲的 Promise 錯誤
window.addEventListener('unhandledrejection', function(e) {
    console.error('未處理的 Promise 錯誤:', e.reason);
    // 可以在這裡發送錯誤報告到服務器
});
