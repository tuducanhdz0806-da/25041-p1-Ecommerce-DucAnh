// product-detail/product-detail.js

let currentProduct  = null; 
let selectedQuantity = 1; 
document.addEventListener('DOMContentLoaded', function () {
    loadData();
    loadHeader();
    loadFooter();

    // Lay id san pham tu URL
    const params    = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        showNotFound();
        return;
    }

    // Load va render san pham chi tiet
    loadProductDetail(productId);
});

function loadProductDetail(productId) {
    // Lay mang products tu loclastorage
    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (e) {
        console.error('[product-detail.js] Lỗi đọc products:', e);
    }

    // Tim san pham co id khop
    currentProduct = products.find(function (p) { return p.id == productId; });

    if (!currentProduct) {
        showNotFound();
        return;
    }

    // Cap nhat breadcrumb va title trang
    const breadcrumb = document.getElementById('breadcrumb-product-name');
    if (breadcrumb) breadcrumb.textContent = currentProduct.name;
    document.title = currentProduct.name + ' — TechWorld PC';

    // Render giao dien
    renderProductDetail();
}

// Render chi tiet san pham
function renderProductDetail() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const images = (currentProduct.images && currentProduct.images.length > 0)
        ? currentProduct.images
        : (currentProduct.image ? [currentProduct.image] : []);

    const mainImgSrc = images.length > 0
        ? basePath + images[0]
        : basePath + 'images/placeholder-product.jpg';

    let thumbnailsHTML = '';
    if (images.length > 1) {
        images.slice(0, 5).forEach(function (img, index) {
            thumbnailsHTML += `
                <img src="${basePath + img}"
                     alt="${currentProduct.name} ảnh ${index + 1}"
                     class="pd-thumbnail ${index === 0 ? 'pd-thumbnail--active' : ''}"
                     data-src="${basePath + img}"
                     onerror="this.src='${basePath}images/placeholder-product.jpg'">
            `;
        });
    }

    // Badge va gia
    const hasDiscount = currentProduct.discountPrice && currentProduct.discountPrice < currentProduct.price;

    const priceHTML = hasDiscount
        ? `<span class="pd-price__current">${formatCurrency(currentProduct.discountPrice)}</span>
           <span class="pd-price__original">${formatCurrency(currentProduct.price)}</span>
           <span class="pd-price__badge">-${Math.round((1 - currentProduct.discountPrice / currentProduct.price) * 100)}%</span>`
        : `<span class="pd-price__current">${formatCurrency(currentProduct.price)}</span>`;

    // Ton kho
    let stockHTML = '';
    if (currentProduct.stock === 0) {
        stockHTML = `<span class="pd-stock pd-stock--out">● Hết hàng</span>`;
    } else if (currentProduct.stock <= 5) {
        stockHTML = `<span class="pd-stock pd-stock--low">● Sắp hết hàng (còn ${currentProduct.stock})</span>`;
    } else {
        stockHTML = `<span class="pd-stock pd-stock--in">● Còn hàng</span>`;
    }

    // Thong so ky thuat
    let specsHTML = '';
    if (currentProduct.specifications && typeof currentProduct.specifications === 'object') {
        const rows = Object.entries(currentProduct.specifications).map(function (entry) {
            return `<tr>
                        <td class="specs-table__key">${entry[0]}</td>
                        <td class="specs-table__val">${entry[1]}</td>
                    </tr>`;
        }).join('');
        specsHTML = `
            <div class="pd-specs">
                <h2 class="pd-specs__title">Thông số kỹ thuật</h2>
                <table class="specs-table">
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } else if (typeof currentProduct.specifications === 'string') {
        specsHTML = `
            <div class="pd-specs">
                <h2 class="pd-specs__title">Thông số kỹ thuật</h2>
                <p class="pd-specs__text">${currentProduct.specifications}</p>
            </div>
        `;
    }

    // Render toan bo HTML
    container.innerHTML = `

        <!-- PHẦN TRÊN: 2 cột (ảnh + thông tin) -->
        <div class="pd-layout">

            <!-- CỘT TRÁI: Ảnh sản phẩm -->
            <div class="pd-image">
                <div class="pd-image__main-wrap">
                    <img src="${mainImgSrc}"
                         alt="${currentProduct.name}"
                         class="pd-image__main"
                         id="main-product-img"
                         onerror="this.src='${basePath}images/placeholder-product.jpg'">
                </div>
                ${thumbnailsHTML
                    ? `<div class="pd-image__thumbs" id="thumb-list">${thumbnailsHTML}</div>`
                    : ''}
            </div>

            <!-- CỘT PHẢI: Thông tin sản phẩm -->
            <div class="pd-info">

                <!-- Tên -->
                <h1 class="pd-info__name">${currentProduct.name}</h1>

                <!-- Giá -->
                <div class="pd-price">${priceHTML}</div>

                <!-- Tồn kho -->
                <div class="pd-info__stock">${stockHTML}</div>

                <!-- Mô tả ngắn -->
                ${currentProduct.description
                    ? `<p class="pd-info__desc">${currentProduct.description}</p>`
                    : ''}

                <!-- Nhà sản xuất -->
                ${currentProduct.manufacturer
                    ? `<p class="pd-info__meta">
                           <span class="pd-info__meta-key">Nhà sản xuất:</span>
                           ${currentProduct.manufacturer}
                       </p>`
                    : ''}

                <!-- Danh mục -->
                ${currentProduct.category
                    ? `<p class="pd-info__meta">
                           <span class="pd-info__meta-key">Danh mục:</span>
                           ${currentProduct.category}
                       </p>`
                    : ''}

                <div class="pd-divider"></div>

                <!-- Chọn số lượng -->
                <div class="pd-qty">
                    <span class="pd-qty__label">Số lượng:</span>
                    <div class="pd-qty__control">
                        <button class="pd-qty__btn" id="qty-minus" aria-label="Giảm">−</button>
                        <input  class="pd-qty__input"
                                type="number"
                                id="qty-input"
                                value="1" min="1"
                                max="${currentProduct.stock || 99}"
                                readonly>
                        <button class="pd-qty__btn" id="qty-plus" aria-label="Tăng">+</button>
                    </div>
                </div>

                <!-- Nút hành động -->
                <div class="pd-actions">
                    <button class="btn btn--primary pd-actions__cart ${currentProduct.stock === 0 ? 'btn--disabled' : ''}"
                            id="add-to-cart-btn"
                            ${currentProduct.stock === 0 ? 'disabled' : ''}>
                        🛒 Thêm vào giỏ hàng
                    </button>
                    <a href="../product-list/index.html" class="btn btn--outline pd-actions__back">
                        ← Tiếp tục mua sắm
                    </a>
                </div>

                <!-- Thông báo sau khi thêm giỏ -->
                <div id="cart-msg" class="pd-cart-msg" style="display:none;"></div>

            </div>
        </div>

        <!-- PHẦN DƯỚI: Thông số kỹ thuật -->
        ${specsHTML}
    `;

    // Gan cac su kien sau khi HTML dc render vao DOM
    attachEvents(images);
}


// Gan su kien
function attachEvents(images) {

    const thumbList = document.getElementById('thumb-list');
    if (thumbList) {
        thumbList.addEventListener('click', function (e) {
            const thumb = e.target.closest('.pd-thumbnail');
            if (!thumb) return;

            const mainImg = document.getElementById('main-product-img');
            if (mainImg) mainImg.src = thumb.dataset.src;

            document.querySelectorAll('.pd-thumbnail').forEach(function (t) {
                t.classList.remove('pd-thumbnail--active');
            });
            thumb.classList.add('pd-thumbnail--active');
        });
    }

    // nut tang/giam so luong
    const qtyInput = document.getElementById('qty-input');
    const maxStock = currentProduct.stock || 99;

    document.getElementById('qty-minus')?.addEventListener('click', function () {
        const current = parseInt(qtyInput.value) || 1;
        if (current > 1) {
            qtyInput.value = current - 1;
            selectedQuantity = current - 1;
        }
    });

    document.getElementById('qty-plus')?.addEventListener('click', function () {
        const current = parseInt(qtyInput.value) || 1;
        if (current < maxStock) {
            qtyInput.value = current + 1;
            selectedQuantity = current + 1;
        } else {
            showCartMsg('Đã đạt số lượng tối đa có thể đặt (' + maxStock + ').', 'warn');
        }
    });

    // Nut them gio hang
    document.getElementById('add-to-cart-btn')?.addEventListener('click', function () {
        selectedQuantity = parseInt(qtyInput.value) || 1;
        addToCart();
    });
}

// =============================================================
// THÊM VÀO GIỎ HÀNG
// =============================================================
function addToCart() {
    // Kiem tra dang nhap
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        // Luu lai trang hien tai de sau khi dang nhap quay lai
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        if (confirm('Bạn cần đăng nhập để thêm vào giỏ hàng.\nChuyển đến trang đăng nhập?')) {
            window.location.href = basePath + 'login/login.html';
        }
        return;
    }

    // Bước 2: Parse thong tin user
    let currentUser;
    try {
        currentUser = JSON.parse(currentUserJson);
        if (!currentUser || !currentUser.id) throw new Error('User không hợp lệ');
    } catch (e) {
        console.error('[product-detail.js] Lỗi parse currentUser:', e);
        localStorage.removeItem('currentUser');
        window.location.href = basePath + 'login/login.html';
        return;
    }

    // Kiem tra ton kho
    if (!currentProduct || currentProduct.stock === 0) {
        showCartMsg('Sản phẩm này đã hết hàng.', 'error');
        return;
    }

    // Lay gio hang hien tai
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        cart = [];
    }

    // Kiem tra xem san pham da co trong gio hang user nay chua
    const existIndex = cart.findIndex(function (item) {
        return item.productId == currentProduct.id && item.userId == currentUser.id;
    });

    if (existIndex > -1) {
        // Da co -> tang so luong, nhung khong vuot qua ton kho
        const newQty = cart[existIndex].quantity + selectedQuantity;
        if (newQty > currentProduct.stock) {
            showCartMsg(
                'Số lượng trong giỏ đã đạt tối đa (' + currentProduct.stock + ' sản phẩm).',
                'warn'
            );
            return;
        }
        cart[existIndex].quantity = newQty;
    } else {
        // chua co -> them moi vao gio hang
        const newItem = {
            userId:      currentUser.id,
            productId:   currentProduct.id,
            name:        currentProduct.name,
            image:       currentProduct.image || '',
            price:       currentProduct.discountPrice || currentProduct.price,
            quantity:    selectedQuantity
        };
        cart.push(newItem);
    }

    // Luu lai gio hang vao localstorage
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
        console.error('[product-detail.js] Lỗi lưu cart:', e);
        showCartMsg('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
        return;
    }

    // cap nhat badge gio hang tren header
    const badge = document.getElementById('header-cart-count');
    if (badge) {
        const userCart = cart.filter(function (i) { return i.userId == currentUser.id; });
        const count    = userCart.reduce(function (s, i) { return s + (i.quantity || 1); }, 0);
        badge.textContent = count > 0 ? count : '';
        badge.classList.toggle('cart-badge--hidden', count === 0);
    }

    // reset so luong ve 1 va hien thong bao thanh cong
    selectedQuantity = 1;
    const qtyInput = document.getElementById('qty-input');
    if (qtyInput) qtyInput.value = '1';

    showCartMsg('✓ Đã thêm vào giỏ hàng thành công!', 'success');
}


// Thong bao nho ngay duoi nut "Them vao gio"
function showCartMsg(msg, type) {
    const el = document.getElementById('cart-msg');
    if (!el) return;

    el.textContent  = msg;
    el.style.display = 'block';
    el.className    = 'pd-cart-msg pd-cart-msg--' + type;

    // Tu an sau 3 giay
    clearTimeout(el._timeout);
    el._timeout = setTimeout(function () {
        el.style.display = 'none';
    }, 3000);
}

// Trang bao loi khong tim thay san pham
function showNotFound() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;
    container.innerHTML = `
        <div class="pd-not-found">
            <div class="pd-not-found__icon">📦</div>
            <h2 class="pd-not-found__title">Không tìm thấy sản phẩm</h2>
            <p class="pd-not-found__sub">Sản phẩm không tồn tại hoặc đã bị xóa.</p>
            <a href="../product-list/index.html" class="btn btn--primary">
                ← Quay lại danh sách sản phẩm
            </a>
        </div>
    `;
}