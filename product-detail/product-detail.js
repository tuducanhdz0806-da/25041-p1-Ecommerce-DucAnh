// product-detail/product-detail.js

let currentProduct = null;
let selectedQuanlity = 1;

document.addEventListener('DOMContentLoaded', function () {
    loadData();
    loadHeader();
    loadFooter();

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        showNotFound();
        return;
    }

    loadProductDetail();
});

function loadProductDetail (productId) {
    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (e) {
        console.error('[product-detail.js] loi doc prodcuts:', e);
    }

    currentProduct = products.find(function (p) {return p.id = productId; })

    if (!currentProduct) {
        showNotFound();
        return;
    }

    const breadcrumb = document.getElementById('breadcrumb-product-name');
    if (breadcrumb) breadcrumb.textContent = currentProduct.name;
    document.title = currentProduct.name + ' - TechWorld PC';
    
    renderProductDetail();
}

function renderProductDetail () {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const images = (currentProduct.images && currentProduct.images.length > 0)
        ?currentProduct.images
        :(currentProduct.images ? [currentProduct.images] : []);

    const mainImgSrc = images.length > 0
        ?basepath + images[0]
        :basepath + 'images/placeholder-product.jpg'

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
}