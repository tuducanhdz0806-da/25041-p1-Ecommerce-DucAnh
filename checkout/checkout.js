// checkout/checkout.js

let checkoutItems = [];   

document.addEventListener('DOMContentLoaded', function () {
    loadData();
    loadHeader();
    loadFooter();

    // Kiem tra dang nhap
    if (!localStorage.getItem('currentUser')) {
        window.location.href = basePath + 'login/login.html';
        return;
    }

    // Load du lieu can thanh toan
    loadCheckoutData();

    // Fill thong tin user vao form
    prefillUserInfo();

    // Gan su kien
    bindEvents();
});


// Fill thong tin user vao form
function prefillUserInfo() {
    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
        return; 
    }
    if (!currentUser) return;

    // Dien ho ten
    const fullnameInput = document.getElementById('fullname');
    if (fullnameInput && currentUser.fullname) {
        fullnameInput.value = currentUser.fullname;
    }

    // Dien so dien thoai
    const phoneInput = document.getElementById('phone');
    if (phoneInput && currentUser.phone) {
        phoneInput.value = currentUser.phone;
    }


    const addressInput = document.getElementById('address');
    if (addressInput) {
        try {
            const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
            // Tim dia chi mac dinh
            const defaultAddress = addresses.find(function (addr) {
                return addr.userId == currentUser.id && addr.isDefault;
            });
            // neu ko co dia chi mac dinh -> lay dai chi dau tien
            const fallbackAddress = addresses.find(function (addr) {
                return addr.userId == currentUser.id;
            });

            const chosenAddress = defaultAddress || fallbackAddress;
            if (chosenAddress && chosenAddress.fullAddress) {
                addressInput.value = chosenAddress.fullAddress;
            }
        } catch (e) {

        }
    }
}


// Load du lieu thanh toan
function loadCheckoutData() {
    try {
        checkoutItems = JSON.parse(localStorage.getItem('checkoutItems')) || [];
    } catch (e) {
        console.error('[checkout.js] Lỗi đọc checkoutItems:', e);
        checkoutItems = [];
    }

    // Neu khong co san pham can thanh toan -> quay ve gio hang
    if (checkoutItems.length === 0) {
        alert('Không có sản phẩm nào để thanh toán. Vui lòng chọn sản phẩm trong giỏ hàng.');
        window.location.href = basePath + 'cart/cart.html';
        return;
    }

    // Render danh sach san pham + tinh tong tien
    renderCheckoutItems();
}


// Render danh sach san pham
function renderCheckoutItems() {
    const itemsContainer = document.getElementById('checkout-items');
    if (!itemsContainer) return;

    // Render tung san pham
    let html = '';
    checkoutItems.forEach(function (item) {
        const imgSrc = item.image ? basePath + item.image : basePath + 'images/placeholder-product.jpg';
        html += `
            <div class="checkout-item">
                <img src="${imgSrc}"
                     alt="${item.name}"
                     class="checkout-item__img"
                     onerror="this.src='${basePath}images/placeholder-product.jpg'">
                <div class="checkout-item__info">
                    <p class="checkout-item__name">${item.name}</p>
                    <p class="checkout-item__qty">x${item.quantity}</p>
                </div>
                <p class="checkout-item__price">${formatCurrency(item.price * item.quantity)}</p>
            </div>
        `;
    });
    itemsContainer.innerHTML = html;

    // Tinh tong tien
    calculateAndRenderTotal();
}


// TÍNH TOÁN TỔNG TIỀN
function calculateAndRenderTotal() {
    const FREE_SHIP_THRESHOLD = 500000;
    const SHIP_COST           = 25000;

    // Tinh tam tinh va tong so luong san pham
    let subtotal     = 0;
    let totalQuantity = 0;

    checkoutItems.forEach(function (item) {
        subtotal      += item.price * item.quantity;
        totalQuantity += item.quantity;
    });

    // Tinh phi ship
    const shippingCost = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_COST;
    const totalPrice   = subtotal + shippingCost;

    // Cap nhat giao dien
    document.getElementById('checkout-total-items').textContent = totalQuantity;
    document.getElementById('checkout-subtotal').textContent    = formatCurrency(subtotal);
    document.getElementById('checkout-shipping').textContent    =
        shippingCost === 0 ? 'Miễn phí' : formatCurrency(shippingCost);
    document.getElementById('checkout-total').textContent       = formatCurrency(totalPrice);

    // Luu de dung khi tao order
    window._checkoutSubtotal = subtotal;
    window._checkoutShipping = shippingCost;
    window._checkoutTotal    = totalPrice;
}

