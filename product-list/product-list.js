// product-list/product-list.js
// Kế thừa: basePath, formatCurrency, loadHeader, loadFooter, loadData từ common.js

// =============================================================
// BIẾN TOÀN CỤC
// =============================================================
let currentPage    = 1;
const ITEMS_PER_PAGE = 12;   // 12 sản phẩm/trang — đẹp với grid 4 cột (3 hàng)

let currentFilters = {
    categories: [],   // mảng id danh mục đang chọn
    minPrice:   '',
    maxPrice:   ''
};
let currentSort        = 'default';
let filteredProducts   = [];
let currentSearchQuery = '';

// =============================================================
// KHỞI ĐỘNG
// =============================================================
document.addEventListener('DOMContentLoaded', function () {
    // Nạp dữ liệu vào localStorage nếu chưa có (từ common.js)
    if (typeof loadData === 'function') loadData();

    // Render header & footer (từ common.js)
    if (typeof loadHeader === 'function') loadHeader();
    if (typeof loadFooter === 'function') loadFooter();

    initializeProductList();
});

function initializeProductList() {
    // Đọc tham số từ URL: ?search=...&categoryId=...
    const params     = new URLSearchParams(window.location.search);
    const searchParam  = params.get('search');
    const categoryParam = params.get('categoryId');

    if (searchParam) {
        currentSearchQuery = decodeURIComponent(searchParam);
        showSearchBanner();
    }

    if (categoryParam) {
        currentFilters.categories = [categoryParam];
    }

    renderFilters();
    setupEventListeners();
    applyFiltersAndSort();
}

// =============================================================
// GẮN SỰ KIỆN
// =============================================================
function setupEventListeners() {
    // Áp dụng bộ lọc
    document.getElementById('apply-filters')
        ?.addEventListener('click', function () {
            collectFilters();
            currentPage = 1;
            applyFiltersAndSort();
        });

    // Xóa bộ lọc
    document.getElementById('clear-filters')
        ?.addEventListener('click', function () {
            clearFilters();
            applyFiltersAndSort();
        });

    // Sắp xếp
    document.getElementById('sort-select')
        ?.addEventListener('change', function () {
            currentSort = this.value;
            currentPage = 1;
            applyFiltersAndSort();
        });

    // Xóa tìm kiếm
    document.getElementById('clear-search')
        ?.addEventListener('click', function () {
            currentSearchQuery = '';
            hideSearchBanner();
            currentPage = 1;
            applyFiltersAndSort();
        });

    // Xóa tất cả filter + search
    document.getElementById('clear-all-filters')
        ?.addEventListener('click', function () {
            clearAllFilters();
            applyFiltersAndSort();
        });

    // Empty state: xóa tất cả
    document.getElementById('reset-all')
        ?.addEventListener('click', function () {
            clearAllFilters();
            applyFiltersAndSort();
        });

    // Toggle sidebar trên mobile
    document.getElementById('toggle-filters')
        ?.addEventListener('click', function () {
            const body = document.getElementById('filter-content');
            const icon = this.querySelector('.icon');
            body.classList.toggle('filter-sidebar__body--collapsed');
            icon.textContent = body.classList.contains('filter-sidebar__body--collapsed') ? '►' : '▼';
        });
}

