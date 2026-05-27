const basePath = '/';

function loadData() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(mockUsers));
    }
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify(mockCategories));
    }
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(mockProducts));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify(mockOrders));
    }
}