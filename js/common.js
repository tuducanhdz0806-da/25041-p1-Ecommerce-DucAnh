// js/common.js


const basePath = '../';

// Tên thương hiệu dùng xuyên suốt
const BRAND_NAME = 'TechWorld PC';



/**
 * Định dạng số thành chuỗi tiền tệ VND.
 * @param {number} amount
 * @returns {string}  VD: "15.200.000 ₫"
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}


/**
 * Trả về chuỗi HTML các liên kết điều hướng dành cho khách vãng lai.
 * @returns {string}
 */
function getGuestNavLinks() {
    return `
        <a href="${basePath}home" class="nav-link">Trang chủ</a>
        <a href="${basePath}product-list" class="nav-link">Sản phẩm</a>
        <a href="${basePath}contact" class="nav-link">Liên hệ</a>
        <a href="${basePath}login" class="nav-link">Đăng nhập</a>
        <a href="${basePath}sign-up" class="nav-link nav-link--register">Đăng ký</a>
    `;
}



/**
 * Render toàn bộ nội dung header vào phần tử có id="main-header".
 */
function loadHeader() {
    const header = document.getElementById('main-header');
    if (!header) {
        console.error("[common.js] Không tìm thấy phần tử với id='main-header'");
        return;
    }

    const currentUserJson = localStorage.getItem('currentUser');
    let navLinks = '';

    if (currentUserJson) {
        try {
            const currentUser = JSON.parse(currentUserJson);
            if (!currentUser || !currentUser.fullname) {
                throw new Error('Dữ liệu người dùng không hợp lệ');
            }

            // Tính tổng số lượng sản phẩm trong giỏ hàng của user
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const userCart = cart.filter(item => item.userId == currentUser.id);
            const cartCount = userCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            const cartBadge = cartCount > 0
                ? `<span class="cart-badge" id="header-cart-count">${cartCount}</span>`
                : `<span class="cart-badge cart-badge--hidden" id="header-cart-count"></span>`;

            navLinks = `
                <a href="${basePath}home" class="nav-link">Trang chủ</a>
                <a href="${basePath}product-list" class="nav-link">Sản phẩm</a>
                <a href="${basePath}contact" class="nav-link">Liên hệ</a>
                <a href="${basePath}my-account" class="nav-link nav-link--account">
                    👤 ${currentUser.fullname}
                </a>
                <a href="${basePath}cart" class="nav-link nav-link--cart">
                    🛒 Giỏ hàng ${cartBadge}
                </a>
            `;

        } catch (e) {
            console.error('[common.js] Lỗi phân tích dữ liệu người dùng:', e);
            localStorage.removeItem('currentUser');
            navLinks = getGuestNavLinks();
        }
    } else {
        navLinks = getGuestNavLinks();
    }

    // Render HTML header
    header.innerHTML = `
        <div class="header-inner container">
            <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Mở menu">&#9776;</button>

            <a href="${basePath}home" class="header-logo">
                <span class="logo-icon">&#128187;</span>
                <span class="logo-text">${BRAND_NAME}</span>
            </a>

            <div class="header-search">
                <input
                    type="text"
                    id="search-input"
                    placeholder="Tìm kiếm CPU, VGA, RAM, SSD..."
                    autocomplete="off"
                >
                <button id="search-btn" type="button" aria-label="Tìm kiếm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                </button>
            </div>

            <nav class="nav-menu" id="nav-menu" role="navigation" aria-label="Menu chính">
                ${navLinks}
            </nav>
        </div>
    `;

    // --- Sự kiện: Hamburger menu (mobile) ---
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const navMenu   = document.getElementById('nav-menu');

    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener('click', function () {
            const isOpen = navMenu.classList.toggle('nav-menu--open');
            this.innerHTML = isOpen ? '&#10005;' : '&#9776;';
            this.setAttribute('aria-expanded', isOpen);
        });

        // Đóng menu khi click ra ngoài
        document.addEventListener('click', function (e) {
            if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
                navMenu.classList.remove('nav-menu--open');
                toggleBtn.innerHTML = '&#9776;';
                toggleBtn.setAttribute('aria-expanded', false);
            }
        });
    }

    // --- Sự kiện: Tìm kiếm ---
    const searchBtn   = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    function doSearch() {
        const query = searchInput ? searchInput.value.trim() : '';
        if (!query) return;

        // Xác định prefix đường dẫn tương đối dựa trên vị trí trang hiện tại
        window.location.href = `${basePath}product-list/index.html?search=${encodeURIComponent(query)}`;
    }

    if (searchBtn)   searchBtn.addEventListener('click', doSearch);
    if (searchInput) searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doSearch();
    });
}