// =============================================================
// RENDER BỘ LỌC
// =============================================================
function renderFilters() {
    const filterSection = document.getElementById('filter-section');
    if (!filterSection) return;

    let categories = [];
    try {
        categories = JSON.parse(localStorage.getItem('categories')) || [];
    } catch (e) {
        console.error('[product-list.js] Lỗi đọc categories:', e);
    }

    // ── Bộ lọc danh mục ──
    let catHTML = `
        <div class="filter-group">
            <h4 class="filter-group__title">Danh mục</h4>
            <ul class="filter-group__list">
    `;
    categories.forEach(function (cat) {
        const checked = currentFilters.categories.includes(String(cat.id)) ? 'checked' : '';
        catHTML += `
            <li class="filter-group__item">
                <label class="filter-checkbox">
                    <input type="checkbox"
                           value="${cat.id}"
                           data-filter="category"
                           ${checked}>
                    <span class="filter-checkbox__box"></span>
                    <span class="filter-checkbox__label">${cat.name}</span>
                </label>
            </li>
        `;
    });
    catHTML += `</ul></div>`;

    // ── Bộ lọc khoảng giá ──
    const priceHTML = `
        <div class="filter-group">
            <h4 class="filter-group__title">Khoảng giá (₫)</h4>
            <div class="filter-price">
                <input type="number" id="min-price" class="filter-price__input"
                       placeholder="Từ" min="0"
                       value="${currentFilters.minPrice}">
                <span class="filter-price__sep">–</span>
                <input type="number" id="max-price" class="filter-price__input"
                       placeholder="Đến" min="0"
                       value="${currentFilters.maxPrice}">
            </div>
            <!-- Giá nhanh -->
            <div class="filter-price__presets">
                <button class="filter-price__preset" data-min="0"       data-max="5000000">Dưới 5 triệu</button>
                <button class="filter-price__preset" data-min="5000000" data-max="15000000">5–15 triệu</button>
                <button class="filter-price__preset" data-min="15000000" data-max="30000000">15–30 triệu</button>
                <button class="filter-price__preset" data-min="30000000" data-max="">Trên 30 triệu</button>
            </div>
        </div>
    `;

    filterSection.innerHTML = catHTML + priceHTML;

    // Gắn sự kiện cho nút giá nhanh
    filterSection.querySelectorAll('.filter-price__preset').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.getElementById('min-price').value = this.dataset.min;
            document.getElementById('max-price').value = this.dataset.max;
            // Highlight nút đang chọn
            filterSection.querySelectorAll('.filter-price__preset')
                .forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
        });
    });
}

// =============================================================
// RENDER SẢN PHẨM
// =============================================================
function renderProductList(products) {
    const grid       = document.getElementById('product-grid');
    const emptyState = document.getElementById('empty-state');
    if (!grid) return;

    // Empty state
    if (products.length === 0) {
        grid.innerHTML     = '';
        grid.style.display = 'none';
        emptyState.style.display = 'flex';
        renderPagination(0);
        updateResultsCount(0);
        hideLoading();
        return;
    }

    emptyState.style.display = 'none';
    grid.style.display       = 'grid';

    // Phân trang
    const totalItems = products.length;
    const start      = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems  = products.slice(start, start + ITEMS_PER_PAGE);

    grid.innerHTML = pageItems.map(function (product) {
        return buildProductCard(product);
    }).join('');

    renderPagination(totalItems);
    updateResultsCount(totalItems);
    hideLoading();
}

function buildProductCard(product) {
    // ── Giá ──
    const effectivePrice = product.discountPrice || product.price;
    const priceHTML = (product.discountPrice && product.discountPrice < product.price)
        ? `<div class="product-price">
               <span class="product-price__current">${formatCurrency(product.discountPrice)}</span>
               <span class="product-price__original">${formatCurrency(product.price)}</span>
           </div>`
        : `<div class="product-price">
               <span class="product-price__current">${formatCurrency(product.price)}</span>
           </div>`;

    // ── Badge ──
    let badgeHTML = '';
    if (product.discountPrice && product.discountPrice < product.price) {
        const pct = Math.round((1 - product.discountPrice / product.price) * 100);
        badgeHTML = `<span class="product-badge product-badge--sale">-${pct}%</span>`;
    } else if (product.stock > 0 && product.stock <= 5) {
        badgeHTML = `<span class="product-badge product-badge--hot">🔥 Hot</span>`;
    }

    // ── Tồn kho ──
    let stockHTML = '';
    if (product.stock === 0) {
        stockHTML = `<span class="product-stock product-stock--out">Hết hàng</span>`;
    } else if (product.stock <= 5) {
        stockHTML = `<span class="product-stock product-stock--low">Còn ${product.stock}</span>`;
    } else {
        stockHTML = `<span class="product-stock product-stock--in">Còn hàng</span>`;
    }

    // ── Đường dẫn ──
    const imgSrc    = product.image ? (basePath + product.image) : '';
    const detailUrl = `${basePath}product-detail/product-detail.html?id=${product.id}`;

    return `
        <article class="product-card" data-product-id="${product.id}">
            <a href="${detailUrl}" class="product-card__img-wrap" tabindex="-1">
                <img src="${imgSrc}"
                     alt="${product.name}"
                     class="product-card__img"
                     loading="lazy"
                     onerror="this.src='${basePath}images/placeholder-product.jpg'">
                ${badgeHTML}
            </a>
            <div class="product-card__body">
                <a href="${detailUrl}" class="product-card__name" title="${product.name}">
                    ${product.name}
                </a>
                <p class="product-card__desc">
                    ${product.description ? product.description.substring(0, 75) + '...' : ''}
                </p>
                ${priceHTML}
                ${stockHTML}
                <div class="product-card__actions">
                    <a href="${detailUrl}" class="btn btn--primary btn--sm btn--block">
                        Xem chi tiết
                    </a>
                    ${product.stock > 0
                        ? `<button class="btn btn--ghost btn--sm btn--icon"
                                   onclick="handleAddToCartPL('${product.id}')"
                                   title="Thêm vào giỏ">🛒</button>`
                        : ''}
                </div>
            </div>
        </article>
    `;
}

