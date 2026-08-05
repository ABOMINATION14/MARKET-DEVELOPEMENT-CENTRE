// ============================================
// MARKET DEVELOPMENT CENTRE - Backend Server
// Real Node.js backend using only built-in modules
// No external dependencies required
// Run with: node server.js
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// ============================================
// DATA STORAGE (JSON files in data/ folder)
// ============================================
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const OTP_FILE = path.join(DATA_DIR, 'otp.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ============================================
// Product Database (40+ fruits & vegetables)
// Prices in INR (₹)
// ============================================
const PRODUCTS = [
    // ---- VEGETABLES ----
    { id: 1, name: "Tomato", price: 40, category: "vegetable", image: "images/tomato.svg", desc: "Fresh juicy tomatoes", rating: 5, unit: "kg" },
    { id: 2, name: "Potato", price: 30, category: "vegetable", image: "images/potato.svg", desc: "Farm fresh potatoes", rating: 5, unit: "kg" },
    { id: 3, name: "Carrot", price: 60, category: "vegetable", image: "images/carrot.svg", desc: "Sweet crunchy carrots", rating: 4, unit: "kg" },
    { id: 4, name: "Onion", price: 45, category: "vegetable", image: "images/onion.svg", desc: "Fresh red onions", rating: 5, unit: "kg" },
    { id: 5, name: "Brinjal", price: 50, category: "vegetable", image: "images/vegetables.svg", desc: "Fresh purple brinjals", rating: 4, unit: "kg" },
    { id: 6, name: "Ladies Finger", price: 55, category: "vegetable", image: "images/vegetables.svg", desc: "Tender okra / ladies finger", rating: 4, unit: "kg" },
    { id: 7, name: "Cabbage", price: 35, category: "vegetable", image: "images/vegetables.svg", desc: "Fresh green cabbage", rating: 4, unit: "piece" },
    { id: 8, name: "Cauliflower", price: 45, category: "vegetable", image: "images/vegetables.svg", desc: "White fresh cauliflower", rating: 4, unit: "piece" },
    { id: 9, name: "Capsicum", price: 70, category: "vegetable", image: "images/vegetables.svg", desc: "Crispy green capsicum", rating: 4, unit: "kg" },
    { id: 10, name: "Spinach", price: 25, category: "vegetable", image: "images/vegetables.svg", desc: "Fresh leafy spinach", rating: 4, unit: "bunch" },
    { id: 11, name: "Coriander", price: 20, category: "vegetable", image: "images/vegetables.svg", desc: "Fresh coriander leaves", rating: 4, unit: "bunch" },
    { id: 12, name: "Beans", price: 65, category: "vegetable", image: "images/vegetables.svg", desc: "Fresh green beans", rating: 4, unit: "kg" },
    { id: 13, name: "Pumpkin", price: 30, category: "vegetable", image: "images/vegetables.svg", desc: "Fresh orange pumpkin", rating: 4, unit: "kg" },
    { id: 14, name: "Radish", price: 40, category: "vegetable", image: "images/vegetables.svg", desc: "Crispy white radish", rating: 4, unit: "kg" },
    { id: 15, name: "Beetroot", price: 55, category: "vegetable", image: "images/vegetables.svg", desc: "Sweet red beetroot", rating: 4, unit: "kg" },
    { id: 16, name: "Cucumber", price: 35, category: "vegetable", image: "images/vegetables.svg", desc: "Cool fresh cucumber", rating: 4, unit: "kg" },
    { id: 17, name: "Green Chilli", price: 30, category: "vegetable", image: "images/vegetables.svg", desc: "Fresh green chillies", rating: 4, unit: "kg" },

    // ---- FRUITS ----
    { id: 18, name: "Apple", price: 200, category: "fruit", image: "images/apple.svg", desc: "Crisp red apples", rating: 5, unit: "kg" },
    { id: 19, name: "Banana", price: 60, category: "fruit", image: "images/banana.svg", desc: "Sweet ripe bananas", rating: 4, unit: "bunch" },
    { id: 20, name: "Mango", price: 150, category: "fruit", image: "images/fruits.svg", desc: "Juicy alphonso mangoes", rating: 5, unit: "kg" },
    { id: 21, name: "Orange", price: 80, category: "fruit", image: "images/fruits.svg", desc: "Sweet juicy oranges", rating: 5, unit: "kg" },
    { id: 22, name: "Grapes", price: 120, category: "fruit", image: "images/fruits.svg", desc: "Fresh green grapes", rating: 4, unit: "kg" },
    { id: 23, name: "Watermelon", price: 35, category: "fruit", image: "images/fruits.svg", desc: "Sweet red watermelon", rating: 4, unit: "kg" },
    { id: 24, name: "Pomegranate", price: 180, category: "fruit", image: "images/fruits.svg", desc: "Fresh red pomegranate", rating: 5, unit: "kg" },
    { id: 25, name: "Papaya", price: 50, category: "fruit", image: "images/fruits.svg", desc: "Ripe sweet papaya", rating: 4, unit: "kg" },
    { id: 26, name: "Pineapple", price: 70, category: "fruit", image: "images/fruits.svg", desc: "Sweet ripe pineapple", rating: 4, unit: "piece" },
    { id: 27, name: "Strawberry", price: 250, category: "fruit", image: "images/fruits.svg", desc: "Fresh red strawberries", rating: 5, unit: "box" },
    { id: 28, name: "Guava", price: 60, category: "fruit", image: "images/fruits.svg", desc: "Fresh green guava", rating: 4, unit: "kg" },
    { id: 29, name: "Pears", price: 160, category: "fruit", image: "images/fruits.svg", desc: "Sweet juicy pears", rating: 4, unit: "kg" },

    // ---- DAIRY ----
    { id: 30, name: "Milk", price: 60, category: "dairy", image: "images/milk.svg", desc: "Pure fresh milk (1L)", rating: 5, unit: "litre" },
    { id: 31, name: "Curd", price: 40, category: "dairy", image: "images/curd.svg", desc: "Creamy fresh curd", rating: 4, unit: "cup" },
    { id: 32, name: "Butter", price: 55, category: "dairy", image: "images/dairy.svg", desc: "Fresh creamy butter", rating: 4, unit: "pack" },
    { id: 33, name: "Paneer", price: 200, category: "dairy", image: "images/dairy.svg", desc: "Fresh soft paneer", rating: 5, unit: "kg" },
    { id: 34, name: "Cheese", price: 150, category: "dairy", image: "images/dairy.svg", desc: "Processed cheese slices", rating: 4, unit: "pack" },

    // ---- GROCERIES ----
    { id: 35, name: "Rice", price: 80, category: "grocery", image: "images/rice.svg", desc: "Premium basmati rice", rating: 5, unit: "kg" },
    { id: 36, name: "Wheat", price: 50, category: "grocery", image: "images/wheat.svg", desc: "Whole wheat grains", rating: 4, unit: "kg" },
    { id: 37, name: "Sugar", price: 45, category: "grocery", image: "images/snacks.svg", desc: "Fine white sugar", rating: 4, unit: "kg" },
    { id: 38, name: "Dal", price: 120, category: "grocery", image: "images/snacks.svg", desc: "Premium toor dal", rating: 4, unit: "kg" },

    // ---- DRINKS ----
    { id: 39, name: "Orange Juice", price: 90, category: "drinks", image: "images/juice.svg", desc: "Fresh orange juice", rating: 5, unit: "bottle" },
    { id: 40, name: "Cold Drink", price: 40, category: "drinks", image: "images/drink.svg", desc: "Refreshing cold drink", rating: 4, unit: "bottle" },
    { id: 41, name: "Coconut Water", price: 50, category: "drinks", image: "images/drink.svg", desc: "Fresh tender coconut water", rating: 5, unit: "bottle" }
];

// ============================================
// Helper Functions
// ============================================

// Read JSON file safely
function readJSON(file, fallback) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading ' + file + ': ' + e.message);
    }
    return fallback;
}

