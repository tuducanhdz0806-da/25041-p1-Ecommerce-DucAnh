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

    // Tinh tam tinh va phi ship
    let subtotal = 0;
    enrichedItems.forEach(function (item) {
        subtotal += item.price * item.quantity;
    });

    const FREE_SHIP_THRESHOLD = 500000;
    const SHIP_COST           = 25000;
    const shippingCost        = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_COST;
    const totalPrice          = subtotal + shippingCost;

    // Render HTML
    const content = document.getElementById('cart-content');
    if (!content) return;

    content.innerHTML = `
        <div class="cart-layout">

            <!-- CỘT TRÁI: Danh sách sản phẩm (70%) -->
            <div class="cart-items">
                <div class="cart-items__header">
                    <span class="cart-items__col cart-items__col--product">Sản phẩm</span>
                    <span class="cart-items__col cart-items__col--price">Đơn giá</span>
                    <span class="cart-items__col cart-items__col--qty">Số lượng</span>
                    <span class="cart-items__col cart-items__col--total">Thành tiền</span>
                    <span class="cart-items__col cart-items__col--remove"></span>
                </div>

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

            <!-- CỘT PHẢI: Tóm tắt đơn hàng (30%) -->
            <div class="cart-summary">
                <h2 class="cart-summary__title">Tóm tắt đơn hàng</h2>

                <div class="cart-summary__row">
                    <span>Tạm tính</span>
                    <span id="subtotal">${formatCurrency(subtotal)}</span>
                </div>

                <div class="cart-summary__row">
                    <span>Phí vận chuyển</span>
                    <span id="shipping-cost">
                        ${shippingCost === 0 ? '<span class="free-ship">Miễn phí</span>' : formatCurrency(shippingCost)}
                    </span>
                </div>

                <div class="cart-summary__divider"></div>

                <div class="cart-summary__row cart-summary__row--total">
                    <strong>Tổng cộng</strong>
                    <strong id="total-price" class="cart-summary__total-price">
                        ${formatCurrency(totalPrice)}
                    </strong>
                </div>

                <!-- Thông báo miễn phí ship -->
                <div class="free-ship-banner ${subtotal >= FREE_SHIP_THRESHOLD ? 'free-ship-banner--ok' : ''}">
                    <span class="free-ship-banner__icon">
                        ${subtotal >= FREE_SHIP_THRESHOLD ? '✅' : '🚚'}
                    </span>
                    <span class="free-ship-banner__text">
                        ${subtotal >= FREE_SHIP_THRESHOLD
                            ? 'Đơn hàng được <strong>miễn phí vận chuyển!</strong>'
                            : 'Mua thêm <strong>' + formatCurrency(FREE_SHIP_THRESHOLD - subtotal) + '</strong> để miễn phí ship'}
                    </span>
                </div>

                <!-- Nút thanh toán -->
                <button id="checkout-btn" class="btn btn--primary btn--block cart-checkout-btn">
                    Tiến hành thanh toán →
                </button>
            </div>

        </div>
    `;

    attachCartEvents();

    // Cap nhat badge gio hang tren header
    updateHeaderCartBadge(currentUser.id, cart);
}

// Build HTML 1 dong san pham
/**
 * Taoi HTML cho 1 san pham trong gio hang
 * @param {Object} item - { productId, name, image, price, quantity, stock }
 */
function buildCartItemHTML(item) {
    const imgSrc   = item.image ? basePath + item.image : basePath + 'images/placeholder-product.jpg';
    const itemTotal = item.price * item.quantity;
    const detailUrl = basePath + 'product-detail/product-detail.html?id=' + item.productId;

    return `
        <div class="cart-item" data-product-id="${item.productId}">

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

            <!-- Số lượng: nút - / input / nút + -->
            <div class="cart-item__qty" data-label="Số lượng">
                <div class="qty-control">
                    <button class="qty-control__btn qty-btn-minus"
                            data-id="${item.productId}"
                            aria-label="Giảm số lượng">−</button>
                    <input  class="qty-control__input qty-input"
                            type="number"
                            value="${item.quantity}"
                            min="1"
                            max="${item.stock}"
                            data-id="${item.productId}"
                            readonly>
                    <button class="qty-control__btn qty-btn-plus"
                            data-id="${item.productId}"
                            aria-label="Tăng số lượng">+</button>
                </div>
            </div>

            <!-- Thành tiền -->
            <div class="cart-item__total" data-label="Thành tiền">
                <strong>${formatCurrency(itemTotal)}</strong>
            </div>

            <!-- Nút xóa -->
            <div class="cart-item__remove">
                <button class="cart-item__remove-btn btn-delete"
                        data-id="${item.productId}"
                        aria-label="Xóa sản phẩm">
                    🗑️
                </button>
            </div>

        </div>
    `;
}

