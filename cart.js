// ============================================
// MARKET DEVELOPMENT CENTRE - Cart Script
// ============================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// =============================
// Display Cart Items
// =============================
function displayCart(){
    let cartItems=document.getElementById("cartItems");
    if(!cartItems) return;

    let totalPrice=0;
    let totalItems=0;

    cartItems.innerHTML="";

    if(cart.length===0){
        cartItems.innerHTML=`
        <div class="empty-cart">
            <i class="fa-solid fa-cart-shopping"></i>
            <h2>Your cart is empty</h2>
            <p>Add some fresh products to get started!</p>
            <a href="products.html">
                <i class="fa-solid fa-basket-shopping"></i> Browse Products
            </a>
        </div>`;
        updateSummary(0,0);
        return;
    }

    cart.forEach((item,index)=>{
        totalPrice += item.price * item.qty;
        totalItems += item.qty;

cartItems.innerHTML += `
        <div class="cart-item">
            <div>
                <h3><i class="fa-solid fa-apple-whole" style="color:#4caf50;margin-right:8px;"></i>${item.name}</h3>
                <p style="color:#777;margin-top:5px;">Price: ${formatPrice(item.price)} / ${item.unit||'kg'}</p>
                <p style="color:#777;margin-top:3px;">Weight/Quantity: ${item.qty} ${item.unit||'kg'}</p>
            </div>
            <div style="text-align:center;">
                <p style="color:#777;margin-bottom:5px;">Quantity</p>
                <div class="qty-control">
                    <button onclick="decreaseQuantity(${index})">-</button>
                    <span>${item.qty}</span>
                    <button onclick="increaseQuantity(${index})">+</button>
                </div>
            </div>
            <div style="text-align:center;">
                <p style="color:#777;margin-bottom:5px;">Subtotal</p>
                <h3 style="color:#ff9800;">${formatPrice(item.price * item.qty)}</h3>
            </div>
            <button class="remove-btn" onclick="removeItem(${index})">
                <i class="fa-solid fa-trash"></i> Remove
            </button>
        </div>`;
    });

    updateSummary(totalItems,totalPrice);
}

// =============================
// Update Summary (INR ₹)
// =============================
function updateSummary(items,price){
    let totalItemsEl=document.getElementById("totalItems");
    let subTotalEl=document.getElementById("subTotal");
    let totalPriceEl=document.getElementById("totalPrice");
    let deliveryEl=document.getElementById("delivery");

    // Free delivery on orders above ₹500, else ₹40
    let delivery = price>=500 ? 0 : 40;

    if(totalItemsEl) totalItemsEl.innerText=items;
    if(subTotalEl) subTotalEl.innerText=price.toFixed(2);
    if(deliveryEl) deliveryEl.innerText = delivery===0 ? "FREE" : formatPrice(delivery);
    if(totalPriceEl) totalPriceEl.innerText=(price+delivery).toFixed(2);
}

// =============================
// Increase Quantity
// =============================
function increaseQuantity(index){
    cart[index].qty++;
    saveCart();
}

// =============================
// Decrease Quantity
// =============================
function decreaseQuantity(index){
    if(cart[index].qty > 1){
        cart[index].qty--;
    }else{
        cart.splice(index,1);
    }
    saveCart();
}

// =============================
// Remove Item
// =============================
function removeItem(index){
    cart.splice(index,1);
    saveCart();
}

// =============================
// Clear Cart
// =============================
function clearCart(){
    if(confirm("Are you sure you want to clear your cart?")){
        cart=[];
        localStorage.setItem("cart","[]");
        displayCart();
        updateCartCount();
        showToast("Cart cleared 🗑️");
    }
}

// =============================
// Save Cart
// =============================
function saveCart(){
    localStorage.setItem("cart",JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// =============================
// Checkout
// =============================
function checkout(){
    if(cart.length===0){
        showToast("Your cart is empty! Add products first.");
        return;
    }
    window.location.href="checkout.html";
}

// =============================
// Initialize
// =============================
displayCart();
updateCartCount();
