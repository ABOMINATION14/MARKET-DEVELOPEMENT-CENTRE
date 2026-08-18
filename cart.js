// ============================================
// MARKET DEVELOPMENT CENTRE - Cart Page Controller
// ============================================

function displayCart() {
    let cartItems = document.getElementById("cartItems");
    if (!cartItems) return;

    let totalPrice = 0;
    let totalItems = 0;
    cart = JSON.parse(localStorage.getItem("cart")) || [];

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `
        <div class="empty-cart">
            <i class="fa-solid fa-cart-shopping" style="font-size:48px;color:#d1d5db;margin-bottom:15px;"></i>
            <h2>Your cart is empty</h2>
            <p style="color:#6b7280;margin:6px 0 20px;">Add fresh vegetables, fruits or groceries to get started!</p>
            <a href="products.html" class="chip-btn active" style="display:inline-flex;padding:12px 24px;font-size:16px;">
                <i class="fa-solid fa-basket-shopping"></i> Browse Products
            </a>
        </div>`;
        updateSummary(0, 0);
        return;
    }

    cart.forEach((item, index) => {
        const itemSubtotal = item.price * item.qty;
        totalPrice += itemSubtotal;
        totalItems += item.qty;

        cartItems.innerHTML += `
        <div class="cart-item" style="border-radius:14px;background:#fff;padding:16px;box-shadow:var(--shadow-sm);margin-bottom:14px;border:1px solid #f0f0f0;">
            <div style="display:flex;align-items:center;gap:14px;flex:1;">
                <img src="${item.image || 'images/vegetables.svg'}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;border-radius:10px;background:#f9fafb;">
                <div>
                    <h3 style="font-size:16px;color:#1f2937;margin-bottom:4px;">${item.name}</h3>
                    <p style="color:#6b7280;font-size:13px;">${formatPrice(item.price)} / ${item.unit || 'kg'}</p>
                </div>
            </div>
            <div style="text-align:center;">
                <div class="stepper-control">
                    <button onclick="decreaseCartQuantity(${index})">-</button>
                    <span class="stepper-count">${item.qty}</span>
                    <button onclick="increaseCartQuantity(${index})">+</button>
                </div>
            </div>
            <div style="text-align:right;min-width:90px;">
                <h3 style="color:var(--darkgreen);font-size:17px;font-weight:700;">${formatPrice(itemSubtotal)}</h3>
            </div>
            <button class="remove-btn" onclick="removeCartItem(${index})" title="Remove item" style="margin-left:10px;">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>`;
    });

    updateSummary(totalItems, totalPrice);
}

// =============================
// Summary & Delivery Meter
// =============================
function updateSummary(items, price) {
    let totalItemsEl = document.getElementById("totalItems");
    let subTotalEl = document.getElementById("subTotal");
    let totalPriceEl = document.getElementById("totalPrice");
    let deliveryEl = document.getElementById("delivery");

    let delivery = price >= 500 ? 0 : 40;

    if (totalItemsEl) totalItemsEl.innerText = items;
    if (subTotalEl) subTotalEl.innerText = price.toFixed(2);
    if (deliveryEl) deliveryEl.innerText = delivery === 0 ? "FREE" : formatPrice(delivery);
    if (totalPriceEl) totalPriceEl.innerText = (price + delivery).toFixed(2);
}

function increaseCartQuantity(index) {
    cart[index].qty++;
    saveCartAndSync();
}

function decreaseCartQuantity(index) {
    if (cart[index].qty > 1) {
        cart[index].qty--;
    } else {
        cart.splice(index, 1);
    }
    saveCartAndSync();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    saveCartAndSync();
    showToast("Item removed from cart");
}

function clearCart() {
    if (confirm("Are you sure you want to clear your cart?")) {
        cart = [];
        saveCartAndSync();
        showToast("Cart cleared 🗑️");
    }
}

function saveCartAndSync() {
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
    updateCartCount();
    syncAllCardSteppers();
}

function checkout() {
    if (cart.length === 0) {
        showToast("Your cart is empty! Add products first.");
        return;
    }
    window.location.href = "checkout.html";
}

document.addEventListener("DOMContentLoaded", () => {
    displayCart();
    updateCartCount();
});
