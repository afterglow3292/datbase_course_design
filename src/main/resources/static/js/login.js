// 登录页面逻辑
console.log('login.js 加载');

// 立即执行：检查是否需要跳转（在DOM加载前执行）
(function() {
    console.log('立即执行检查登录状态...');
    
    // 检查URL参数，如果有logout参数则清除登录状态
    const urlParams = new URLSearchParams(window.location.search);
    const isLogout = urlParams.get('logout') === 'true';
    
    console.log('isLogout:', isLogout);
    console.log('当前localStorage user:', localStorage.getItem('user'));
    
    // 如果是退出登录，清除用户信息
    if (isLogout) {
        console.log('检测到logout参数，清除用户信息');
        localStorage.removeItem('user');
        // 清除URL参数
        window.history.replaceState({}, document.title, 'login.html');
        return; // 不跳转，停留在登录页
    }
    
    // 验证用户信息是否有效
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        console.log('没有用户信息，停留在登录页');
        return; // 没有用户信息，停留在登录页
    }
    
    try {
        const user = JSON.parse(userStr);
        console.log('解析用户信息:', user);
        // 验证user对象是否有效（必须有username字段且不为空）
        if (user && typeof user === 'object' && user.username && user.username.trim() !== '') {
            console.log('用户已登录，跳转到首页');
            window.location.href = 'index.html';
        } else {
            console.log('用户信息无效，清除并停留在登录页');
            localStorage.removeItem('user');
        }
    } catch (e) {
        console.error('用户信息解析失败:', e);
        localStorage.removeItem('user');
    }
})();

// DOM加载完成后初始化表单
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化表单');
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleLink = document.getElementById('toggleLink');
    const toggleText = document.getElementById('toggleText');
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');

    let isLoginMode = true;

    // 切换登录/注册表单
    if (toggleLink) {
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
    }

    // 显示错误信息
    function showError(message) {
        if (errorAlert) {
            errorAlert.textContent = message;
            errorAlert.style.display = 'block';
        }
        if (successAlert) {
            successAlert.style.display = 'none';
        }
    }

    // 显示成功信息
    function showSuccess(message) {
        if (successAlert) {
            successAlert.textContent = message;
            successAlert.style.display = 'block';
        }
        if (errorAlert) {
            errorAlert.style.display = 'none';
        }
    }

    // 隐藏提示
    function hideAlerts() {
        if (errorAlert) errorAlert.style.display = 'none';
        if (successAlert) successAlert.style.display = 'none';
    }

    // 登录处理
    if (loginForm) {
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
    }

    // 注册处理
    if (registerForm) {
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
                        if (toggleLink) toggleLink.click();
                    }, 1500);
                } else {
                    showError(result.message || '注册失败');
                }
            } catch (error) {
                console.error('注册错误：', error);
                showError('网络错误，请稍后重试');
            }
        });
    }
});
