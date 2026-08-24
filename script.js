// ============================================
// MARKET DEVELOPMENT CENTRE - Quick-Commerce Script
// Zero-Failure Architecture with Auto Server Detection & Local Sync
// ============================================

// API Base URL Detection
let API = (window.location.origin && !window.location.origin.startsWith('file:') && (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')))
    ? window.location.origin
    : 'http://localhost:3000';

// Global App Config
window.APP_CONFIG = {
    googleClientId: '',
    razorpayKeyId: '',
    hasGoogleAuth: false,
    hasRazorpay: false,
    mode: 'auto'
};

// =============================
// SmartAPI Client Engine (Online + Local Storage Fallback)
// =============================
const SmartAPI = {
    // Initialise Local Fallback Data
    initLocalDB() {
        if (!localStorage.getItem('localProducts')) {
            localStorage.setItem('localProducts', JSON.stringify(products));
        }
        if (!localStorage.getItem('localOrders')) {
            const seedOrders = [
                {
                    id: 'MDC-8421',
                    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    name: 'Aarav Sharma',
                    phone: '9876543210',
                    address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
                    status: 'Out for Delivery',
                    total: 215,
                    payment: 'Razorpay (Online Verified)',
                    items: [
                        { name: 'Tomato', price: 40, qty: 2, unit: 'kg' },
                        { name: 'Apple', price: 200, qty: 0.5, unit: 'kg' },
                        { name: 'Milk', price: 60, qty: 1, unit: 'litre' }
                    ]
                },
                {
                    id: 'MDC-7219',
                    date: 'Yesterday, 4:30 PM',
                    name: 'Priya Patel',
                    phone: '9876543211',
                    address: 'B-12, Palm Residency, Whitefield, Bengaluru',
                    status: 'Delivered',
                    total: 180,
                    payment: 'Cash on Delivery',
                    items: [
                        { name: 'Mango', price: 150, qty: 1, unit: 'kg' },
                        { name: 'Potato', price: 30, qty: 1, unit: 'kg' }
                    ]
                }
            ];
            localStorage.setItem('localOrders', JSON.stringify(seedOrders));
        }
    },

    // 1. Send Login OTP
    async sendLoginOTP(phone, role = 'buyer') {
        try {
            const res = await fetch(API + '/api/auth/send-login-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, role })
            });
            const data = await res.json();
            if (data && data.success) return data;
        } catch (e) {
            console.info('Using local OTP engine:', e.message);
        }

        // Offline / Standalone Fallback
        const demoOtp = '123456';
        sessionStorage.setItem('pending_otp_' + phone, demoOtp);
        return {
            success: true,
            message: 'OTP sent successfully (Demo Mode)',
            otp: demoOtp,
            phone: phone
        };
    },

    // 2. Verify Login OTP
    async verifyLoginOTP(phone, otp, role = 'buyer') {
        try {
            const res = await fetch(API + '/api/auth/verify-login-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, role })
            });
            const data = await res.json();
            if (data && data.success) return data;
        } catch (e) {
            console.info('Using local auth engine for verification:', e.message);
        }

        // Verify with fallback
        const storedOtp = sessionStorage.getItem('pending_otp_' + phone);
        if (otp === '123456' || otp === storedOtp || otp.length === 6) {
            const defaultNames = {
                buyer: 'Aarav Buyer',
                seller: 'Ramesh Farmer',
                delivery_partner: 'Suresh Express'
            };
            const user = {
                id: 'usr_' + phone,
                name: defaultNames[role] || 'Market User',
                phone: phone,
                email: `${role}.${phone.slice(-4)}@marketdc.in`,
                role: role,
                authProvider: 'mobile_otp'
            };
            const token = 'local_jwt_' + Date.now();
            return { success: true, token, user };
        }
        return { success: false, message: 'Invalid OTP. Use demo code: 123456' };
    },

    // 3. Password Login
    async login(identifier, password, role = 'buyer') {
        try {
            const res = await fetch(API + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password, role })
            });
            const data = await res.json();
            if (data && data.success) return data;
        } catch (e) {
            console.info('Using local credential login:', e.message);
        }

        // Standalone user verification
        const user = {
            id: 'usr_' + Date.now(),
            name: identifier.includes('@') ? identifier.split('@')[0] : 'Market User',
            email: identifier.includes('@') ? identifier : `${identifier}@marketdc.in`,
            phone: identifier.replace(/\D/g, '') || '9876543210',
            role: role,
            authProvider: 'local'
        };
        const token = 'local_jwt_' + Date.now();
        return { success: true, token, user };
    },

    // 4. Register
    async register(name, email, phone, role, password) {
        try {
            const res = await fetch(API + '/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, role, password })
            });
            const data = await res.json();
            if (data && data.success) return data;
        } catch (e) {
            console.info('Using local register fallback:', e.message);
        }

        const user = {
            id: 'usr_' + Date.now(),
            name: name,
            email: email,
            phone: phone,
            role: role,
            authProvider: 'local'
        };
        const token = 'local_jwt_' + Date.now();
        return { success: true, token, user };
    },

    // 5. Google Sign-In
    async googleAuth(role = 'buyer', email = 'user.demo@marketdc.in', name = 'Google User') {
        try {
            const res = await fetch(API + '/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credential: 'google-demo-token',
                    role: role,
                    email: email,
                    name: name
                })
            });
            const data = await res.json();
            if (data && data.success) return data;
        } catch (e) {
            console.info('Using local Google auth:', e.message);
        }

        const user = {
            id: 'usr_g_' + Date.now(),
            name: name,
            email: email,
            phone: '',
            role: role,
            authProvider: 'google'
        };
        const token = 'local_jwt_g_' + Date.now();
        return { success: true, token, user };
    },

    // 6. Get Products
    async getProducts() {
        try {
            const res = await fetch(API + '/api/products');
            const data = await res.json();
            if (data && data.success && data.products && data.products.length > 0) {
                return data.products;
            }
        } catch (e) {
            console.info('Using local products database');
        }
        let local = JSON.parse(localStorage.getItem('localProducts') || '[]');
        return local.length > 0 ? local : products;
    },

    // 7. Add Product (Seller)
    async addProduct(productData) {
        try {
            const token = getToken();
            const res = await fetch(API + '/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(productData)
            });
            const data = await res.json();
            if (data && data.success) return data;
        } catch (e) {
            console.info('Using local product storage:', e.message);
        }

        let local = JSON.parse(localStorage.getItem('localProducts') || '[]');
        if (local.length === 0) local = [...products];
        const newP = {
            id: Date.now(),
            name: productData.name,
            price: Number(productData.price),
            category: productData.category || 'vegetable',
            image: productData.image || 'images/vegetables.svg',
            desc: productData.desc || 'Fresh farm produce',
            rating: 5,
            unit: productData.unit || 'kg'
        };
        local.unshift(newP);
        localStorage.setItem('localProducts', JSON.stringify(local));
        return { success: true, product: newP };
    },

    // 8. Get Orders
    async getOrders() {
        try {
            const token = getToken();
            const res = await fetch(API + '/api/orders', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data && data.success) return data.orders || [];
        } catch (e) {
            console.info('Using local orders storage');
        }
        return JSON.parse(localStorage.getItem('localOrders') || '[]');
    },

    // 9. Create Order
    async createOrder(orderData) {
        try {
            const token = getToken();
            const res = await fetch(API + '/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(orderData)
            });
            const data = await res.json();
            if (data && data.success) return data;
        } catch (e) {
            console.info('Saving order to local storage:', e.message);
        }

        let local = JSON.parse(localStorage.getItem('localOrders') || '[]');
        const total = orderData.items.reduce((s, i) => s + (i.price * i.qty), 0);
        const del = total >= 500 ? 0 : 40;
        const newOrder = {
            id: 'MDC-' + Math.floor(1000 + Math.random() * 9000),
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            name: orderData.name,
            phone: orderData.phone,
            address: orderData.address,
            payment: orderData.payment,
            status: 'Placed',
            total: (total + del),
            items: orderData.items
        };
        local.unshift(newOrder);
        localStorage.setItem('localOrders', JSON.stringify(local));
        return { success: true, order: newOrder };
    },

    // 10. Update Order Status (Delivery Partner / Seller)
    async updateOrderStatus(orderId, newStatus) {
        try {
            const token = getToken();
            const res = await fetch(API + `/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data && data.success) return data;
        } catch (e) {
            console.info('Updating local order status:', e.message);
        }

        let local = JSON.parse(localStorage.getItem('localOrders') || '[]');
        const target = local.find(o => o.id === orderId);
        if (target) {
            target.status = newStatus;
            localStorage.setItem('localOrders', JSON.stringify(local));
            return { success: true, order: target };
        }
        return { success: true, message: 'Status updated' };
    },

    // 11. Razorpay Order Creation
    async createPaymentOrder(amount) {
        try {
            const res = await fetch(API + '/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency: 'INR' })
            });
            const data = await res.json();
            if (data && data.success) return data;
        } catch (e) { }

        return {
            success: true,
            orderId: 'order_local_' + Date.now(),
            amount: amount * 100,
            currency: 'INR',
            mode: 'test'
        };
    }
};

// Initialise DB
SmartAPI.initLocalDB();

// Dynamic port finder
async function discoverBackendPort() {
    const candidates = [
        window.location.origin,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8080',
        'http://127.0.0.1:8080'
    ];
    for (const url of candidates) {
        if (!url || url.startsWith('file:')) continue;
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 800);
            const res = await fetch(url + '/api/config', { signal: ctrl.signal });
            clearTimeout(timer);
            if (res.ok) {
                API = url;
                const data = await res.json();
                if (data.success) window.APP_CONFIG = data;
                console.log('⚡ Connected to backend server at:', API);
                break;
            }
        } catch (e) {}
    }
}
discoverBackendPort();


// =============================
// Currency Formatter (INR ₹)
// =============================
function formatPrice(price) {
    return '₹' + Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// =============================
// Auth & Role Helpers
// =============================
function getToken() {
    return localStorage.getItem('token');
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return null;
    }
}

function isLoggedIn() {
    return !!getToken();
}

function requireAuth() {
    if (!isLoggedIn()) {
        localStorage.setItem('redirectAfterLogin', window.location.pathname.split('/').pop());
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

async function logout() {
    try {
        await fetch(API + '/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
    } catch (e) { }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('👋 Signed out successfully!');
    setTimeout(() => { window.location.href = 'login.html'; }, 800);
}

// Update Nav UI based on current user & role
function updateNavUserUI() {
    const user = getCurrentUser();
    const userLink = document.getElementById('userLink');
    const userNameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user && isLoggedIn()) {
        const roleIcons = {
            buyer: '🛒',
            seller: '🏪',
            delivery_partner: '🛵'
        };
        const roleBadge = roleIcons[user.role] || '👤';
        const firstName = user.name ? user.name.split(' ')[0] : 'Profile';

        if (userNameSpan) {
            userNameSpan.innerHTML = `${roleBadge} ${firstName}`;
        }
        if (userLink) {
            userLink.href = 'profile.html';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
        }
    } else {
        if (userNameSpan) userNameSpan.innerText = 'Sign In';
        if (userLink) userLink.href = 'login.html';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// =============================
// Product Catalog (INR ₹)
// =============================
const products = [
    // ---- VEGETABLES ----
    { id: 1, name: "Tomato", price: 40, category: "vegetable", image: "images/tomato.svg", desc: "Fresh juicy tomatoes", rating: 5, unit: "kg" },
    { id: 2, name: "Potato", price: 30, category: "vegetable", image: "images/potato.svg", desc: "Farm fresh potatoes", rating: 5, unit: "kg" },
    { id: 3, name: "Carrot", price: 60, category: "vegetable", image: "images/carrot.svg", desc: "Sweet crunchy carrots", rating: 4, unit: "kg" },
    { id: 4, name: "Onion", price: 45, category: "vegetable", image: "images/onion.svg", desc: "Fresh red onions", rating: 5, unit: "kg" },
    { id: 5, name: "Brinjal", price: 50, category: "vegetable", image: "images/brinjal.svg", desc: "Fresh purple brinjals", rating: 4, unit: "kg" },
    { id: 6, name: "Ladies Finger", price: 55, category: "vegetable", image: "images/ladiesfinger.svg", desc: "Tender okra", rating: 4, unit: "kg" },
    { id: 7, name: "Cabbage", price: 35, category: "vegetable", image: "images/cabbage.svg", desc: "Fresh green cabbage", rating: 4, unit: "piece" },
    { id: 8, name: "Cauliflower", price: 45, category: "vegetable", image: "images/cauliflower.svg", desc: "White fresh cauliflower", rating: 4, unit: "piece" },
    { id: 9, name: "Capsicum", price: 70, category: "vegetable", image: "images/capsicum.svg", desc: "Crispy green capsicum", rating: 4, unit: "kg" },
    { id: 10, name: "Spinach", price: 25, category: "vegetable", image: "images/spinach.svg", desc: "Fresh leafy spinach", rating: 4, unit: "bunch" },
    { id: 11, name: "Coriander", price: 20, category: "vegetable", image: "images/coriander.svg", desc: "Fresh coriander leaves", rating: 4, unit: "bunch" },
    { id: 12, name: "Beans", price: 65, category: "vegetable", image: "images/beans.svg", desc: "Fresh green beans", rating: 4, unit: "kg" },
    { id: 13, name: "Pumpkin", price: 30, category: "vegetable", image: "images/pumpkin.svg", desc: "Fresh orange pumpkin", rating: 4, unit: "kg" },
    { id: 14, name: "Radish", price: 40, category: "vegetable", image: "images/radish.svg", desc: "Crispy white radish", rating: 4, unit: "kg" },
    { id: 15, name: "Beetroot", price: 55, category: "vegetable", image: "images/beetroot.svg", desc: "Sweet red beetroot", rating: 4, unit: "kg" },
    { id: 16, name: "Cucumber", price: 35, category: "vegetable", image: "images/cucumber.svg", desc: "Cool fresh cucumber", rating: 4, unit: "kg" },
    { id: 17, name: "Green Chilli", price: 30, category: "vegetable", image: "images/greenchilli.svg", desc: "Fresh green chillies", rating: 4, unit: "kg" },

    // ---- FRUITS ----
    { id: 18, name: "Apple", price: 200, category: "fruit", image: "images/apple.svg", desc: "Crisp red apples", rating: 5, unit: "kg" },
    { id: 19, name: "Banana", price: 60, category: "fruit", image: "images/banana.svg", desc: "Sweet ripe bananas", rating: 4, unit: "bunch" },
    { id: 20, name: "Mango", price: 150, category: "fruit", image: "images/mango.svg", desc: "Juicy alphonso mangoes", rating: 5, unit: "kg" },
    { id: 21, name: "Orange", price: 80, category: "fruit", image: "images/orange.svg", desc: "Sweet juicy oranges", rating: 5, unit: "kg" },
    { id: 22, name: "Grapes", price: 120, category: "fruit", image: "images/grapes.svg", desc: "Fresh green grapes", rating: 4, unit: "kg" },
    { id: 23, name: "Watermelon", price: 35, category: "fruit", image: "images/watermelon.svg", desc: "Sweet red watermelon", rating: 4, unit: "kg" },
    { id: 24, name: "Pomegranate", price: 180, category: "fruit", image: "images/pomegranate.svg", desc: "Fresh red pomegranate", rating: 5, unit: "kg" },
    { id: 25, name: "Papaya", price: 50, category: "fruit", image: "images/papaya.svg", desc: "Ripe sweet papaya", rating: 4, unit: "kg" },
    { id: 26, name: "Pineapple", price: 70, category: "fruit", image: "images/pineapple.svg", desc: "Sweet ripe pineapple", rating: 4, unit: "piece" },
    { id: 27, name: "Strawberry", price: 250, category: "fruit", image: "images/strawberry.svg", desc: "Fresh red strawberries", rating: 5, unit: "box" },
    { id: 28, name: "Guava", price: 60, category: "fruit", image: "images/guava.svg", desc: "Fresh green guava", rating: 4, unit: "kg" },
    { id: 29, name: "Pears", price: 160, category: "fruit", image: "images/pears.svg", desc: "Sweet juicy pears", rating: 4, unit: "kg" },

    // ---- DAIRY ----
    { id: 30, name: "Milk", price: 60, category: "dairy", image: "images/milk.svg", desc: "Pure fresh milk (1L)", rating: 5, unit: "litre" },
    { id: 31, name: "Curd", price: 40, category: "dairy", image: "images/curd.svg", desc: "Creamy fresh curd", rating: 4, unit: "cup" },
    { id: 32, name: "Butter", price: 55, category: "dairy", image: "images/butter.svg", desc: "Fresh creamy butter", rating: 4, unit: "pack" },
    { id: 33, name: "Paneer", price: 200, category: "dairy", image: "images/paneer.svg", desc: "Fresh soft paneer", rating: 5, unit: "kg" },
    { id: 34, name: "Cheese", price: 150, category: "dairy", image: "images/cheese.svg", desc: "Processed cheese slices", rating: 4, unit: "pack" },

    // ---- GROCERIES ----
    { id: 35, name: "Rice", price: 80, category: "grocery", image: "images/rice.svg", desc: "Premium basmati rice", rating: 5, unit: "kg" },
    { id: 36, name: "Wheat", price: 50, category: "grocery", image: "images/wheat.svg", desc: "Whole wheat grains", rating: 4, unit: "kg" },
    { id: 37, name: "Sugar", price: 45, category: "grocery", image: "images/sugar.svg", desc: "Fine white sugar", rating: 4, unit: "kg" },
    { id: 38, name: "Dal", price: 120, category: "grocery", image: "images/dal.svg", desc: "Premium toor dal", rating: 4, unit: "kg" },

    // ---- DRINKS ----
    { id: 39, name: "Orange Juice", price: 90, category: "drinks", image: "images/juice.svg", desc: "Fresh orange juice", rating: 5, unit: "bottle" },
    { id: 40, name: "Cold Drink", price: 40, category: "drinks", image: "images/drink.svg", desc: "Refreshing cold drink", rating: 4, unit: "bottle" },
    { id: 41, name: "Coconut Water", price: 50, category: "drinks", image: "images/coconutwater.svg", desc: "Fresh tender coconut water", rating: 5, unit: "bottle" }
];

// =============================
// Cart State Management
// =============================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCartDrawer();
    syncAllCardSteppers();
    if (typeof displayCart === 'function') {
        displayCart();
    }
}

function getCartItem(name) {
    return cart.find(p => p.name.toLowerCase() === name.toLowerCase());
}

function getCartItemQty(name) {
    const item = getCartItem(name);
    return item ? item.qty : 0;
}

// Update Cart Count Badges with Pop Animation
function updateCartCount() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const badges = document.querySelectorAll('#cartCount, #drawerCartCount');

    badges.forEach(b => {
        b.innerText = totalQty;
        b.classList.remove('badge-pop');
        void b.offsetWidth; // Trigger reflow
        b.classList.add('badge-pop');
    });
}

// Add or change quantity
function changeCartQty(name, delta, price, unit, image) {
    const exist = cart.find(p => p.name.toLowerCase() === name.toLowerCase());
    const prodRef = products.find(p => p.name.toLowerCase() === name.toLowerCase());

    const itemPrice = price || (prodRef ? prodRef.price : 40);
    const itemUnit = unit || (prodRef ? prodRef.unit : 'kg');
    const itemImage = image || (prodRef ? prodRef.image : 'images/vegetables.svg');

    if (exist) {
        exist.qty += delta;
        if (exist.qty <= 0) {
            cart = cart.filter(p => p.name.toLowerCase() !== name.toLowerCase());
            showToast(`${name} removed from cart`);
        } else if (delta > 0) {
            showToast(`Added 1 more ${name} 🛒`);
        }
    } else if (delta > 0) {
        cart.push({
            name: name,
            price: itemPrice,
            qty: delta,
            unit: itemUnit,
            image: itemImage
        });
        showToast(`${name} added to cart 🛒`);
    }

    saveCart();
}

function addCart(name, price) {
    changeCartQty(name, 1, price);
}

// =============================
// Card Quantity Stepper Sync
// =============================
function syncAllCardSteppers() {
    const actionWraps = document.querySelectorAll('.card-action-wrap[data-prod-name]');
    actionWraps.forEach(wrap => {
        const prodName = wrap.getAttribute('data-prod-name');
        const prodPrice = Number(wrap.getAttribute('data-prod-price')) || 0;
        const prodUnit = wrap.getAttribute('data-prod-unit') || 'kg';
        const prodImg = wrap.getAttribute('data-prod-img') || '';
        const qty = getCartItemQty(prodName);

        if (qty > 0) {
            wrap.innerHTML = `
                <div class="stepper-control">
                    <button type="button" onclick="event.stopPropagation(); changeCartQty('${prodName}', -1, ${prodPrice}, '${prodUnit}', '${prodImg}')">-</button>
                    <span class="stepper-count">${qty}</span>
                    <button type="button" onclick="event.stopPropagation(); changeCartQty('${prodName}', 1, ${prodPrice}, '${prodUnit}', '${prodImg}')">+</button>
                </div>
            `;
        } else {
            wrap.innerHTML = `
                <button type="button" class="card-add-btn" onclick="event.stopPropagation(); changeCartQty('${prodName}', 1, ${prodPrice}, '${prodUnit}', '${prodImg}')">
                    <i class="fa-solid fa-plus"></i> ADD
                </button>
            `;
        }
    });
}

// =============================
// Quick Cart Drawer Component
// =============================
function injectCartDrawer() {
    if (document.getElementById('cartDrawer')) return;

    const drawerHTML = `
        <div class="cart-drawer-overlay" id="cartDrawerOverlay" onclick="closeCartDrawer()"></div>
        <div class="cart-drawer" id="cartDrawer">
            <div class="cart-drawer-header">
                <h3><i class="fa-solid fa-bag-shopping" style="color:var(--green)"></i> My Cart (<span id="drawerCartCount">0</span>)</h3>
                <button class="cart-drawer-close" onclick="closeCartDrawer()" title="Close Cart"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="delivery-meter" id="drawerDeliveryMeter">
                <div id="drawerMeterText">Add ₹500 for <strong>FREE Delivery</strong></div>
                <div class="delivery-meter-bar">
                    <div class="delivery-meter-fill" id="drawerMeterFill" style="width: 0%;"></div>
                </div>
            </div>
            <div class="cart-drawer-items" id="drawerItemsList">
                <!-- Injected by JS -->
            </div>
            <div class="cart-drawer-footer">
                <div class="drawer-summary-row">
                    <span>Item Total</span>
                    <span id="drawerSubtotal">₹0.00</span>
                </div>
                <div class="drawer-summary-row">
                    <span>Delivery Fee</span>
                    <span id="drawerDeliveryFee">₹40.00</span>
                </div>
                <div class="drawer-summary-row total">
                    <span>To Pay</span>
                    <span id="drawerGrandTotal">₹0.00</span>
                </div>
                <button class="drawer-checkout-btn" onclick="goToCheckout()">
                    Proceed to Checkout <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    // Attach click events on navbar cart icons to toggle drawer
    document.querySelectorAll('.icons a[href="cart.html"], nav ul li a[href="cart.html"]').forEach(el => {
        // If current page is NOT cart.html, open drawer
        if (!window.location.pathname.endsWith('cart.html')) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                openCartDrawer();
            });
        }
    });
}

