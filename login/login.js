// login/login.js
document.addEventListener('DOMContentLoaded', function () {
    loadData();
    loadHeader();
    loadFooter();

    // Da dang nhap -> trang home
    if (localStorage.getItem('currentUser')) {
        window.location.href = basePath + 'home/index.html';
        return;
    }

    document.getElementById('login-form')
        .addEventListener('submit', function (e) {
            e.preventDefault();
            clearErrors();

            const email    = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Validate
            let hasError = false;
            if (!email) {
                showFieldError('email', 'Vui lòng nhập email.');
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showFieldError('email', 'Email không hợp lệ.');
                hasError = true;
            }
            if (!password) {
                showFieldError('password', 'Vui lòng nhập mật khẩu.');
                hasError = true;
            }
            if (hasError) return;

            // Xac thuc
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user  = users.find(function (u) {
                return u.email.toLowerCase() === email.toLowerCase()
                    && u.password === password;
            });

            if (!user) {
                showError('Email hoặc mật khẩu không chính xác.');
                return;
            }

            // Dang nhap thanh cong
            localStorage.setItem('currentUser', JSON.stringify(user));
            showSuccess('Đăng nhập thành công! Đang chuyển hướng...');
            setTimeout(function () {
                window.location.href = basePath + 'home/index.html';
            }, 800);
        });
});

function showError(msg) {
    const el = document.getElementById('error-msg');
    el.textContent = msg;
    el.style.display = 'block';
}

function showSuccess(msg) {
    const el = document.getElementById('success-msg');
    el.textContent = msg;
    el.style.display = 'block';
}

function showFieldError(field, msg) {
    const input = document.getElementById(field);
    const err   = document.getElementById('err-' + field);
    if (input) input.classList.add('is-error');
    if (err)   { err.textContent = msg; err.style.display = 'block'; }
}

function clearErrors() {
    document.getElementById('error-msg').style.display   = 'none';
    document.getElementById('success-msg').style.display = 'none';
    document.querySelectorAll('.field-error').forEach(function (el) {
        el.textContent = ''; el.style.display = 'none';
    });
    document.querySelectorAll('.is-error').forEach(function (el) {
        el.classList.remove('is-error');
    });
}