// Gan su kien
function bindEvents() {

    // Chuyen doi hien thi thong tin chuyen khoan
    const codRadio  = document.getElementById('payment-cod');
    const bankRadio = document.getElementById('payment-bank');
    const bankInfo  = document.getElementById('bank-info');

    function toggleBankInfo() {
        bankInfo.style.display = bankRadio.checked ? 'block' : 'none';
        document.getElementById('payment-option-cod').classList.toggle('payment-option--active', codRadio.checked);
        document.getElementById('payment-option-bank').classList.toggle('payment-option--active', bankRadio.checked);
    }

    if (codRadio)  codRadio.addEventListener('change', toggleBankInfo);
    if (bankRadio) bankRadio.addEventListener('change', toggleBankInfo);
    toggleBankInfo(); 

    ['fullname', 'phone', 'address'].forEach(function (field) {
        const el = document.getElementById(field);
        if (el) el.addEventListener('input', function () { clearFieldError(field); });
    });

    // Nut xac nhan don hang
    const completeBtn = document.getElementById('complete-order-btn');
    if (completeBtn) completeBtn.addEventListener('click', handlePlaceOrder);
}


// Xu ly dat hang
function handlePlaceOrder() {
    // Lay du lieu tu form
    const fullname = document.getElementById('fullname').value.trim();
    const phone    = document.getElementById('phone').value.trim();
    const address  = document.getElementById('address').value.trim();
    const note     = document.getElementById('note').value.trim();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

    // Validate du lieu
    const errors = validateCheckoutForm(fullname, phone, address);
    if (errors.length > 0) {
        errors.forEach(function (err) { showFieldError(err.field, err.msg); });
        document.querySelector('.field--error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // Lay thong tin user hien tai
    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) throw new Error();
    } catch (e) {
        window.location.href = basePath + 'login/login.html';
        return;
    }

    // Tao object don hang moi
    const newOrder = {
        id:            generateOrderId(),
        userId:        currentUser.id,
        items:         checkoutItems,
        subtotal:      window._checkoutSubtotal,
        shippingCost:  window._checkoutShipping,
        totalPrice:    window._checkoutTotal,
        recipientName: fullname,
        phone:         phone,
        address:       address,
        note:          note,
        paymentMethod: paymentMethod,
        status:        'pending',
        createdAt:     new Date().toISOString()
    };

    // Luu don hang moi vao mang orders trong localstorage
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem('orders')) || [];
    } catch (e) {
        orders = [];
    }
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Xoa cac san pham da thanh toan khoi gio hang
    removeCheckedOutItemsFromCart(currentUser.id);

    // Don dep checkoutItems
    localStorage.removeItem('checkoutItems');

    // Chuyen sang trang xac nhan don hang
    window.location.href = basePath + 'order-confirmation/index.html?id=' + newOrder.id;
}


// Xoa cac san pham da thanh toan khoi gio hang
/** 
 * @param {string|number} userId 
 */
function removeCheckedOutItemsFromCart(userId) {
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        cart = [];
    }

    // Lay danh sach productId da thanh toan
    const checkedOutIds = checkoutItems.map(function (item) {
        return String(item.productId);
    });

    // Giu lai cac item chua dc thanh toan
    const newCart = cart.filter(function (item) {
        const isThisUser    = item.userId == userId;
        const isCheckedOut  = checkedOutIds.includes(String(item.productId));
        return !(isThisUser && isCheckedOut);
    });

    localStorage.setItem('cart', JSON.stringify(newCart));
}


// Validate form
function validateCheckoutForm(fullname, phone, address) {
    const errors = [];

    if (!fullname) {
        errors.push({ field: 'fullname', msg: 'Vui lòng nhập họ tên người nhận.' });
    }

    if (!phone) {
        errors.push({ field: 'phone', msg: 'Vui lòng nhập số điện thoại.' });
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(phone.replace(/\s/g, ''))) {
        errors.push({ field: 'phone', msg: 'Số điện thoại không hợp lệ.' });
    }

    if (!address) {
        errors.push({ field: 'address', msg: 'Vui lòng nhập địa chỉ giao hàng.' });
    }

    return errors;
}

function showFieldError(fieldName, message) {
    const input   = document.getElementById(fieldName);
    const errorEl = document.getElementById('err-' + fieldName);
    if (input)   input.closest('.field').classList.add('field--error');
    if (errorEl) { errorEl.textContent = message; errorEl.style.display = 'block'; }
}

function clearFieldError(fieldName) {
    const input   = document.getElementById(fieldName);
    const errorEl = document.getElementById('err-' + fieldName);
    if (input)   input.closest('.field').classList.remove('field--error');
    if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
}


// Tao ma don hang
function generateOrderId() {
    return 'DH' + Date.now();
}