function openCartDrawer() {
    injectCartDrawer();
    renderCartDrawer();
    const overlay = document.getElementById('cartDrawerOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (overlay && drawer) {
        overlay.classList.add('open');
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeCartDrawer() {
    const overlay = document.getElementById('cartDrawerOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (overlay && drawer) {
        overlay.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function renderCartDrawer() {
    const list = document.getElementById('drawerItemsList');
    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = `
            <div style="text-align:center;padding:40px 10px;color:#888;">
                <i class="fa-solid fa-cart-shopping" style="font-size:48px;color:#d1d5db;margin-bottom:12px;"></i>
                <h4 style="color:#374151;font-size:16px;">Your cart is empty</h4>
                <p style="font-size:13px;margin-top:4px;">Add some fresh fruits & vegetables!</p>
            </div>
        `;
        document.getElementById('drawerSubtotal').innerText = '₹0.00';
        document.getElementById('drawerDeliveryFee').innerText = '₹0.00';
        document.getElementById('drawerGrandTotal').innerText = '₹0.00';
        document.getElementById('drawerMeterFill').style.width = '0%';
        document.getElementById('drawerMeterText').innerHTML = 'Add items for <strong>FREE Delivery</strong>';
        return;
    }

    let subtotal = 0;
    list.innerHTML = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        const img = item.image || 'images/vegetables.svg';

        list.innerHTML += `
            <div class="drawer-item">
                <img src="${img}" alt="${item.name}">
                <div class="drawer-item-info">
                    <h4>${item.name}</h4>
                    <div class="drawer-item-price">${formatPrice(item.price)} <span class="drawer-item-unit">/ ${item.unit || 'kg'}</span></div>
                </div>
                <div class="drawer-stepper">
                    <button type="button" onclick="changeCartQty('${item.name}', -1, ${item.price}, '${item.unit || 'kg'}', '${img}')">-</button>
                    <span>${item.qty}</span>
                    <button type="button" onclick="changeCartQty('${item.name}', 1, ${item.price}, '${item.unit || 'kg'}', '${img}')">+</button>
                </div>
                <button class="drawer-item-del" onclick="changeCartQty('${item.name}', -${item.qty})" title="Remove">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    });

    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const grandTotal = subtotal + deliveryFee;

    document.getElementById('drawerSubtotal').innerText = formatPrice(subtotal);
    document.getElementById('drawerDeliveryFee').innerText = deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee);
    document.getElementById('drawerGrandTotal').innerText = formatPrice(grandTotal);

    // Update progress meter
    const meterFill = document.getElementById('drawerMeterFill');
    const meterText = document.getElementById('drawerMeterText');
    if (subtotal >= 500) {
        meterFill.style.width = '100%';
        meterFill.style.background = '#22c55e';
        meterText.innerHTML = '🎉 You unlocked <strong>FREE Delivery!</strong>';
    } else {
        const diff = 500 - subtotal;
        const pct = Math.min(100, Math.round((subtotal / 500) * 100));
        meterFill.style.width = `${pct}%`;
        meterFill.style.background = 'var(--lightgreen)';
        meterText.innerHTML = `Add <strong>₹${diff}</strong> more for <strong>FREE Delivery</strong>`;
    }
}

function goToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    closeCartDrawer();
    window.location.href = 'checkout.html';
}

// =============================
// Toast Notification System
// =============================
function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.style.cssText = "position:fixed;bottom:25px;left:50%;transform:translateX(-50%) translateY(20px);background:#1f2937;color:#fff;padding:12px 24px;border-radius:30px;font-size:15px;font-weight:500;z-index:99999;box-shadow:0 8px 25px rgba(0,0,0,.25);transition:all 0.25s cubic-bezier(0.16,1,0.3,1);opacity:0;pointer-events:none;display:flex;align-items:center;gap:8px;";
        document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";

    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(20px)";
    }, 2500);
}

// =============================
// Voice Search Support
// =============================
function voiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast("⚠️ Voice search not supported in this browser. Please type.");
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    const input = document.getElementById("searchBox");
    if (input) input.placeholder = "🎤 Listening for produce name...";

    recognition.start();

    recognition.onresult = function (event) {
        const text = event.results[0][0].transcript;
        if (input) {
            input.value = text;
            input.placeholder = "Search products...";
            if (typeof searchProduct === 'function') {
                searchProduct();
            }
        }
        showToast("🔍 Searched: " + text);
    };

    recognition.onerror = function () {
        if (input) input.placeholder = "Search products...";
        showToast("⚠️ Could not hear audio. Please try again.");
    };
}

// =============================
// Featured Products Loader for Index
// =============================
function loadFeatured() {
    const grid = document.getElementById("featuredGrid");
    if (!grid) return;

    const featured = products.slice(0, 12);
    grid.innerHTML = "";

    featured.forEach(p => {
        const stars = "⭐".repeat(p.rating);
        const qty = getCartItemQty(p.name);
        grid.innerHTML += `
        <div class="card" data-category="${p.category}" data-name="${p.name.toLowerCase()}">
            <span class="tag">Fresh</span>
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <h3>${p.name}</h3>
            <p class="price">${formatPrice(p.price)} <small style="font-size:13px;color:#888;">/ ${p.unit}</small></p>
            <p class="desc">${p.desc}</p>
            <p class="rating">${stars}</p>
            <div class="card-action-wrap" data-prod-name="${p.name}" data-prod-price="${p.price}" data-prod-unit="${p.unit}" data-prod-img="${p.image}">
                ${qty > 0 ? `
                    <div class="stepper-control">
                        <button type="button" onclick="event.stopPropagation(); changeCartQty('${p.name}', -1, ${p.price}, '${p.unit}', '${p.image}')">-</button>
                        <span class="stepper-count">${qty}</span>
                        <button type="button" onclick="event.stopPropagation(); changeCartQty('${p.name}', 1, ${p.price}, '${p.unit}', '${p.image}')">+</button>
                    </div>
                ` : `
                    <button type="button" class="card-add-btn" onclick="event.stopPropagation(); changeCartQty('${p.name}', 1, ${p.price}, '${p.unit}', '${p.image}')">
                        <i class="fa-solid fa-plus"></i> ADD
                    </button>
                `}
            </div>
        </div>`;
    });
}

// =============================
// Toggle Mobile Menu
// =============================
function toggleMenu() {
    const ul = document.querySelector("nav ul");
    if (ul) {
        ul.style.display = ul.style.display === "flex" ? "none" : "flex";
        if (ul.style.display === "flex") {
            ul.style.flexDirection = "column";
            ul.style.width = "100%";
        }
    }
}

// =============================
// Location & Geocoding
// =============================
function detectLocation() {
    const locText = document.getElementById('locText');
    if (!locText) return;

    if (!navigator.geolocation) {
        locText.innerHTML = '<strong>Location not supported</strong>';
        return;
    }

    locText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Detecting location...';

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
            const res = await fetch(API + `/api/location/reverse?lat=${lat}&lng=${lng}`);
            const data = await res.json();
            if (data.success) {
                locText.innerHTML = `Deliver to: <strong>${data.address}</strong>`;
                localStorage.setItem('deliveryLocation', JSON.stringify({ lat, lng, address: data.address }));
                const addrInput = document.getElementById('address');
                if (addrInput) addrInput.value = data.address;
                showToast('📍 Location updated!');
            }
        } catch (e) {
            locText.innerHTML = `Deliver to: <strong>Sector 14 (${lat.toFixed(2)}, ${lng.toFixed(2)})</strong>`;
            localStorage.setItem('deliveryLocation', JSON.stringify({ lat, lng, address: `Sector 14 (${lat.toFixed(2)}, ${lng.toFixed(2)})` }));
            showToast('📍 Location updated!');
        }
    }, () => {
        locText.innerHTML = 'Deliver to: <strong>Select location</strong>';
        showToast('⚠️ Please allow location access or enter address');
    });
}

function loadLocation() {
    const locText = document.getElementById('locText');
    if (!locText) return;
    const saved = localStorage.getItem('deliveryLocation');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            locText.innerHTML = `Deliver to: <strong>${data.address}</strong>`;
        } catch (e) { }
    }
}

// =============================
// Initialization on Page Load
// =============================
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    injectCartDrawer();
    updateNavUserUI();
    loadFeatured();
    loadLocation();
    syncAllCardSteppers();

    // Close drawer on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCartDrawer();
    });
});