// Gan su kien
function attachCartEvents() {
    const itemList   = document.getElementById('cart-item-list');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Su kien tren danh sach san pham
    if (itemList) {
        itemList.addEventListener('click', function (e) {
            // Nut giam so luong
            if (e.target.classList.contains('qty-btn-minus')) {
                const productId = e.target.dataset.id;
                const input     = itemList.querySelector('.qty-input[data-id="' + productId + '"]');
                const current   = parseInt(input.value) || 1;
                if (current > 1) {
                    updateQuantity(productId, current - 1);
                }
            }

            // Nut tang so luong
            if (e.target.classList.contains('qty-btn-plus')) {
                const productId = e.target.dataset.id;
                const input     = itemList.querySelector('.qty-input[data-id="' + productId + '"]');
                const current   = parseInt(input.value) || 1;
                const max       = parseInt(input.max) || 99;
                if (current < max) {
                    updateQuantity(productId, current + 1);
                }
            }

            // Nut xoa sanp ham
            if (e.target.classList.contains('btn-delete')) {
                const productId = e.target.dataset.id;
                if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                    deleteCartItem(productId);
                }
            }
        });
    }

    // Nut xoa thanh toan
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            window.location.href = basePath + 'checkout/index.html';
        });
    }
}

// Cap nhat so luong
/**
 * Cap nhat so luong cua 1 san pham trong gio hang
 * @param {string|number} productId - ID san pham can cap nhat
 * @param {number}        newQty    - Sp luong moi
 */
function updateQuantity(productId, newQty) {
    // Lay user hien tai
    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) throw new Error();
    } catch (e) {
        window.location.href = basePath + 'login/index.html';
        return;
    }

    // Lay gio hang
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        cart = [];
    }

    // Tim dung item cua user nay voi productId 
    const index = cart.findIndex(function (item) {
        return item.userId == currentUser.id && item.productId == productId;
    });

    if (index === -1) {
        console.warn('[cart.js] updateQuantity: Không tìm thấy sản phẩm ID', productId);
        return;
    }

    // Cap nhat so luong
    cart[index].quantity = newQty;

    // luu lai local storage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Render lai gio hang va cap nhat badge header
    renderCart();
}

// Xoa san pham
/**
 * Xoa 1 san pham khoi gio hang cua user hien tai
 * @param {string|number} productId - ID san pham can xoa
 */
function deleteCartItem(productId) {
    // Lay user hien tai
    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) throw new Error();
    } catch (e) {
        window.location.href = basePath + 'login/login.html';
        return;
    }

    // Lay gio hang va loc bo item can xoa
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        cart = [];
    }

    const newCart = cart.filter(function (item) {
        // Giu lai tat ca cac item ngoai tru item cuar user voi product 
        return !(item.userId == currentUser.id && item.productId == productId);
    });

    // Luu lai local storage
    localStorage.setItem('cart', JSON.stringify(newCart));

    // Render lai gio hang va cap nhat badge header
    renderCart();
}

// Cap nhat badge header
/**
 * cap nhat so luong hien thi tren gio hang tren icon o gio hang.
 * @param {string|number} userId - ID user hiện tại
 * @param {Array}         cart   - Mảng giỏ hàng hiện tại
 */
function updateHeaderCartBadge(userId, cart) {
    const badge = document.getElementById('header-cart-count');
    if (!badge) return;

    // Tinh tong so luong cua user nay
    const totalQty = cart
        .filter(function (item) { return item.userId == userId; })
        .reduce(function (sum, item) { return sum + (item.quantity || 1); }, 0);

    badge.textContent = totalQty > 0 ? totalQty : '';
    badge.classList.toggle('cart-badge--hidden', totalQty === 0);
}

// TRang thai dac biet

// Hien thi giao dien khi gio hang trong
function showEmptyCart() {
    const content = document.getElementById('cart-content');
    if (!content) return;
    content.innerHTML = `
        <div class="cart-empty">
            <div class="cart-empty__icon">🛒</div>
            <h2 class="cart-empty__title">Giỏ hàng của bạn đang trống</h2>
            <p class="cart-empty__sub">Hãy khám phá các sản phẩm và thêm vào giỏ hàng nhé!</p>
            <a href="../product-list/index.html" class="btn btn--primary">
                Mua sắm ngay
            </a>
        </div>
    `;
}

// hien thi yeu cau dang nhap khi co tia khoan
function showLoginRequired() {
    const content = document.getElementById('cart-content');
    if (content) {
        content.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty__icon">🔐</div>
                <h2 class="cart-empty__title">Vui lòng đăng nhập</h2>
                <p class="cart-empty__sub">Bạn cần đăng nhập để xem giỏ hàng của mình.</p>
                <a href="${basePath}login/index.html" class="btn btn--primary">
                    Đăng nhập
                </a>
            </div>
        `;
    }
    // Cap nhat text tieu de
    const countText = document.getElementById('cart-count-text');
    if (countText) countText.textContent = '';
}