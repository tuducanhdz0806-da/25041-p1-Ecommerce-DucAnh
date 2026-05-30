// js/login.js

document.addEventListener('DOMContentLoaded', function () {
    loadData();
    loadHeader();
    loadFooter();

    if (localStorage.getItem('currentUser')) {
        window.location.href = basePath + 'home';
        return;
    }

    bindEvent();
});

function bindEvent() {
    //Submit form
    const form = document.getElementById('login-form');
    if (form) form.addEventListener('submit', handleLoginSubmit);

    document.querySelectorAll('.toggle-password').forEach(function (btn) {
        btn.addEventListener('click', togglePassword);
    });

    document.getElementById('email').addEventListener('input', function () {
        clearFielError('email');
        clearGeneralError();
    });
    document.getElementById('password').addEventListener('input', function () {
        clearFielError('password');
        clearGeneralError();
    });

    // Tai khoan demo
    document.querySelectorAll('.auth-demo__btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const emailEl = document.getElementById('email');
            const passwordEl = document.getElementById('password');
        })
    });
}