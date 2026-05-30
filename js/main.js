// js/main.js
// Script dành riêng cho trang chủ (index.html).
// Các hàm dùng chung (loadData, loadHeader, loadFooter, formatCurrency)
// đã được định nghĩa trong common.js — KHÔNG định nghĩa lại ở đây.

// =============================================================
// KHỞI ĐỘNG ỨNG DỤNG
// =============================================================

document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

/**
 * Điểm khởi động chính của trang chủ.
 * Thứ tự gọi quan trọng: loadData trước, sau đó mới render UI.
 */
function initApp() {
    loadData();                  // common.js — nạp dữ liệu mock vào localStorage nếu chưa có
    loadHeader();                // common.js — render header + nav + search
    loadFooter();                // common.js — render footer
    renderHeroBanner();          // trang chủ   — banner giới thiệu
    renderCategories();          // trang chủ   — danh mục sản phẩm
    renderFeaturedProducts();    // trang chủ   — sản phẩm nổi bật
    renderWhyChooseUs();         // trang chủ   — lý do chọn TechWorld
}

// =============================================================
// 1. HERO BANNER
// =============================================================

/**
 * Render banner hero phía trên trang chủ.
 * Target: <section id="hero-banner">
 */
function renderHeroBanner() {
    const el = document.getElementById('hero-banner');
    if (!el) return;

    el.innerHTML = `
        <div class="hero-content">
            <p class="hero-eyebrow">&#127381; Siêu Sale tháng 6 — Giảm đến 15%</p>
            <h1 class="hero-title">Linh kiện PC chính hãng<br><span>Giá tốt nhất thị trường</span></h1>
            <p class="hero-subtitle">
                Hơn 500 sản phẩm CPU, VGA, RAM, SSD từ các thương hiệu Intel, AMD,
                NVIDIA, Samsung, Kingston và nhiều hơn nữa.
            </p>
            <div class="hero-actions">
                <a href="${basePath}product-list/product-list.html" class="btn btn--primary btn--lg">
                    Mua ngay
                </a>
                <a href="${basePath}product-list" class="btn btn--outline btn--lg">
                    &#128295; Tự Build PC
                </a>
            </div>
            <div class="hero-stats">
                <div class="hero-stat"><strong>500+</strong><span>Sản phẩm</span></div>
                <div class="hero-stat"><strong>10.000+</strong><span>Khách hàng</span></div>
                <div class="hero-stat"><strong>99%</strong><span>Hài lòng</span></div>
                <div class="hero-stat"><strong>24/7</strong><span>Hỗ trợ</span></div>
            </div>
        </div>
    `;
}

// =============================================================
// 2. DANH MỤC SẢN PHẨM
// =============================================================

// Map icon cho từng slug danh mục
const CATEGORY_ICONS = {
    // Thêm basePath vào trước đường dẫn ảnh
    'pc-gaming':       basePath + 'images/categories/pc-gaming.jpg',
    'pc-van-phong':    basePath + 'images/categories/pc-office.png',
    'pc-do-hoa':       basePath + 'images/categories/pc-graphic.png',
    'cpu':             basePath + 'images/categories/cpu.jpg',
    'vga':             basePath + 'images/categories/vga.jpg',
    'mainboard':       basePath + 'images/categories/mainboard.jpg',
    'ram':             basePath + 'images/categories/ram.jpg',
    'ssd':             basePath + 'images/categories/ssd.jpg',
    'psu-nguon':       basePath + 'images/categories/psu.jpg',
    'case':            basePath + 'images/categories/case.png',
};  

/**
 * Render danh sách danh mục.
 * Target: <section id="categories">
 */