/**
 * Render toàn bộ nội dung footer vào phần tử có id="main-footer".
 */
function loadFooter() {
    const footer = document.getElementById('main-footer');
    if (!footer) {
        console.error("[common.js] Không tìm thấy phần tử với id='main-footer'");
        return;
    }

    footer.innerHTML = `
        <div class="footer-inner container">
            <div class="footer-grid">

                <!-- Thương hiệu -->
                <div class="footer-col footer-col--brand">
                    <div class="footer-logo">
                        <span class="logo-icon">&#128187;</span>
                        <span class="logo-text">${BRAND_NAME}</span>
                    </div>
                    <p>Chuyên cung cấp máy tính và linh kiện PC chính hãng, giá cạnh tranh.
                       Tư vấn miễn phí, bảo hành uy tín toàn quốc.</p>
                </div>

                <!-- Liên kết nhanh -->
                <div class="footer-col">
                    <h4 class="footer-heading">Danh mục</h4>
                    <ul class="footer-links">
                        <li><a href="${basePath}product-list?category=PC+Gaming">PC Gaming</a></li>
                        <li><a href="${basePath}product-list?category=PC+V%C4%83n+Ph%C3%B2ng">PC Văn Phòng</a></li>
                        <li><a href="${basePath}product-list?category=CPU">CPU</a></li>
                        <li><a href="${basePath}product-list?category=VGA">VGA (Card đồ họa)</a></li>
                        <li><a href="${basePath}product-list">Tự Build PC</a></li>
                    </ul>
                </div>

                <!-- Hỗ trợ -->
                <div class="footer-col">
                    <h4 class="footer-heading">Hỗ trợ</h4>
                    <ul class="footer-links">
                        <li><a href="#">Hướng dẫn mua hàng</a></li>
                        <li><a href="#">Chính sách bảo hành</a></li>
                        <li><a href="#">Chính sách đổi trả</a></li>
                        <li><a href="#">Chính sách bảo mật</a></li>
                        <li><a href="#">Điều khoản sử dụng</a></li>
                    </ul>
                </div>

                <!-- Liên hệ -->
                <div class="footer-col">
                    <h4 class="footer-heading">Liên hệ</h4>
                    <ul class="footer-contact">
                        <li>&#128222; Hotline: <strong>1800 6789</strong> (miễn phí)</li>
                        <li>&#128231; Email: support@techworldpc.vn</li>
                        <li>&#128205; Phương Quế, Xã Liên Phương, Huyện Thường Tín, Hà Nội</li>
                        <li>&#128336; Giờ làm việc: 8:00 – 21:00 (Thứ 2 – Chủ nhật)</li>
                    </ul>
                </div>

            </div>

            <div class="footer-bottom">
                <p>&copy; 2025 ${BRAND_NAME}. All rights reserved.</p>
                <p>Thiết kế &amp; phát triển bởi đội ngũ TechWorld.</p>
            </div>
        </div>
    `;
}



/**
 * Kiểm tra từng key trong localStorage.
 * Nếu chưa có → sao chép dữ liệu gốc từ window.MOCK_... vào.
 * Nếu đã có    → bỏ qua, giữ nguyên trạng thái hiện tại.
 *
 * Gọi hàm này TRƯỚC tất cả các hàm render khác.
 */
function loadData() {
    const dataMap = {
        products:   window.MOCK_PRODUCTS,
        categories: window.MOCK_CATEGORIES,
        users:      window.MOCK_USERS,
        orders:     window.MOCK_ORDERS
    };

    Object.entries(dataMap).forEach(([key, mockData]) => {
        if (!localStorage.getItem(key)) {
            if (mockData) {
                localStorage.setItem(key, JSON.stringify(mockData));
            } else {
                console.warn(`[common.js] Không tìm thấy window.MOCK_${key.toUpperCase()}. Kiểm tra lại mock-data.js.`);
            }
        }
    });

    // Khởi tạo giỏ hàng rỗng nếu chưa tồn tại
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}