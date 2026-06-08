// sign-up/sign-up.js

document.addEventListener('DOMContentLoaded', function () {
    loadData();
    loadHeader();
    loadFooter();

    if (localStorage.getItem('currentUser')) {
        window.location.href = basePath + 'home/index.html';
        return
    }

    document.getElementById('register-form').addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors();

        const fullname = document.getElementById('fullname').value.trim();
        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirm  = document.getElementById('confirm-password').value;

        // validate
        let hasError = false;
        if (!fullname) {
            showFieldError('fullname', 'Vui lòng nhập họ và tên.');
            hasError = true;
        }

        if (!email) {
            showFieldError('enail', 'Vui lòng nhập email.');
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError('email', 'Email không hợp lệ.'); 
            hasError = true;
        }
        
        if (!password) {
            showFieldError('password','Vui lòng nhập mật khẩu');
            hasError = true;
        } else if (password.length < 6) {
            showFieldError('password', 'Mật khẩu tối thiểu 6 ký tự');
            hasError = true;
        }

        if (!confirm) {
            showFieldError('confirm', 'Vui lòng nhập lại mật khẩu');
            hasError = true;
        } else if (confirm !== password) {
            showFieldError('confirm', 'Mật khẩu không khớp');
            hasError = true;
        }

        if (hasError) return;

        // Kiem tra email da ton tai
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) {
            showFieldError('email', 'Email đã được đăng ký');
            return;
        }

        // tao user moi
        const newUser = {
            id:        'u_' + Date.now(),
            fullname:  fullname,
            email:     email,
            password:  password,
            role:      'customer',
            status:    'active',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        showSuccess('Đăng ký thành công!');
        setTimeout(function () {
            window.location.href = basePath + 'login'
        }, 1000);

    })
});

function showError (msg) {
    const el = document.getElementById('error-msg');
    el.textContent = msg;
    el.style.display = 'block';
}

function showSuccess (msg) {
    const el = document.getElementById('success-msg');
    el.textContent = msg;
    el.style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function showFieldError (field, msg) {
    const input = document.getElementById(field === 'confirm' ? 'confirm-password' : field);
    const err = document.getElementById('err-' + field);
    if(input) input.classList.add('is-error');
    if(err) {err.textContent = msg; err.style.display = 'block'};
}

function clearErrors() {
    document.getElementById('error-msg').style.display = 'none';
    document.getElementById('success-msg').style.display = 'none';
    document.querySelectorAll('.field-error').forEach(function(el) {
        el.textContent = '';
        el.style.display = 'block';
    });
    document.querySelectorAll('.is-error').forEach(function(el) {
        el.classList.remove('is-error');
    });

}