function renderCategories() {
    const el = document.getElementById('categories');
    if (!el) return;

    let categories = [];
    try {
        categories = JSON.parse(localStorage.getItem('categories')) || [];
    } catch (e) {
        console.error('[main.js] Lỗi đọc categories:', e);
    }

    if (categories.length === 0) {
        el.innerHTML = '<p class="empty-msg">Chưa có danh mục nào.</p>';
        return;
    }

    const cards = categories.map(function (cat) {
        // Lấy đường dẫn ảnh từ map, nếu không có thì dùng một ảnh mặc định
        const imgSrc = CATEGORY_ICONS[cat.slug] || 'images/categories/default-cat.png';
        const url  = `${basePath}product-list/product-list.html?categoryId=${cat.id}`;

        return `
            <a href="${url}" class="category-card" data-category-id="${cat.id}">
                <div class="category-card__icon">
                    <img src="${imgSrc}" alt="${cat.name}" class="category-icon-img">
                </div>
                <h3 class="category-card__name">${cat.name}</h3>
                <p class="category-card__desc">${cat.description || ''}</p>
                <span class="category-card__cta">Xem tất cả &#8594;</span>
            </a>
        `;
    }).join('');

    el.innerHTML = cards;
}

// =============================================================
// 3. SẢN PHẨM NỔI BẬT
// =============================================================

/**
 * Tính giá thấp nhất từ mảng units của sản phẩm.
 * Nếu không có units, fallback về product.price.
 * @param {Object} product
 * @returns {number|null}
 */
function getLowestPrice(product) {
    if (Array.isArray(product.units) && product.units.length > 0) {
        const prices = product.units
            .map(function (u) { return u.price; })
            .filter(function (p) { return typeof p === 'number' && !isNaN(p); });
        if (prices.length > 0) return Math.min.apply(null, prices);
    }
    if (typeof product.price === 'number') return product.price;
    return null;
}

/**
 * Xây dựng HTML badge cho sản phẩm.
 * Ưu tiên: discountPrice → badge "Sale", stock thấp → badge "Hot", mặc định → "Nổi bật".
 * @param {Object} product
 * @returns {string}
 */
function buildProductBadge(product) {
    if (product.discountPrice && product.discountPrice < product.price) {
        const pct = Math.round((1 - product.discountPrice / product.price) * 100);
        return `<span class="product-badge product-badge--sale">Sale -${pct}%</span>`;
    }
    if (typeof product.stock === 'number' && product.stock <= 5 && product.stock > 0) {
        return `<span class="product-badge product-badge--hot">&#128293; Hot</span>`;
    }
    return `<span class="product-badge product-badge--featured">Nổi bật</span>`;
}

/**
 * Xây dựng HTML hiển thị giá (giá gốc + giá khuyến mãi nếu có).
 * @param {Object} product
 * @returns {string}
 */
function buildPriceHTML(product) {
    const lowestPrice = getLowestPrice(product);

    // Ưu tiên hiển thị discountPrice nếu có
    if (product.discountPrice && product.discountPrice < product.price) {
        return `
            <div class="product-price">
                <span class="product-price__current">${formatCurrency(product.discountPrice)}</span>
                <span class="product-price__original">${formatCurrency(product.price)}</span>
            </div>
        `;
    }

    // Không có discountPrice → dùng giá thấp nhất từ units hoặc price
    if (lowestPrice !== null) {
        return `
            <div class="product-price">
                <span class="product-price__current">${formatCurrency(lowestPrice)}</span>
            </div>
        `;
    }

    return `<div class="product-price"><span class="product-price__current">Liên hệ</span></div>`;
}

/**
 * Xây dựng HTML thông tin tồn kho.
 * @param {Object} product
 * @returns {string}
 */
function buildStockHTML(product) {
    if (typeof product.stock !== 'number') return '';
    if (product.stock === 0) {
        return `<span class="product-stock product-stock--out">Hết hàng</span>`;
    }
    if (product.stock <= 5) {
        return `<span class="product-stock product-stock--low">Còn ${product.stock} sản phẩm</span>`;
    }
    return `<span class="product-stock product-stock--in">Còn hàng</span>`;
}

/**
 * Render danh sách sản phẩm nổi bật 
 */