// Write JSON file safely
function writeJSON(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error('Error writing ' + file + ': ' + e.message);
        return false;
    }
}

// Initialize storage
function initDB() {
    if (!fs.existsSync(USERS_FILE)) writeJSON(USERS_FILE, []);
    if (!fs.existsSync(ORDERS_FILE)) writeJSON(ORDERS_FILE, []);
    if (!fs.existsSync(PRODUCTS_FILE)) writeJSON(PRODUCTS_FILE, PRODUCTS);
    if (!fs.existsSync(OTP_FILE)) writeJSON(OTP_FILE, {});
    console.log('✅ Database initialized');
}
initDB();

// Generate a token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Generate OTP (6-digit)
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Parse request body
function getBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', reject);
    });
}

// Send JSON response
function sendJSON(res, status, data) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Token'
    });
    res.end(JSON.stringify(data));
}

// Compute order total with delivery fee
function computeTotal(items) {
    let subtotal = 0;
    let totalItems = 0;
    items.forEach(item => {
        let price = item.price || 0;
        let qty = item.qty || 1;
        subtotal += price * qty;
        totalItems += qty;
    });
    let delivery = subtotal >= 500 ? 0 : 40; // Free delivery above ₹500
    return { subtotal, delivery, total: subtotal + delivery, totalItems };
}

