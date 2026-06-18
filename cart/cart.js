// cart/cart.js

document.addEventListener('DOMContentLoaded', function () {
    loadData();
    loadHeader();
    loadFooter();

    // Kiem tra dang nhap roi moi render gio hang
    checkLoginAndRender();
});

// Kiem tra dang nhap
function checkLoginAndRender() {
    const currentUserJson = localStorage.getItem('currentUser');

    if (!currentUserJson) {
        // chua dang nhap -> yeu cau dang nhap
        showLoginRequired();
        return;
    }

    // Da dang nhap -> render gio hang
    renderCart();
}

// Render gio hang
function renderCart() {
    // Lay thong tin user dang nhap
    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) throw new Error('User không hợp lệ');
    } catch (e) {
        showLoginRequired();
        return;
    }

    // Lay toan bo gio hang, loc lay phan cua user hien tai
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        cart = [];
    }
    const userItems = cart.filter(function (item) {
        return item.userId == currentUser.id;
    });

    // cap nhat text tieu de
    const countText = document.getElementById('cart-count-text');
    if (countText) {
        countText.textContent = userItems.length > 0
            ? userItems.length + ' sản phẩm trong giỏ'
            : 'Giỏ hàng của bạn đang trống';
    }

    // Neu gio hang trong -> hien thi empty state roi dung 
    if (userItems.length === 0) {
        showEmptyCart();
        updateHeaderCartBadge(currentUser.id, cart);
        return;
    }

    // Lay danh sach san pham
    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (e) {
        products = [];
    }

    // Ghep thong tin: moi cart item + thong tin product tuong ung
    const enrichedItems = [];
    userItems.forEach(function (item) {
        const product = products.find(function (p) { return p.id == item.productId; });
        if (product) {
            enrichedItems.push({
                productId: item.productId,
                name:      product.name,
                image:     product.image || '',
                price:     item.price || product.discountPrice || product.price || 0,
                quantity:  item.quantity || 1,
                stock:     product.stock || 99
            });
        }
    });

    // Render HTML
    const content = document.getElementById('cart-content');
    if (!content) return;

    content.innerHTML = `
        <div class="cart-layout">
 
            <!-- CỘT TRÁI: Danh sách sản phẩm -->
            <div class="cart-items">
 
                <!-- Thanh header: checkbox chọn tất cả + tiêu đề cột -->
                <div class="cart-items__header">
                    <div class="cart-items__col cart-items__col--check">
                        <label class="cart-checkbox" title="Chọn tất cả">
                            <input type="checkbox" id="select-all">
                            <span class="cart-checkbox__box"></span>
                        </label>
                    </div>
                    <span class="cart-items__col cart-items__col--product">Sản phẩm</span>
                    <span class="cart-items__col cart-items__col--price">Đơn giá</span>
                    <span class="cart-items__col cart-items__col--qty">Số lượng</span>
                    <span class="cart-items__col cart-items__col--total">Thành tiền</span>
                    <span class="cart-items__col cart-items__col--remove"></span>
                </div>
 
                <!-- Danh sách sản phẩm -->
                <div id="cart-item-list">
                    ${enrichedItems.map(function (item) {
                        return buildCartItemHTML(item);
                    }).join('')}
                </div>
 
                <!-- Link quay lại -->
                <a href="../product-list/index.html" class="cart-back-link">
                    ← Tiếp tục mua sắm
                </a>
            </div>
 
            <!-- CỘT PHẢI: Tóm tắt đơn hàng -->
            <div class="cart-summary">
                <h2 class="cart-summary__title">Tóm tắt đơn hàng</h2>
 
                <div class="cart-summary__row">
                    <span>Tạm tính</span>
                    <span id="subtotal">0 ₫</span>
                </div>
                <div class="cart-summary__row">
                    <span>Phí vận chuyển</span>
                    <span id="shipping-cost">—</span>
                </div>
 
                <div class="cart-summary__divider"></div>
 
                <div class="cart-summary__row cart-summary__row--total">
                    <strong>Tổng cộng</strong>
                    <strong id="total-price" class="cart-summary__total-price">0 ₫</strong>
                </div>
 
                <!-- Banner miễn phí ship -->
                <div class="free-ship-banner" id="free-ship-banner">
                    <span class="free-ship-banner__icon">🚚</span>
                    <span class="free-ship-banner__text" id="free-ship-text">
                        Chọn sản phẩm để xem phí ship
                    </span>
                </div>
 
                <!-- Nút thanh toán -->
                <button id="checkout-btn" class="btn btn--primary btn--block cart-checkout-btn">
                    Tiến hành thanh toán →
                </button>
 
                <!-- Nút xóa hàng loạt -->
                <button id="delete-selected-btn" class="btn btn--ghost btn--block cart-delete-btn">
                    🗑️ Xóa sản phẩm đã chọn
                </button>
 
                <!-- Thông báo nhỏ -->
                <p class="cart-summary__hint" id="selected-hint">
                    Chưa chọn sản phẩm nào
                </p>
            </div>
 
        </div>
    `;

    attachCartEvents();

    // cap nhat tong tien
    recalcTotal();

    // Cap nhat badge gio hang tren header
    updateHeaderCartBadge(currentUser.id, cart);
}

