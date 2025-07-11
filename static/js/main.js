// 主要 JavaScript 功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('SITCONCamp 網站已載入');
    
    // 初始化 Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // 自動隱藏 alert 訊息
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            if (alert.classList.contains('show')) {
                var bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        });
    }, 5000);
});

// API 測試功能
async function testAPI() {
    const responseDiv = document.getElementById('api-response');
    
    // 顯示載入狀態
    responseDiv.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div> 載入中...';
    
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        responseDiv.innerHTML = `
            <h5>API 回應：</h5>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    } catch (error) {
        responseDiv.innerHTML = `
            <div class="text-danger">
                <h5>錯誤：</h5>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// 表單驗證
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    });
    
    return isValid;
}

// 平滑滾動
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 顯示成功訊息
function showSuccessMessage(message) {
    const alertHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.querySelector('.container');
    container.insertAdjacentHTML('afterbegin', alertHTML);
}

// 顯示錯誤訊息
function showErrorMessage(message) {
    const alertHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.querySelector('.container');
    container.insertAdjacentHTML('afterbegin', alertHTML);
}

// 格式化日期
function formatDate(date) {
    return new Intl.DateTimeFormat('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// 載入頁面時顯示當前日期
window.addEventListener('load', function() {
    const dateElements = document.querySelectorAll('.current-date');
    dateElements.forEach(element => {
        element.textContent = formatDate(new Date());
    });
});