function renderFeaturedProducts() {
    const el = document.getElementById('featured-products');
    if (!el) return;

    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (e) {
        console.error('[main.js] Lỗi đọc products:', e);
    }

    // Chỉ lấy sản phẩm active, tối đa 8 sản phẩm
    const featured = products
        .filter(function (p) { return p.status === 'active'; })
        .slice(0, 8);

    if (featured.length === 0) {
        el.innerHTML = '<p class="empty-msg">Chưa có sản phẩm nổi bật.</p>';
        return;
    }

    const cards = featured.map(function (product) {
        const detailUrl  = `${basePath}product-detail/product-detail.html?id=${product.id}`;
        const imgSrc = product.image ? (basePath + product.image) : '';
        const imgAlt     = product.name  || 'Sản phẩm';
        const isOutStock = product.stock === 0;

        return `
            <article class="product-card" data-product-id="${product.id}">

                <!-- Ảnh sản phẩm -->
                <a href="${detailUrl}" class="product-card__img-wrap" tabindex="-1" aria-hidden="true">
                    <img
                        src="${imgSrc}"
                        alt="${imgAlt}"
                        class="product-card__img"
                        loading="lazy"
                        onerror="this.src='${basePath}images/placeholder-product.jpg'"
                    >
                    ${buildProductBadge(product)}
                </a>

                <!-- Nội dung -->
                <div class="product-card__body">

                    <!-- Tên sản phẩm -->
                    <a href="${detailUrl}" class="product-card__name" title="${product.name}">
                        ${product.name}
                    </a>

                    <!-- Mô tả ngắn -->
                    <p class="product-card__desc">
                        ${product.description ? product.description.substring(0, 80) + '...' : ''}
                    </p>

                    <!-- Giá -->
                    ${buildPriceHTML(product)}

                    <!-- Tồn kho -->
                    ${buildStockHTML(product)}

                    <!-- Nút hành động -->
                    <div class="product-card__actions">
                        <a href="${detailUrl}" class="btn btn--primary btn--sm btn--block">
                            Xem chi tiết
                        </a>
                        ${!isOutStock ? `
                        <button
                            class="btn btn--ghost btn--sm btn--icon"
                            onclick="handleAddToCart(${product.id})"
                            title="Thêm vào giỏ hàng"
                            aria-label="Thêm ${product.name} vào giỏ hàng"
                        >
                            &#128722;
                        </button>` : ''}
                    </div>

                </div>
            </article>
        `;
    }).join('');

    el.innerHTML = cards;
}

// =============================================================
// 4. THÊM VÀO GIỎ HÀNG (nhanh từ trang chủ)
// =============================================================

/**
 * Thêm nhanh sản phẩm vào giỏ hàng ngay từ trang chủ.
 * Nếu chưa đăng nhập → chuyển đến trang login.
 * Nếu đã có trong giỏ → tăng số lượng lên 1.
 * @param {number} productId
 */
