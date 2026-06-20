// my-account/my-account.js

document.addEventListener('DOMContentLoaded', function () {
    loadData();
    loadHeader();
    loadFooter();

    // Kiem tra dang nhap
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        alert('Vui lòng đăng nhập để truy cập trang này!');
        window.location.href = basePath + 'login/login.html';
        return;
    }

    // Hien thi thong tin (ten, email)
    renderSidebarProfile();

    // Do du lieu user vao form thong tin ca nhan
    fillPersonalInfoForm();

    // Render danh sach don hang
    renderOrderHistory();

    // Gan cac su kien
    bindEvents();
});


// Hien thi thong tin sidebar
function renderSidebarProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const avatarEl   = document.getElementById('user-avatar');
    const usernameEl = document.getElementById('sidebar-username');
    const emailEl    = document.getElementById('sidebar-email');

    if (avatarEl) {
        avatarEl.textContent = currentUser.fullname
            ? currentUser.fullname.trim().charAt(0).toUpperCase()
            : 'U';
    }
    if (usernameEl) usernameEl.textContent = currentUser.fullname || 'Người dùng';
    if (emailEl)    emailEl.textContent    = currentUser.email || '';
}


// Thong tin ca nhan
function fillPersonalInfoForm() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    setInputValue('acc-fullname', currentUser.fullname);
    setInputValue('acc-email',    currentUser.email);
    setInputValue('acc-phone',    currentUser.phone);
    setInputValue('acc-address',  currentUser.address);
}

function setInputValue(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.value = value || '';
}

function handleUpdatePersonalInfo(e) {
    e.preventDefault();
    clearAllFieldErrors();

    // Lay du lieu tu form
    const fullname = document.getElementById('acc-fullname').value.trim();
    const email    = document.getElementById('acc-email').value.trim();
    const phone    = document.getElementById('acc-phone').value.trim();
    const address  = document.getElementById('acc-address').value.trim();

    const errors = validatePersonalInfo(fullname, email, phone);
    if (errors.length > 0) {
        errors.forEach(function (err) { showFieldError(err.field, err.msg); });
        return;
    }

    // Lay current user hien tai va cap nhat cac truong moi
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    currentUser.fullname = fullname;
    currentUser.email    = email;
    currentUser.phone    = phone;
    currentUser.address   = address;

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    syncUserInUsersList(currentUser);

    renderSidebarProfile();

    loadHeader();

    // Hien thi thong bao thanh cong
    showUpdateSuccess();
}

/**
 * @param {Object} updatedUser
 */
function syncUserInUsersList(updatedUser) {
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('users')) || [];
    } catch (e) {
        console.error('[my-account.js] Lỗi đọc users:', e);
        return;
    }

    const index = users.findIndex(function (u) { return u.id == updatedUser.id; });
    if (index > -1) {
        users[index] = Object.assign({}, users[index], updatedUser);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// validate form thong tin ca nhan
function validatePersonalInfo(fullname, email, phone) {
    const errors = [];

    if (!fullname) {
        errors.push({ field: 'fullname', msg: 'Vui lòng nhập họ và tên.' });
    }
    if (!email) {
        errors.push({ field: 'email', msg: 'Vui lòng nhập email.' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({ field: 'email', msg: 'Email không hợp lệ.' });
    }
    if (!phone) {
        errors.push({ field: 'phone', msg: 'Vui lòng nhập số điện thoại.' });
    }

    return errors;
}

// Thong bao cap nhat thanh cong, an sau 3s
function showUpdateSuccess() {
    const el = document.getElementById('update-success-msg');
    if (!el) return;
    el.style.display = 'block';
    setTimeout(function () { el.style.display = 'none'; }, 3000);
}

// Lich su don hang
function renderOrderHistory() {
    const container = document.getElementById('orders-list');
    if (!container) return;

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    // Lay toan bo don hang
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem('orders')) || [];
    } catch (e) {
        console.error('[my-account.js] Lỗi đọc orders:', e);
    }

    // Loc don hang cua user hien tai
    const userOrders = orders.filter(function (o) {
        return o.userId == currentUser.id;
    });

    if (userOrders.length === 0) {
        container.innerHTML = `
            <div class="orders-empty">
                <div class="orders-empty__icon">📦</div>
                <p class="orders-empty__text">Bạn chưa có đơn hàng nào.</p>
                <a href="${basePath}product-list/index.html" class="btn btn--primary">
                    Mua sắm ngay
                </a>
            </div>
        `;
        return;
    }

    // Sap xep don hang moi nhat len dau
    userOrders.sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Render tung don hang
    container.innerHTML = userOrders.map(function (order) {
        return buildOrderCardHTML(order);
    }).join('');

    // Gan su kien xem chi tiet
    attachOrderToggleEvents();
}

/**
 * @param {Object} order
 */
function buildOrderCardHTML(order) {
    const statusInfo = getOrderStatusInfo(order.status || 'pending');
    const orderDate  = formatOrderDate(order.createdAt);

    // Render truoc danh sach san pham
    const itemsHTML = (order.items || []).map(function (item) {
        const imgSrc = item.image
            ? basePath + item.image
            : basePath + 'images/placeholder-product.jpg';
        return `
            <div class="order-detail-item">
                <img src="${imgSrc}" alt="${item.name}" class="order-detail-item__img"
                     onerror="this.src='${basePath}images/placeholder-product.jpg'">
                <div class="order-detail-item__info">
                    <p class="order-detail-item__name">${item.name}</p>
                    <p class="order-detail-item__qty">x${item.quantity || 1}</p>
                </div>
                <p class="order-detail-item__price">
                    ${formatCurrency((item.price || 0) * (item.quantity || 1))}
                </p>
            </div>
        `;
    }).join('');

    return `
        <div class="order-card">

            <!-- Dòng tóm tắt — click để xổ chi tiết -->
            <button class="order-card__summary" data-order-id="${order.id}">
                <div class="order-card__col">
                    <span class="order-card__label">Mã đơn</span>
                    <span class="order-card__value order-card__value--id">#${order.id}</span>
                </div>
                <div class="order-card__col">
                    <span class="order-card__label">Ngày đặt</span>
                    <span class="order-card__value">${orderDate}</span>
                </div>
                <div class="order-card__col">
                    <span class="order-card__label">Tổng tiền</span>
                    <span class="order-card__value order-card__value--price">
                        ${formatCurrency(order.totalPrice || 0)}
                    </span>
                </div>
                <div class="order-card__col">
                    <span class="order-status ${statusInfo.class}">${statusInfo.text}</span>
                </div>
                <span class="order-card__toggle-icon">▼</span>
            </button>

            <!-- Chi tiết — ẩn mặc định -->
            <div class="order-card__detail" id="order-detail-${order.id}">
                <div class="order-detail-items">
                    ${itemsHTML || '<p class="orders-empty__text">Không có sản phẩm.</p>'}
                </div>
                <div class="order-detail-address">
                    <strong>Địa chỉ giao hàng:</strong> ${order.address || 'Không có'}
                </div>
            </div>

        </div>
    `;
}

// Gan su kien click vao nut tom tat don hang
function attachOrderToggleEvents() {
    document.querySelectorAll('.order-card__summary').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const orderId   = this.dataset.orderId;
            const detailEl  = document.getElementById('order-detail-' + orderId);
            const isOpen    = this.classList.contains('order-card__summary--open');

            if (detailEl) {
                detailEl.classList.toggle('order-card__detail--open', !isOpen);
            }
            this.classList.toggle('order-card__summary--open', !isOpen);
        });
    });
}

