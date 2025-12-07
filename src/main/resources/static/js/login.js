// 登录页面逻辑
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleLink = document.getElementById('toggleLink');
const toggleText = document.getElementById('toggleText');
const errorAlert = document.getElementById('errorAlert');
const successAlert = document.getElementById('successAlert');

let isLoginMode = true;

// 切换登录/注册表单
toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        toggleText.textContent = '还没有账号？';
        toggleLink.textContent = '立即注册';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        toggleText.textContent = '已有账号？';
        toggleLink.textContent = '返回登录';
    }
    hideAlerts();
});

// 显示错误信息
function showError(message) {
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    successAlert.style.display = 'none';
}

// 显示成功信息
function showSuccess(message) {
    successAlert.textContent = message;
    successAlert.style.display = 'block';
    errorAlert.style.display = 'none';
}

// 隐藏提示
function hideAlerts() {
    errorAlert.style.display = 'none';
    successAlert.style.display = 'none';
}

// 登录处理
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlerts();
    
    const username = loginForm.querySelector('input[name="username"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value;
    
    if (!username || !password) {
        showError('请填写用户名和密码');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 保存用户信息到 localStorage
            localStorage.setItem('user', JSON.stringify(result.user));
            showSuccess('登录成功，正在跳转...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showError(result.message || '登录失败');
        }
    } catch (error) {
        console.error('登录错误：', error);
        showError('网络错误，请稍后重试');
    }
});

// 注册处理
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlerts();
    
    const username = registerForm.querySelector('input[name="username"]').value.trim();
    const password = registerForm.querySelector('input[name="password"]').value;
    const confirmPassword = registerForm.querySelector('input[name="confirmPassword"]').value;
    
    if (!username || !password) {
        showError('请填写用户名和密码');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('两次输入的密码不一致');
        return;
    }
    
    if (password.length < 6) {
        showError('密码长度至少6位');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('注册成功，请登录');
            // 切换到登录表单
            setTimeout(() => {
                toggleLink.click();
            }, 1500);
        } else {
            showError(result.message || '注册失败');
        }
    } catch (error) {
        console.error('注册错误：', error);
        showError('网络错误，请稍后重试');
    }
});

// 检查是否已登录
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user) {
        // 已登录，跳转到首页
        window.location.href = 'index.html';
    }
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', checkAuth);