// ============================================
// AUTH HANDLERS
// ============================================

// Register / Sign Up
async function handleRegister(req, res, body) {
    const { name, email, phone, password, role } = body;
    if (!name || !email || !phone || !password) {
        return sendJSON(res, 400, { success: false, message: 'All fields are required' });
    }
    if (!/^\d{10}$/.test(phone)) {
        return sendJSON(res, 400, { success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    let users = readJSON(USERS_FILE, []);
    if (users.find(u => u.email === email)) {
        return sendJSON(res, 400, { success: false, message: 'Email already registered. Please login.' });
    }
    if (users.find(u => u.phone === phone)) {
        return sendJSON(res, 400, { success: false, message: 'Mobile number already registered. Please login.' });
    }

    // Hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(password + salt).digest('hex');

    const user = {
        id: generateToken().slice(0, 16),
        name,
        email,
        phone,
        role: role || 'buyer',
        password: hash,
        salt,
        createdAt: new Date().toISOString()
    };

    users.push(user);
    writeJSON(USERS_FILE, users);

    // Create session
    const token = generateToken();
    user.token = token;
    writeJSON(USERS_FILE, users);

    sendJSON(res, 201, {
        success: true,
        message: 'Registration successful!',
        token,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
}

// Login / Sign In
async function handleLogin(req, res, body) {
    const { email, phone, password } = body;
    if (!password || (!email && !phone)) {
        return sendJSON(res, 400, { success: false, message: 'Please provide email/phone and password' });
    }

    let users = readJSON(USERS_FILE, []);
    let user = users.find(u => u.email === email || u.phone === (phone || ''));
    if (!user) {
        return sendJSON(res, 401, { success: false, message: 'Account not found. Please register first.' });
    }

    const hash = crypto.createHash('sha256').update(password + user.salt).digest('hex');
    if (hash !== user.password) {
        return sendJSON(res, 401, { success: false, message: 'Incorrect password. Please try again.' });
    }

    // Create session token
    const token = generateToken();
    user.token = token;
    writeJSON(USERS_FILE, users);

    sendJSON(res, 200, {
        success: true,
        message: 'Login successful!',
        token,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
}

// Logout / Sign Out
async function handleLogout(req, res) {
    const token = getToken(req);
    if (token) {
        let users = readJSON(USERS_FILE, []);
        let user = users.find(u => u.token === token);
        if (user) {
            delete user.token;
            writeJSON(USERS_FILE, users);
        }
    }
    sendJSON(res, 200, { success: true, message: 'Logged out successfully' });
}

// Get current user by token
function getUserByToken(token) {
    let users = readJSON(USERS_FILE, []);
    return users.find(u => u.token === token) || null;
}

// Get token from request
function getToken(req) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return req.headers['x-token'] || null;
}

// Forgot Password - send OTP
async function handleForgot(req, res, body) {
    const { phone } = body;
    if (!phone) {
        return sendJSON(res, 400, { success: false, message: 'Please enter your mobile number' });
    }

    let users = readJSON(USERS_FILE, []);
    let user = users.find(u => u.phone === phone);
    if (!user) {
        return sendJSON(res, 404, { success: false, message: 'No account found with this mobile number' });
    }

    const otp = generateOTP();
    const otpData = readJSON(OTP_FILE, {});
    otpData[phone] = {
        otp,
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        token: generateToken()
    };
    writeJSON(OTP_FILE, otpData);

    // In a production app, this OTP would be sent via SMS gateway (Twilio, MSG91, etc.)
    console.log(`📱 OTP for ${phone}: ${otp} (Demo - in production this is sent via SMS)`);

    sendJSON(res, 200, {
        success: true,
        message: 'OTP sent to your mobile number!',
        otp, // Demo purpose - remove in production
        resetToken: otpData[phone].token
    });
}

// Verify OTP and reset password
async function handleVerifyOTP(req, res, body) {
    const { phone, otp, newPassword } = body;
    if (!phone || !otp) {
        return sendJSON(res, 400, { success: false, message: 'Please provide phone and OTP' });
    }

    const otpData = readJSON(OTP_FILE, {});
    const record = otpData[phone];

    if (!record) {
        return sendJSON(res, 400, { success: false, message: 'No OTP found. Please request a new OTP.' });
    }
    if (Date.now() > record.expires) {
        return sendJSON(res, 400, { success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== otp) {
        return sendJSON(res, 400, { success: false, message: 'Incorrect OTP. Please try again.' });
    }

    if (newPassword) {
        let users = readJSON(USERS_FILE, []);
        let user = users.find(u => u.phone === phone);
        if (user) {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.createHash('sha256').update(newPassword + salt).digest('hex');
            user.password = hash;
            user.salt = salt;
            writeJSON(USERS_FILE, users);
        }
    }

    // Clear OTP
    delete otpData[phone];
    writeJSON(OTP_FILE, otpData);

    sendJSON(res, 200, { success: true, message: 'OTP verified! Password reset successful.' });
}

// ============================================
// PRODUCT HANDLERS
// ============================================
async function handleGetProducts(req, res) {
    let products = readJSON(PRODUCTS_FILE, PRODUCTS);
    let category = req.urlParams.get('category');
    let search = req.urlParams.get('search');

    if (category && category !== 'all') {
        products = products.filter(p => p.category === category);
    }
    if (search) {
        products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    sendJSON(res, 200, { success: true, products });
}

// ============================================
// ORDER HANDLERS
// ============================================
async function handlePlaceOrder(req, res, body) {
    const token = getToken(req);
    const user = getUserByToken(token);

    const { items, address, payment, phone, location } = body;

    if (!items || items.length === 0) {
        return sendJSON(res, 400, { success: false, message: 'Cart is empty' });
    }
    if (!address) {
        return sendJSON(res, 400, { success: false, message: 'Delivery address is required' });
    }
    if (!payment) {
        return sendJSON(res, 400, { success: false, message: 'Payment method is required' });
    }

    const totals = computeTotal(items);

    const order = {
        id: 'MDC-' + Math.floor(1000 + Math.random() * 9000),
        userEmail: user ? user.email : (body.email || 'guest'),
        userName: user ? user.name : (body.name || 'Guest'),
        phone: phone || (user ? user.phone : ''),
        items,
        address,
        location: location || null,
        payment,
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        total: totals.total,
        totalItems: totals.totalItems,
        status: 'Confirmed',
        date: new Date().toLocaleString()
    };

    let orders = readJSON(ORDERS_FILE, []);
    orders.push(order);
    writeJSON(ORDERS_FILE, orders);

    sendJSON(res, 201, { success: true, message: 'Order placed successfully!', order });
}

async function handleGetOrders(req, res) {
    const token = getToken(req);
    const user = getUserByToken(token);
    let orders = readJSON(ORDERS_FILE, []);

    if (user && user.email) {
        orders = orders.filter(o => o.userEmail === user.email);
    }

    sendJSON(res, 200, { success: true, orders });
}

// ============================================
// LOCATION HANDLER (reverse geocode - Zepto like)
// ============================================
async function handleReverseGeocode(req, res) {
    const lat = parseFloat(req.urlParams.get('lat'));
    const lng = parseFloat(req.urlParams.get('lng'));

    if (isNaN(lat) || isNaN(lng)) {
        return sendJSON(res, 400, { success: false, message: 'Invalid coordinates' });
    }

    // Demo reverse geocoding - in production use Google Maps / OpenStreetMap Nominatim API
    // For this demo, we generate a readable address from coordinates
    const landmarks = ['Near Main Market', 'Near City Park', 'Near Railway Station', 'Near Bus Stand', 'Near Temple'];
    const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
    const coords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    const address = `Your location (${coords}) - ${randomLandmark}`;

    sendJSON(res, 200, {
        success: true,
        address,
        latitude: lat,
        longitude: lng,
        note: 'Demo location. In production, this uses Google Maps reverse geocoding.'
    });
}

// ============================================
// STATIC FILE SERVING
// ============================================
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function serveStatic(req, res, pathname) {
    let filePath = path.join(__dirname, pathname);
    if (pathname === '/' || pathname === '') {
        filePath = path.join(__dirname, 'index.html');
    }

    // Security: prevent path traversal
    if (!filePath.startsWith(__dirname)) {
        sendJSON(res, 403, { success: false, message: 'Forbidden' });
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            sendJSON(res, 404, { success: false, message: 'File not found' });
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// ============================================
// ROUTER
// ============================================
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    req.urlParams = url.searchParams;

    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Token'
        });
        res.end();
        return;
    }

    // ===== API ROUTES =====
    // AUTH
    if (pathname === '/api/auth/register' && req.method === 'POST') {
        try { return await handleRegister(req, res, await getBody(req)); } catch (e) { return sendJSON(res, 400, { success: false, message: e.message }); }
    }
    if (pathname === '/api/auth/login' && req.method === 'POST') {
        try { return await handleLogin(req, res, await getBody(req)); } catch (e) { return sendJSON(res, 400, { success: false, message: e.message }); }
    }
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
        return await handleLogout(req, res);
    }
    if (pathname === '/api/auth/forgot' && req.method === 'POST') {
        try { return await handleForgot(req, res, await getBody(req)); } catch (e) { return sendJSON(res, 400, { success: false, message: e.message }); }
    }
    if (pathname === '/api/auth/verify-otp' && req.method === 'POST') {
        try { return await handleVerifyOTP(req, res, await getBody(req)); } catch (e) { return sendJSON(res, 400, { success: false, message: e.message }); }
    }

    // PRODUCTS
    if (pathname === '/api/products' && req.method === 'GET') {
        return await handleGetProducts(req, res);
    }

    // ORDERS
    if (pathname === '/api/orders' && req.method === 'POST') {
        try { return await handlePlaceOrder(req, res, await getBody(req)); } catch (e) { return sendJSON(res, 400, { success: false, message: e.message }); }
    }
    if (pathname === '/api/orders' && req.method === 'GET') {
        return await handleGetOrders(req, res);
    }

    // LOCATION
    if (pathname === '/api/location/reverse' && req.method === 'GET') {
        return await handleReverseGeocode(req, res);
    }

    // ===== STATIC FILES =====
    if (pathname.startsWith('/api/')) {
        return sendJSON(res, 404, { success: false, message: 'API endpoint not found' });
    }

    return serveStatic(req, res, pathname);
});

// ============================================
// START SERVER
// ============================================
server.listen(PORT, HOST, () => {
    console.log('============================================');
    console.log('  MARKET DEVELOPMENT CENTRE - Backend');
    console.log('============================================');
    console.log(`  🌐 Server running at: http://localhost:${PORT}`);
    console.log(`  📦 Products: ${PRODUCTS.length} items`);
    console.log('--------------------------------------------');
    console.log('  API Endpoints:');
    console.log('  POST /api/auth/register  - Sign Up');
    console.log('  POST /api/auth/login     - Sign In');
    console.log('  POST /api/auth/logout    - Sign Out');
    console.log('  POST /api/auth/forgot    - Forgot Password (OTP)');
    console.log('  POST /api/auth/verify-otp- Verify OTP');
    console.log('  GET  /api/products        - All products');
    console.log('  POST /api/orders          - Place order');
    console.log('  GET  /api/orders          - Get orders');
    console.log('  GET  /api/location/reverse- Reverse geocode');
    console.log('============================================');
});