// =============================================================
// PHÂN TRANG
// =============================================================
function renderPagination(totalItems) {
    const container = document.getElementById('pagination');
    if (!container) return;

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '';

    // Nút Trước
    html += `<button class="pl-page-btn pl-page-btn--prev"
                     ${currentPage === 1 ? 'disabled' : ''}
                     data-page="${currentPage - 1}">‹</button>`;

    // Số trang — hiển thị tối đa 5 nút
    const startPage = Math.max(1, currentPage - 2);
    const endPage   = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        html += `<button class="pl-page-btn" data-page="1">1</button>`;
        if (startPage > 2) html += `<span class="pl-page-ellipsis">…</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pl-page-btn ${i === currentPage ? 'pl-page-btn--active' : ''}"
                         data-page="${i}">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="pl-page-ellipsis">…</span>`;
        html += `<button class="pl-page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Nút Sau
    html += `<button class="pl-page-btn pl-page-btn--next"
                     ${currentPage === totalPages ? 'disabled' : ''}
                     data-page="${currentPage + 1}">›</button>`;

    container.innerHTML = html;

    // Sự kiện click — dùng event delegation
    container.addEventListener('click', function (e) {
        const btn = e.target.closest('.pl-page-btn');
        if (!btn || btn.disabled) return;
        const page = parseInt(btn.dataset.page);
        if (page && page !== currentPage) {
            currentPage = page;
            showLoading();
            renderProductList(filteredProducts);
            document.getElementById('product-grid')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// =============================================================
// LỌC & SẮP XẾP
// =============================================================
function collectFilters() {
    currentFilters.categories = [];

    document.querySelectorAll('input[data-filter="category"]:checked')
        .forEach(function (cb) {
            currentFilters.categories.push(String(cb.value));
        });

    currentFilters.minPrice = (document.getElementById('min-price')?.value || '').trim();
    currentFilters.maxPrice = (document.getElementById('max-price')?.value || '').trim();
}

function applyFilters(products) {
    let result = [...products];

    // 1. Danh mục — lọc theo categoryId
    if (currentFilters.categories.length > 0) {
        result = result.filter(function (p) {
            return currentFilters.categories.includes(String(p.categoryId));
        });
    }

    // 2. Khoảng giá
    const minPrice = parseFloat(currentFilters.minPrice);
    const maxPrice = parseFloat(currentFilters.maxPrice);
    const getPrice = function (p) { return p.discountPrice || p.price || Infinity; };

    if (!isNaN(minPrice)) result = result.filter(function (p) { return getPrice(p) >= minPrice; });
    if (!isNaN(maxPrice)) result = result.filter(function (p) { return getPrice(p) <= maxPrice; });

    // 3. Từ khóa tìm kiếm
    if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        result = result.filter(function (p) {
            return (p.name        && p.name.toLowerCase().includes(q))
                || (p.description && p.description.toLowerCase().includes(q))
                || (p.category    && p.category.toLowerCase().includes(q));
        });
    }

    return result;
}

function applySorting(products) {
    const sorted = [...products];
    const getPrice = function (p) { return p.discountPrice || p.price || 0; };

    switch (currentSort) {
        case 'name-asc':   return sorted.sort(function (a, b) { return a.name.localeCompare(b.name, 'vi'); });
        case 'name-desc':  return sorted.sort(function (a, b) { return b.name.localeCompare(a.name, 'vi'); });
        case 'price-asc':  return sorted.sort(function (a, b) { return getPrice(a) - getPrice(b); });
        case 'price-desc': return sorted.sort(function (a, b) { return getPrice(b) - getPrice(a); });
        default:           return sorted;
    }
}

function applyFiltersAndSort() {
    showLoading();

    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (e) {
        console.error('[product-list.js] Lỗi đọc products:', e);
    }

    filteredProducts = applyFilters(products);
    filteredProducts = applySorting(filteredProducts);

    updatePageTitle();
    updateBreadcrumb();
    renderProductList(filteredProducts);
    renderActiveFilters();
    syncUrlParams();
}

// =============================================================
// XÓA BỘ LỌC
// =============================================================
function clearFilters() {
    document.querySelectorAll('input[data-filter="category"]')
        .forEach(function (cb) { cb.checked = false; });
    const minEl = document.getElementById('min-price');
    const maxEl = document.getElementById('max-price');
    if (minEl) minEl.value = '';
    if (maxEl) maxEl.value = '';
    // Bỏ highlight giá nhanh
    document.querySelectorAll('.filter-price__preset')
        .forEach(function (b) { b.classList.remove('active'); });

    currentFilters = { categories: [], minPrice: '', maxPrice: '' };
    currentPage = 1;
}

function clearAllFilters() {
    clearFilters();
    currentSearchQuery = '';
    hideSearchBanner();
    currentSort = 'default';
    const sortEl = document.getElementById('sort-select');
    if (sortEl) sortEl.value = 'default';
    currentPage = 1;
}

// =============================================================
// THẺ BỘ LỌC ĐANG HOẠT ĐỘNG
// =============================================================
function renderActiveFilters() {
    const wrapper = document.getElementById('active-filters');
    const tagsEl  = document.getElementById('filter-tags');
    if (!wrapper || !tagsEl) return;

    const tags = [];

    // Danh mục — lấy tên từ localStorage
    if (currentFilters.categories.length > 0) {
        let cats = [];
        try { cats = JSON.parse(localStorage.getItem('categories')) || []; } catch (e) {}
        currentFilters.categories.forEach(function (id) {
            const cat = cats.find(function (c) { return String(c.id) === String(id); });
            tags.push({
                type:  'category',
                value: id,
                label: cat ? cat.name : id
            });
        });
    }

    // Khoảng giá
    if (currentFilters.minPrice || currentFilters.maxPrice) {
        let label = 'Giá: ';
        if (currentFilters.minPrice && currentFilters.maxPrice) {
            label += `${formatCurrency(+currentFilters.minPrice)} – ${formatCurrency(+currentFilters.maxPrice)}`;
        } else if (currentFilters.minPrice) {
            label += `từ ${formatCurrency(+currentFilters.minPrice)}`;
        } else {
            label += `đến ${formatCurrency(+currentFilters.maxPrice)}`;
        }
        tags.push({ type: 'price', value: 'price', label: label });
    }

    // Từ khóa
    if (currentSearchQuery) {
        tags.push({ type: 'search', value: currentSearchQuery, label: `"${currentSearchQuery}"` });
    }

    if (tags.length === 0) {
        wrapper.style.display = 'none';
        return;
    }

    wrapper.style.display = 'flex';
    tagsEl.innerHTML = tags.map(function (tag) {
        return `<span class="filter-tag">
                    ${tag.label}
                    <button class="filter-tag__remove"
                            onclick="removeFilter('${tag.type}','${tag.value}')"
                            aria-label="Xóa bộ lọc ${tag.label}">×</button>
                </span>`;
    }).join('');
}

// Hàm toàn cục để gọi được từ onclick trong HTML
window.removeFilter = function (type, value) {
    switch (type) {
        case 'category':
            currentFilters.categories = currentFilters.categories.filter(function (id) { return id !== value; });
            const cb = document.querySelector(`input[data-filter="category"][value="${value}"]`);
            if (cb) cb.checked = false;
            break;
        case 'price':
            currentFilters.minPrice = '';
            currentFilters.maxPrice = '';
            const minEl = document.getElementById('min-price');
            const maxEl = document.getElementById('max-price');
            if (minEl) minEl.value = '';
            if (maxEl) maxEl.value = '';
            document.querySelectorAll('.filter-price__preset')
                .forEach(function (b) { b.classList.remove('active'); });
            break;
        case 'search':
            currentSearchQuery = '';
            hideSearchBanner();
            break;
    }
    currentPage = 1;
    applyFiltersAndSort();
};

// =============================================================
// TIÊU ĐỀ & BREADCRUMB
// =============================================================
function updatePageTitle() {
    const titleEl    = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    if (!titleEl || !subtitleEl) return;

    const total = filteredProducts.length;

    if (currentSearchQuery) {
        titleEl.textContent    = 'Kết quả tìm kiếm';
        subtitleEl.textContent = `Tìm thấy ${total} sản phẩm cho "${currentSearchQuery}"`;
    } else if (currentFilters.categories.length > 0) {
        let cats = [];
        try { cats = JSON.parse(localStorage.getItem('categories')) || []; } catch (e) {}
        const names = currentFilters.categories.map(function (id) {
            const c = cats.find(function (c) { return String(c.id) === String(id); });
            return c ? c.name : id;
        }).join(', ');
        titleEl.textContent    = names;
        subtitleEl.textContent = `${total} sản phẩm`;
    } else {
        titleEl.textContent    = 'Tất cả sản phẩm';
        subtitleEl.textContent = `${total} sản phẩm`;
    }
}

function updateBreadcrumb() {
    const el = document.getElementById('breadcrumb-current');
    if (!el) return;
    el.textContent = document.getElementById('page-title')?.textContent || 'Sản phẩm';
}

// =============================================================
// LOADING
// =============================================================
function showLoading() {
    const indicator = document.getElementById('loading-indicator');
    const grid      = document.getElementById('product-grid');
    if (indicator) indicator.style.display = 'flex';
    if (grid)      grid.style.opacity      = '0.4';
}

function hideLoading() {
    const indicator = document.getElementById('loading-indicator');
    const grid      = document.getElementById('product-grid');
    if (indicator) indicator.style.display = 'none';
    if (grid)      grid.style.opacity      = '1';
}

// =============================================================
// UI HELPERS
// =============================================================
function updateResultsCount(count) {
    const el = document.getElementById('results-count');
    if (el) el.textContent = count.toLocaleString('vi-VN');
}

function showSearchBanner() {
    const banner  = document.getElementById('search-result-info');
    const keyword = document.getElementById('search-keyword');
    if (banner)  banner.style.display  = 'flex';
    if (keyword) keyword.textContent   = currentSearchQuery;
}

function hideSearchBanner() {
    const banner = document.getElementById('search-result-info');
    if (banner) banner.style.display = 'none';
}

function syncUrlParams() {
    const params = new URLSearchParams();
    if (currentSearchQuery) params.set('search', currentSearchQuery);
    if (currentFilters.categories.length > 0) params.set('categoryId', currentFilters.categories[0]);
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
}

// =============================================================
// THÊM VÀO GIỎ HÀNG (từ trang product-list)
// =============================================================
window.handleAddToCartPL = function (productId) {
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        if (confirm('Bạn cần đăng nhập để thêm vào giỏ hàng.\nChuyển đến trang đăng nhập?')) {
            window.location.href = basePath + 'login/login.html';
        }
        return;
    }

    let currentUser;
    try { currentUser = JSON.parse(currentUserJson); } catch (e) { return; }

    let products = [];
    try { products = JSON.parse(localStorage.getItem('products')) || []; } catch (e) {}

    const product = products.find(function (p) { return String(p.id) === String(productId); });
    if (!product) { alert('Không tìm thấy sản phẩm!'); return; }
    if (product.stock === 0) { alert('Sản phẩm này đã hết hàng.'); return; }

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('cart')) || []; } catch (e) {}

    const idx = cart.findIndex(function (item) {
        return String(item.productId) === String(productId) && item.userId == currentUser.id;
    });

    if (idx > -1) {
        const newQty = cart[idx].quantity + 1;
        if (newQty > product.stock) {
            alert('Đã đạt số lượng tối đa có thể đặt.');
            return;
        }
        cart[idx].quantity = newQty;
    } else {
        cart.push({
            userId:    currentUser.id,
            productId: product.id,
            name:      product.name,
            image:     product.image || '',
            price:     product.discountPrice || product.price,
            quantity:  1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Cập nhật badge giỏ hàng trên header
    const badge = document.getElementById('header-cart-count');
    if (badge) {
        const userCart = cart.filter(function (i) { return i.userId == currentUser.id; });
        const count    = userCart.reduce(function (s, i) { return s + (i.quantity || 1); }, 0);
        badge.textContent = count > 0 ? count : '';
        badge.classList.toggle('cart-badge--hidden', count === 0);
    }

    // Toast đơn giản
    showPLToast('✓ Đã thêm vào giỏ hàng!');
};

function showPLToast(msg) {
    let wrap = document.getElementById('pl-toast-wrap');
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'pl-toast-wrap';
        wrap.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
        document.body.appendChild(wrap);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    t.style.cssText = 'opacity:0;transform:translateY(10px);transition:opacity .25s,transform .25s;pointer-events:auto';
    wrap.appendChild(t);
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            t.style.opacity = '1';
            t.style.transform = 'translateY(0)';
        });
    });
    setTimeout(function () {
        t.style.opacity = '0';
        t.style.transform = 'translateY(10px)';
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, 2800);
}