// Map trang thai don hang
function getOrderStatusInfo(status) {
    switch (status) {
        case 'pending':    return { class: 'order-status--pending',    text: 'Chờ xử lý' };
        case 'processing': return { class: 'order-status--processing', text: 'Đang xử lý' };
        case 'shipping':   return { class: 'order-status--shipping',   text: 'Đang giao' };
        case 'delivered':  return { class: 'order-status--delivered',  text: 'Đã giao' };
        case 'cancelled':  return { class: 'order-status--cancelled',  text: 'Đã hủy' };
        default:           return { class: 'order-status--pending',    text: 'Chờ xử lý' };
    }
}


function formatOrderDate(isoString) {
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Không xác định';
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return 'Không xác định';
    }
}

// Gan su kien
function bindEvents() {

    // Chuyen tab (thon tin ca nhan/lich su don hang)
    document.querySelectorAll('.acc-menu__item').forEach(function (menuItem) {
        menuItem.addEventListener('click', function () {
            const targetTab = this.dataset.tab;
            switchTab(targetTab);
        });
    });

    // Submit thong tin form
    const personalForm = document.getElementById('personal-info-form');
    if (personalForm) {
        personalForm.addEventListener('submit', handleUpdatePersonalInfo);
    }

    // Xoa loi khi go lai
    ['fullname', 'email', 'phone'].forEach(function (field) {
        const el = document.getElementById('acc-' + field);
        if (el) el.addEventListener('input', function () { clearFieldError(field); });
    });

    // Nut dang xuat
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}


function switchTab(tabId) {
    document.querySelectorAll('.acc-menu__item').forEach(function (item) {
        item.classList.toggle('acc-menu__item--active', item.dataset.tab === tabId);
    });

    document.querySelectorAll('.acc-tab').forEach(function (tab) {
        tab.classList.toggle('acc-tab--active', tab.id === tabId);
    });
}

// Xu ly dang xuat 
function handleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        window.location.href = basePath + 'home/index.html';
    }
}

// lay object currentUser tu localstorage
function getCurrentUser() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user || !user.id) throw new Error('User không hợp lệ');
        return user;
    } catch (e) {
        console.error('[my-account.js] Lỗi đọc currentUser:', e);
        window.location.href = basePath + 'login/login.html';
        return null;
    }
}

// hien thi loi cho 1 truong input
function showFieldError(fieldName, message) {
    const input   = document.getElementById('acc-' + fieldName);
    const errorEl = document.getElementById('err-' + fieldName);
    if (input)   input.closest('.field').classList.add('field--error');
    if (errorEl) { errorEl.textContent = message; errorEl.style.display = 'block'; }
}

// xoa loi 1 truong input
function clearFieldError(fieldName) {
    const input   = document.getElementById('acc-' + fieldName);
    const errorEl = document.getElementById('err-' + fieldName);
    if (input)   input.closest('.field').classList.remove('field--error');
    if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
}

function clearAllFieldErrors() {
    ['fullname', 'email', 'phone'].forEach(clearFieldError);
}