// Build HTML 1 dong san pham
function buildCartItemHTML(item) {
    const imgSrc   = item.image 
        ? basePath + item.image 
        : basePath + 'images/placeholder-product.jpg';
    const detailUrl = basePath + 'product-detail/product-detail.html?id=' + item.productId;

    return `
        <div class="cart-item" data-product-id="${item.productId}" data-price="${item.price}">

            <!-- Checkbox chọn sản phẩm -->
            <div class="cart-item__check">
                <label class="cart-checkbox">
                    <input type="checkbox" class="item-checkbox" data-id="${item.productId}">
                    <span class="cart-checkbox__box"></span>
                </label>
            </div>

            <!-- Ảnh + Tên -->
            <div class="cart-item__product">
                <a href="${detailUrl}" class="cart-item__img-link">
                    <img src="${imgSrc}"
                         alt="${item.name}"
                         class="cart-item__img"
                         onerror="this.src='${basePath}images/placeholder-product.jpg'">
                </a>
                <a href="${detailUrl}" class="cart-item__name">${item.name}</a>
            </div>

            <!-- Đơn giá -->
            <div class="cart-item__price" data-label="Đơn giá">
                ${formatCurrency(item.price)}
            </div>

            <!-- Số lượng -->
            <div class="cart-item__qty" data-label="Số lượng">
                <div class="qty-control">
                    <button class="qty-control__btn qty-btn-minus"
                            data-id="${item.productId}">−</button>
                    <input  class="qty-control__input qty-input"
                            type="number"
                            value="${item.quantity}"
                            min="1"
                            max="${item.stock}"
                            data-id="${item.productId}"
                            readonly>
                    <button class="qty-control__btn qty-btn-plus"
                            data-id="${item.productId}">+</button>
                </div>
            </div>

            <!-- Thành tiền -->
            <div class="cart-item__total" data-label="Thành tiền">
                <strong class="item-total-price" data-id="${item.productId}">
                    ${formatCurrency(item.price * item.quantity)}
                </strong>
            </div>

            <!-- Nút xóa -->
            <div class="cart-item__remove">
                <button class="cart-item__remove-btn btn-delete"
                        data-id="${item.productId}"
                        title="Xóa sản phẩm">🗑️</button>
            </div>

        </div>
    `;
}

// Gan su kien
function attachCartEvents() {
    const itemList   = document.getElementById('cart-item-list');
    const selectAllCb     = document.getElementById('select-all');
    const checkoutBtn = document.getElementById('checkout-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');

    // checkbox "chon tat ca"
    if (selectAllCb) {
        selectAllCb.addEventListener('change', function () {
            // Tích/bỏ tất cả checkbox sản phẩm theo trạng thái của "Chọn tất cả"
            document.querySelectorAll('.item-checkbox').forEach(function (cb) {
                cb.checked = selectAllCb.checked;
            });
            recalcTotal();
        });
    }

    // Su kien tren danh sach san pham
    if (itemList) {
        itemList.addEventListener('change', function (e) {
            // Khi tích/bỏ checkbox lẻ → đồng bộ "Chọn tất cả" + tính lại tiền
            if (e.target.classList.contains('item-checkbox')) {
                syncSelectAll();
                recalcTotal();
            }
        });
 
        itemList.addEventListener('click', function (e) {
            // Nút giảm số lượng
            if (e.target.classList.contains('qty-btn-minus')) {
                const productId = e.target.dataset.id;
                const input     = itemList.querySelector('.qty-input[data-id="' + productId + '"]');
                const current   = parseInt(input.value) || 1;
                if (current > 1) updateQuantity(productId, current - 1);
            }
 
            // Nút tăng số lượng
            if (e.target.classList.contains('qty-btn-plus')) {
                const productId = e.target.dataset.id;
                const input     = itemList.querySelector('.qty-input[data-id="' + productId + '"]');
                const current   = parseInt(input.value) || 1;
                const max       = parseInt(input.max) || 99;
                if (current < max) updateQuantity(productId, current + 1);
            }
 
            // Nút xóa đơn lẻ
            if (e.target.classList.contains('btn-delete')) {
                const productId = e.target.dataset.id;
                if (confirm('Xóa sản phẩm này khỏi giỏ hàng?')) {
                    deleteCartItem(productId);
                }
            }
        });
    }

    // Nut thanh toan
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Nut xoa san pham da chon
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', handleDeleteSelected);
    }
}

