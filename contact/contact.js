// contact/contact.js

document.addEventListener('DOMContentLoaded', function () {
    loadData();
    loadHeader();
    loadFooter();

    // Điền sẵn thông tin người dùng vào form (nếu đã đăng nhập)
    prefillContactForm();

    // Gắn sự kiện submit cho form liên hệ
    bindContactFormEvent();
});

// ĐIỀN SẴN THÔNG TIN NGƯỜI DÙNG
function prefillContactForm() {
    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
        return; // Không có user hợp lệ thì bỏ qua, để form trống
    }
    if (!currentUser) return;

    const fullnameInput = document.getElementById('contact-fullname');
    const emailInput    = document.getElementById('contact-email');
    const phoneInput    = document.getElementById('contact-phone');

    if (fullnameInput && currentUser.fullname) {
        fullnameInput.value = currentUser.fullname;
    }
    if (emailInput && currentUser.email) {
        emailInput.value = currentUser.email;
    }
    if (phoneInput && currentUser.phone) {
        phoneInput.value = currentUser.phone;
    }
}


// GẮN SỰ KIỆN SUBMIT FORM
function bindContactFormEvent() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
    }

    // Xóa lỗi khi người dùng gõ lại vào ô input
    ['fullname', 'email', 'phone', 'subject', 'content'].forEach(function (field) {
        const el = document.getElementById('contact-' + field);
        if (el) {
            el.addEventListener('input', function () { clearFieldError(field); });
            el.addEventListener('change', function () { clearFieldError(field); });
        }
    });
}


// XỬ LÝ SUBMIT FORM LIÊN HỆ
function handleContactSubmit(e) {
    // Ngăn hành vi load lại trang mặc định của form
    e.preventDefault();

    // Xóa các lỗi cũ (nếu có) trước khi validate lại
    clearAllFieldErrors();

    // Lấy dữ liệu từ các ô input
    const fullname = document.getElementById('contact-fullname').value.trim();
    const email    = document.getElementById('contact-email').value.trim();
    const phone    = document.getElementById('contact-phone').value.trim();
    const subject  = document.getElementById('contact-subject').value.trim();
    const content  = document.getElementById('contact-content').value.trim();

    // Validate dữ liệu
    const errors = validateContactForm(fullname, email, phone, subject, content);
    if (errors.length > 0) {
        errors.forEach(function (err) { showFieldError(err.field, err.msg); });
        document.querySelector('.field--error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return; // Dừng lại, không lưu dữ liệu khi còn lỗi
    }

    // Lấy mảng contactMessages hiện tại từ localStorage
    let contactMessages = [];
    try {
        contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    } catch (e) {
        console.error('[contact.js] Lỗi đọc contactMessages:', e);
        contactMessages = [];
    }

    // Tạo object message mới
    const newMessage = {
        id:        generateMessageId(contactMessages),
        fullname:  fullname,
        email:     email,
        phone:     phone,
        subject:   subject,
        content:   content,
        status:    'unread',
        createdAt: new Date().toISOString()
    };

    // Push message mới vào mảng và lưu lại localStorage
    contactMessages.push(newMessage);
    localStorage.setItem('contactMessages', JSON.stringify(contactMessages));

    // Reset form về trạng thái trống
    document.getElementById('contact-form').reset();

    // Điền lại thông tin user (nếu đã đăng nhập) sau khi reset
    prefillContactForm();

    // Hiển thị thông báo thành công
    showFormSuccess();
}


// VALIDATE FORM
function validateContactForm(fullname, email, phone, subject, content) {
    const errors = [];

    if (!fullname) {
        errors.push({ field: 'fullname', msg: 'Vui lòng nhập họ và tên.' });
    }

    if (!email) {
        errors.push({ field: 'email', msg: 'Vui lòng nhập email.' });
    } else if (!isValidEmail(email)) {
        errors.push({ field: 'email', msg: 'Email không hợp lệ.' });
    }

    if (phone && !isValidPhone(phone)) {
        errors.push({ field: 'phone', msg: 'Số điện thoại không hợp lệ.' });
    }

    if (!subject) {
        errors.push({ field: 'subject', msg: 'Vui lòng chọn chủ đề.' });
    }

    if (!content) {
        errors.push({ field: 'content', msg: 'Vui lòng nhập nội dung lời nhắn.' });
    } else if (content.length < 10) {
        errors.push({ field: 'content', msg: 'Nội dung quá ngắn, vui lòng nhập ít nhất 10 ký tự.' });
    }

    return errors;
}

// Kiểm tra định dạng email cơ bản 
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Kiểm tra định dạng số điện thoại Việt Nam (10 số, có thể bắt đầu bằng 0 hoặc +84)
function isValidPhone(phone) {
    return /^(0|\+84)[0-9]{9,10}$/.test(phone.replace(/\s/g, ''));
}

/**
 * @param {Array} messages
 */
function generateMessageId(messages) {
    if (!messages || messages.length === 0) return 1;

    const maxId = messages.reduce(function (max, msg) {
        return msg.id > max ? msg.id : max;
    }, 0);

    return maxId + 1;
}


// HIỂN THỊ / XÓA LỖI TRÊN FORM
function showFieldError(fieldName, message) {
    const input   = document.getElementById('contact-' + fieldName);
    const errorEl = document.getElementById('err-' + fieldName);
    if (input)   input.closest('.field').classList.add('field--error');
    if (errorEl) { errorEl.textContent = message; errorEl.style.display = 'block'; }
}

function clearFieldError(fieldName) {
    const input   = document.getElementById('contact-' + fieldName);
    const errorEl = document.getElementById('err-' + fieldName);
    if (input)   input.closest('.field').classList.remove('field--error');
    if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
}

function clearAllFieldErrors() {
    ['fullname', 'email', 'phone', 'subject', 'content'].forEach(clearFieldError);
}


// THÔNG BÁO THÀNH CÔNG
function showFormSuccess() {
    const el = document.getElementById('form-success-msg');
    if (!el) return;

    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(function () {
        el.style.display = 'none';
    }, 4000);
}