// order-confirmation/order-confirmation.js

document.addEventListener('DOMContentLoaded', function () {

    loadData();
    loadHeader();
    loadFooter();

    // Kiem tra dang nhap
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        window.location.href = basePath + 'login/login.html';
        return;
    }

    // Lay ma don hang tu URL
    initOrderConfirmation();
});


function initOrderConfirmation() {
    try {
        const params  = new URLSearchParams(window.location.search);
        const orderId = params.get('id');


        if (!orderId) {
            throw new Error('Thiếu mã đơn hàng trên URL.');
        }

        // Lay thong tin user hien tai
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) {
            throw new Error('Không xác định được người dùng.');
        }

        // Lay danh sach don hang
        const orders = JSON.parse(localStorage.getItem('orders')) || [];

        // Tim don hang theo id
        const order = orders.find(function (o) { return o.id === orderId; });

        if (!order) {
            throw new Error('Không tìm thấy đơn hàng với mã: ' + orderId);
        }

        // Dam bao dung user
        if (order.userId != currentUser.id) {
            throw new Error('Đơn hàng không thuộc về người dùng hiện tại.');
        }

        // Moi thu hop le -> render thong tin ra giao dien
        renderOrderConfirmation(order);

    } catch (e) {
        console.error('[order-confirmation.js]', e.message);
        window.location.href = basePath + 'home/index.html';
    }
}


// Render thong tin don hang
function renderOrderConfirmation(order) {

    // Ma don hang
    setText('order-id', '#' + order.id);

    // Thong tin nguoi nhan
    setText('recipient-name',    order.recipientName || 'Không có');
    setText('recipient-phone',   order.phone          || 'Không có');
    setText('recipient-address', order.address         || 'Không có');

    // Ghi chu (neu co)
    const noteRow = document.getElementById('note-row');
    if (order.note && order.note.trim() !== '') {
        setText('recipient-note', order.note);
        if (noteRow) noteRow.style.display = 'flex';
    }

    // Phuong thuc thanh toan
    const bankInfoEl = document.getElementById('bank-transfer-info');
    if (order.paymentMethod === 'bank') {
        setText('payment-method', 'Chuyển khoản ngân hàng');
        setText('transfer-content', 'Thanh toan don hang ' + order.id);
        if (bankInfoEl) bankInfoEl.style.display = 'block';
    } else {
        setText('payment-method', 'Thanh toán khi nhận hàng (COD)');
        if (bankInfoEl) bankInfoEl.style.display = 'none';
    }

    // Danh sach san pham
    renderOrderItems(order.items);

    // Tong tien
    setText('subtotal', formatCurrency(order.subtotal || 0));
    setText('shipping-cost', order.shippingCost === 0
        ? 'Miễn phí'
        : formatCurrency(order.shippingCost || 0));
    setText('total-amount', formatCurrency(order.totalPrice || 0));
}

// Render dan hsach san pham
/**
 * @param {Array} items
 */
function renderOrderItems(items) {
    const container = document.getElementById('order-items-list');
    if (!container) return;

    if (!items || !Array.isArray(items) || items.length === 0) {
        container.innerHTML = '<p class="oc-empty-note">Không có sản phẩm trong đơn hàng.</p>';
        return;
    }

    let html = '';
    items.forEach(function (item) {
        const imgSrc = item.image
            ? basePath + item.image
            : basePath + 'images/placeholder-product.jpg';
        const itemTotal = (item.price || 0) * (item.quantity || 1);

        html += `
            <div class="oc-item">
                <img src="${imgSrc}"
                     alt="${item.name}"
                     class="oc-item__img"
                     onerror="this.src='${basePath}images/placeholder-product.jpg'">
                <div class="oc-item__info">
                    <p class="oc-item__name">${item.name}</p>
                    <p class="oc-item__qty">Số lượng: x${item.quantity || 1}</p>
                </div>
                <p class="oc-item__price">${formatCurrency(itemTotal)}</p>
            </div>
        `;
    });

    container.innerHTML = html;
}


function setText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
}