// Tinh tong tien
function recalcTotal() {
    const FREE_SHIP_THRESHOLD = 500000;
    const SHIP_COST           = 25000;
 
    let subtotal     = 0;
    let selectedCount = 0;
 
    // Duyệt tất cả checkbox sản phẩm
    document.querySelectorAll('.item-checkbox').forEach(function (cb) {
        if (!cb.checked) return; // Bỏ qua nếu không được tích
 
        // Lấy dòng sản phẩm cha để đọc price
        const row       = cb.closest('.cart-item');
        const productId = cb.dataset.id;
        const price     = parseFloat(row.dataset.price) || 0;
 
        // Đọc số lượng từ input
        const qtyInput  = row.querySelector('.qty-input');
        const qty       = parseInt(qtyInput ? qtyInput.value : 1) || 1;
 
        subtotal += price * qty;
        selectedCount++;
    });
 
    // Tính phí ship
    const shippingCost = subtotal === 0
        ? 0
        : (subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_COST);
    const totalPrice = subtotal + shippingCost;
 
    // Cập nhật DOM
    const subtotalEl   = document.getElementById('subtotal');
    const shippingEl   = document.getElementById('shipping-cost');
    const totalEl      = document.getElementById('total-price');
    const hintEl       = document.getElementById('selected-hint');
    const bannerTextEl = document.getElementById('free-ship-text');
    const bannerEl     = document.getElementById('free-ship-banner');
 
    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (totalEl)    totalEl.textContent    = formatCurrency(totalPrice);
 
    if (shippingEl) {
        if (subtotal === 0) {
            shippingEl.textContent = '—';
        } else if (shippingCost === 0) {
            shippingEl.innerHTML = '<span class="free-ship">Miễn phí</span>';
        } else {
            shippingEl.textContent = formatCurrency(shippingCost);
        }
    }
 
    // Hint số sản phẩm đã chọn
    if (hintEl) {
        hintEl.textContent = selectedCount > 0
            ? 'Đang chọn ' + selectedCount + ' sản phẩm'
            : 'Chưa chọn sản phẩm nào';
    }
 
    // Banner miễn phí ship
    if (bannerEl && bannerTextEl) {
        if (subtotal === 0) {
            bannerTextEl.textContent = 'Chọn sản phẩm để xem phí ship';
            bannerEl.classList.remove('free-ship-banner--ok');
        } else if (subtotal >= FREE_SHIP_THRESHOLD) {
            bannerTextEl.innerHTML = 'Đơn hàng được <strong>miễn phí vận chuyển!</strong>';
            bannerEl.classList.add('free-ship-banner--ok');
        } else {
            const remaining = FREE_SHIP_THRESHOLD - subtotal;
            bannerTextEl.innerHTML =
                'Mua thêm <strong>' + formatCurrency(remaining) + '</strong> để miễn phí ship';
            bannerEl.classList.remove('free-ship-banner--ok');
        }
    }
}

// Dong bo checkbox "chon tat ca"
function syncSelectAll() {
    const allCheckboxes     = document.querySelectorAll('.item-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
    const selectAllCb       = document.getElementById('select-all');
 
    if (!selectAllCb) return;
 
    selectAllCb.checked = (
        allCheckboxes.length > 0 &&
        checkedCheckboxes.length === allCheckboxes.length
    );
}

// Xu ly thanh toan
function handleCheckout() {
    // Lấy các productId đang được tích
    const selectedIds = getSelectedProductIds();
 
    if (selectedIds.length === 0) {
        alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
        return;
    }
 
    // Lấy thông tin đầy đủ của các sản phẩm được chọn
    const checkoutItems = buildSelectedItems(selectedIds);
 
    // Lưu vào localStorage để trang checkout đọc
    localStorage.setItem('checkoutItems', JSON.stringify(checkoutItems));
 
    // Chuyển sang trang thanh toán
    window.location.href = basePath + 'checkout';
}

// xoa hang loat
function handleDeleteSelected() {
    const selectedIds = getSelectedProductIds();
 
    if (selectedIds.length === 0) {
        alert('Vui lòng chọn ít nhất một sản phẩm để xóa.');
        return;
    }
 
    if (!confirm('Xóa ' + selectedIds.length + ' sản phẩm đã chọn khỏi giỏ hàng?')) {
        return;
    }
 
    // Lấy user và giỏ hàng
    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) { return; }
 
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) { cart = []; }
 
    // Lọc bỏ các sản phẩm đã chọn của user này
    const newCart = cart.filter(function (item) {
        // Giữ lại nếu: không phải user này, hoặc productId không nằm trong danh sách đã chọn
        return !(
            item.userId == currentUser.id &&
            selectedIds.includes(String(item.productId))
        );
    });
 
    // Lưu lại và render lại
    localStorage.setItem('cart', JSON.stringify(newCart));
    renderCart();
}