function handleAddToCart(productId) {
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        if (confirm('Bạn cần đăng nhập để thêm vào giỏ hàng.\nChuyển đến trang đăng nhập?')) {
            window.location.href = `${basePath}login/login.html`;
        }
        return;
    }

    let currentUser;
    try {
        currentUser = JSON.parse(currentUserJson);
    } catch (e) {
        console.error('[main.js] Lỗi parse currentUser:', e);
        return;
    }

    // Lấy sản phẩm từ localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product  = products.find(function (p) { return p.id === productId; });

    if (!product) {
        alert('Không tìm thấy sản phẩm!');
        return;
    }
    if (product.stock === 0) {
        alert('Sản phẩm này đã hết hàng.');
        return;
    }

    // Lấy giỏ hàng hiện tại
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Kiểm tra sản phẩm đã có trong giỏ của user chưa
    const existingIndex = cart.findIndex(function (item) {
        return item.productId === productId && item.userId == currentUser.id;
    });

    if (existingIndex > -1) {
        // Đã có → tăng số lượng (không vượt tồn kho)
        const newQty = cart[existingIndex].quantity + 1;
        if (newQty > product.stock) {
            alert(`Số lượng tối đa có thể đặt là ${product.stock} sản phẩm.`);
            return;
        }
        cart[existingIndex].quantity = newQty;
    } else {
        // Chưa có → thêm mới
        const unitPrice = product.discountPrice || getLowestPrice(product) || product.price;
        cart.push({
            userId:    currentUser.id,
            productId: product.id,
            name:      product.name,
            image:     product.image || '',
            price:     unitPrice,
            quantity:  1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Cập nhật số đếm giỏ hàng trên header không cần reload trang
    updateHeaderCartCount();

    // Thông báo nhỏ không chặn UI
    showToast(`&#10003; Đã thêm "${product.name}" vào giỏ hàng!`);
}

// =============================================================
// 5. WHY CHOOSE US
// =============================================================

/**
 * Render khối "Tại sao chọn TechWorld PC".
 * Target: <section id="why-choose-us">
 */
function renderWhyChooseUs() {
    const el = document.getElementById('why-choose-us');
    if (!el) return;

    const features = [
        {
            icon: '&#9989;',
            title: 'Hàng chính hãng 100%',
            desc:  'Tất cả sản phẩm có tem chính hãng, hóa đơn VAT, nguồn gốc rõ ràng.'
        },
        {
            icon: '&#128666;',
            title: 'Giao hàng toàn quốc',
            desc:  'Giao nhanh trong 2–4h tại TP.HCM & Hà Nội. Toàn quốc trong 1–3 ngày.'
        },
        {
            icon: '&#128295;',
            title: 'Bảo hành tận nơi',
            desc:  'Bảo hành chính hãng, hỗ trợ kỹ thuật 24/7, đổi mới trong 7 ngày.'
        },
        {
            icon: '&#128176;',
            title: 'Giá cạnh tranh nhất',
            desc:  'Cam kết hoàn tiền nếu tìm được nơi bán rẻ hơn với sản phẩm tương đương.'
        }
    ];

    const items = features.map(function (f) {
        return `
            <div class="feature-card">
                <div class="feature-card__icon">${f.icon}</div>
                <h3 class="feature-card__title">${f.title}</h3>
                <p class="feature-card__desc">${f.desc}</p>
            </div>
        `;
    }).join('');

    el.innerHTML = `<div class="container why-choose-us-grid">${items}</div>`;
}

// =============================================================
// 6. TIỆN ÍCH: TOAST NOTIFICATION
// =============================================================

/**
 * Hiển thị thông báo nhỏ (toast) góc dưới bên phải màn hình.
 * Tự động biến mất sau 3 giây.
 * @param {string} message  — Chuỗi HTML hoặc text thuần
 */
function showToast(message) {
    // Tái sử dụng container nếu đã tồn tại
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.style.cssText = [
            'position:fixed', 'bottom:24px', 'right:24px',
            'z-index:9999', 'display:flex', 'flex-direction:column',
            'gap:8px', 'pointer-events:none'
        ].join(';');
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    toast.style.cssText = [
        'background:#1e293b', 'color:#f8fafc',
        'padding:12px 20px', 'border-radius:8px',
        'font-size:14px', 'box-shadow:0 4px 12px rgba(0,0,0,0.3)',
        'opacity:0', 'transform:translateY(12px)',
        'transition:opacity 0.25s ease,transform 0.25s ease',
        'pointer-events:auto'
    ].join(';');

    container.appendChild(toast);

    // Trigger animation (sau 1 frame)
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            toast.style.opacity  = '1';
            toast.style.transform = 'translateY(0)';
        });
    });

    // Tự xóa sau 3 giây
    setTimeout(function () {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

// =============================================================
// 7. TIỆN ÍCH: CẬP NHẬT SỐ ĐẾM GIỎ HÀNG TRÊN HEADER
// =============================================================

/**
 * Cập nhật số lượng giỏ hàng hiển thị trên header mà không reload trang.
 * Hàm này cũng được dùng trong common.js — khai báo lại ở đây để
 * handleAddToCart gọi được ngay sau khi thêm sản phẩm.
 */
function updateHeaderCartCount() {
    const badge = document.getElementById('header-cart-count');
    if (!badge) return;

    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        badge.textContent = '';
        badge.classList.add('cart-badge--hidden');
        return;
    }

    try {
        const currentUser = JSON.parse(currentUserJson);
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart
            .filter(function (item) { return item.userId == currentUser.id; })
            .reduce(function (sum, item) { return sum + (item.quantity || 1); }, 0);

        badge.textContent = count > 0 ? count : '';
        badge.classList.toggle('cart-badge--hidden', count === 0);
    } catch (e) {
        console.error('[main.js] Lỗi cập nhật cart count:', e);
    }
}   