// Cap nhat so luong
function updateQuantity(productId, newQty) {
    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) throw new Error();
    } catch (e) {
        window.location.href = basePath + 'login/login.html';
        return;
    }
 
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) { cart = []; }
 
    const index = cart.findIndex(function (item) {
        return item.userId == currentUser.id && item.productId == productId;
    });
 
    if (index === -1) return;
 
    cart[index].quantity = newQty;
    localStorage.setItem('cart', JSON.stringify(cart));
 
    // Cập nhật thành tiền của dòng đó (không render lại cả trang)
    const price    = parseFloat(
        document.querySelector('.cart-item[data-product-id="' + productId + '"]')
            ?.dataset.price
    ) || 0;
    const totalEl  = document.querySelector('.item-total-price[data-id="' + productId + '"]');
    const inputEl  = document.querySelector('.qty-input[data-id="' + productId + '"]');
 
    if (inputEl) inputEl.value = newQty;
    if (totalEl) totalEl.textContent = formatCurrency(price * newQty);
 
    // Tính lại tổng (chỉ những sản phẩm đang tích)
    recalcTotal();
 
    // Cập nhật badge header
    updateHeaderCartBadge(currentUser.id, cart);
}

// Xoa san pham don le
function deleteCartItem(productId) {
    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) throw new Error();
    } catch (e) {
        window.location.href = basePath + 'login/login.html';
        return;
    }
 
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) { cart = []; }
 
    const newCart = cart.filter(function (item) {
        return !(item.userId == currentUser.id && item.productId == productId);
    });
 
    localStorage.setItem('cart', JSON.stringify(newCart));
    renderCart();
}

// Cap nhat badge header
function updateHeaderCartBadge(userId, cart) {
    const badge = document.getElementById('header-cart-count');
    if (!badge) return;
 
    const totalQty = cart
        .filter(function (item) { return item.userId == userId; })
        .reduce(function (sum, item) { return sum + (item.quantity || 1); }, 0);
 
    badge.textContent = totalQty > 0 ? totalQty : '';
    badge.classList.toggle('cart-badge--hidden', totalQty === 0);
}

// Lay danh sach productId dang dc tich
function getSelectedProductIds() {
    const ids = [];
    document.querySelectorAll('.item-checkbox:checked').forEach(function (cb) {
        ids.push(String(cb.dataset.id));
    });
    return ids;
}
// Xay dung mang san pham duoc chon
function buildSelectedItems(selectedIds) {
    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) { return []; }
 
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) { return []; }
 
    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (e) { products = []; }
 
    const result = [];
    selectedIds.forEach(function (id) {
        const cartItem = cart.find(function (item) {
            return item.userId == currentUser.id && String(item.productId) === id;
        });
        if (!cartItem) return;
 
        const product = products.find(function (p) { return String(p.id) === id; });
        if (!product) return;
 
        // Đọc số lượng hiện tại từ DOM (có thể đã thay đổi)
        const qtyInput = document.querySelector('.qty-input[data-id="' + id + '"]');
        const qty      = qtyInput ? parseInt(qtyInput.value) || 1 : cartItem.quantity;
 
        result.push({
            productId: product.id,
            name:      product.name,
            image:     product.image || '',
            price:     cartItem.price || product.discountPrice || product.price || 0,
            quantity:  qty
        });
    });
 
    return result;
}

// Hien thi giao dien khi gio hang trong
function showEmptyCart() {
    const content = document.getElementById('cart-content');
    if (!content) return;
    content.innerHTML = `
        <div class="cart-empty">
            <div class="cart-empty__icon">🛒</div>
            <h2 class="cart-empty__title">Giỏ hàng của bạn đang trống</h2>
            <p class="cart-empty__sub">Hãy khám phá các sản phẩm và thêm vào giỏ hàng nhé!</p>
            <a href="../product-list/index.html" class="btn btn--primary">Mua sắm ngay</a>
        </div>
    `;
}

// hien thi yeu cau dang nhap khi co tia khoan
function showLoginRequired() {
    const content   = document.getElementById('cart-content');
    const countText = document.getElementById('cart-count-text');
    if (countText) countText.textContent = '';
    if (content) {
        content.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty__icon">🔐</div>
                <h2 class="cart-empty__title">Vui lòng đăng nhập</h2>
                <p class="cart-empty__sub">Bạn cần đăng nhập để xem giỏ hàng của mình.</p>
                <a href="${basePath}login/login.html" class="btn btn--primary">Đăng nhập</a>
            </div>
        `;
    }
}