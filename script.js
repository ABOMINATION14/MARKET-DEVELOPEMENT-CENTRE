// ============================================
// MARKET DEVELOPMENT CENTRE - Main Script
// ============================================

// =============================
// Product Database
// =============================
const products = [
    {id:1, name:"Tomato", price:2.00, category:"vegetable", image:"images/tomato.svg", desc:"Fresh and juicy tomatoes", rating:5},
    {id:2, name:"Potato", price:1.50, category:"vegetable", image:"images/potato.svg", desc:"Farm fresh potatoes", rating:5},
    {id:3, name:"Carrot", price:3.00, category:"vegetable", image:"images/carrot.svg", desc:"Sweet crunchy carrots", rating:4},
    {id:4, name:"Onion", price:2.20, category:"vegetable", image:"images/onion.svg", desc:"Fresh red onions", rating:5},
    {id:5, name:"Apple", price:5.00, category:"fruit", image:"images/apple.svg", desc:"Crisp red apples", rating:5},
    {id:6, name:"Banana", price:2.50, category:"fruit", image:"images/banana.svg", desc:"Sweet ripe bananas", rating:4},
    {id:7, name:"Milk", price:1.99, category:"dairy", image:"images/milk.svg", desc:"Pure fresh milk", rating:5},
    {id:8, name:"Curd", price:2.50, category:"dairy", image:"images/curd.svg", desc:"Creamy fresh curd", rating:4},
    {id:9, name:"Rice", price:4.99, category:"grocery", image:"images/rice.svg", desc:"Premium quality rice", rating:5},
    {id:10, name:"Wheat", price:3.50, category:"grocery", image:"images/wheat.svg", desc:"Whole wheat grains", rating:4},
    {id:11, name:"Orange Juice", price:3.99, category:"drinks", image:"images/juice.svg", desc:"Fresh orange juice", rating:5},
    {id:12, name:"Cold Drink", price:1.50, category:"drinks", image:"images/drink.svg", desc:"Refreshing cold drink", rating:4}
];

// =============================
// Load Cart
// =============================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// =============================
// Update Cart Counter
// =============================
function updateCartCount(){
    let count=document.getElementById("cartCount");
    if(count){
        let totalQty = cart.reduce((sum,item)=>sum+item.qty,0);
        count.innerHTML=totalQty;
    }
}

// =============================
// Add Product to Cart
// =============================
function addCart(name,price){
    let item={name:name, price:price, qty:1};
    let exist=cart.find(p=>p.name===name);
    if(exist){
        exist.qty++;
    }else{
        cart.push(item);
    }
    localStorage.setItem("cart",JSON.stringify(cart));
    updateCartCount();
    showToast(name + " added to cart 🛒");
}

// =============================
// Toast Notification (user friendly)
// =============================
function showToast(message){
    let toast=document.getElementById("toast");
    if(!toast){
        toast=document.createElement("div");
        toast.id="toast";
        toast.style.cssText="position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#2e7d32;color:#fff;padding:16px 30px;border-radius:35px;font-size:18px;z-index:9999;box-shadow:0 5px 20px rgba(0,0,0,.3);transition:.4s;opacity:0;";
        document.body.appendChild(toast);
    }
    toast.innerHTML=message;
    toast.style.opacity="1";
    setTimeout(()=>{toast.style.opacity="0";},2500);
}

// =============================
// Search Product
// =============================
function searchProduct(){
    let input=document.getElementById("searchBox").value.trim().toLowerCase();
    let cards=document.querySelectorAll(".card, .product-card");
    cards.forEach(card=>{
        let product=card.querySelector("h3") ? card.querySelector("h3").innerText.toLowerCase() : "";
        if(product.includes(input)){
            card.style.display="block";
        }else{
            card.style.display="none";
        }
    });
    let emptyMsg=document.getElementById("noResults");
    let visible=[...cards].filter(c=>c.style.display!=="none");
    if(emptyMsg){
        emptyMsg.style.display = visible.length===0 ? "block" : "none";
    }
}

// =============================
// Voice Search (for less educated users)
// =============================
function voiceSearch(){
    if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
        alert("Sorry, your browser does not support voice search. Please type the product name.");
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let input=document.getElementById("searchBox");
    input.value = "🎤 Listening...";
    input.style.borderColor="red";

    recognition.start();

    recognition.onresult = function(event){
        let text = event.results[0][0].transcript;
        input.value = text;
        input.style.borderColor="#2e7d32";
        searchProduct();
        showToast("You searched for: " + text);
    };

    recognition.onerror = function(){
        input.value = "";
        input.style.borderColor="#2e7d32";
        alert("Could not hear you. Please try again or type.");
    };
}

// =============================
// Display Featured Products
// =============================
function loadFeatured(){
    let grid=document.getElementById("featuredGrid");
    if(!grid) return;
    let featured=products.slice(0,12);
    grid.innerHTML="";
    featured.forEach(p=>{
        let stars="⭐".repeat(p.rating) + "☆".repeat(5-p.rating);
        grid.innerHTML += `
        <div class="card" data-name="${p.name.toLowerCase()}">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p class="price">$${p.price.toFixed(2)}</p>
            <p class="desc">${p.desc}</p>
            <p class="rating">${stars}</p>
            <button onclick="addCart('${p.name}',${p.price})">
                <i class="fa-solid fa-cart-plus"></i> Add To Cart
            </button>
        </div>`;
    });
}

// =============================
// Offer
// =============================
function offer(){
    let coupon = "FRESH20";
    showToast("🎉 You got 20% OFF! Use code: " + coupon);
    localStorage.setItem("coupon",coupon);
}

// =============================
// Toggle Mobile Menu
// =============================
function toggleMenu(){
    let ul=document.querySelector("nav ul");
    if(ul.style.display==="flex"){
        ul.style.display="none";
    }else{
        ul.style.display="flex";
        ul.style.flexDirection="column";
        ul.style.width="100%";
    }
}

// =============================
// Initialize
// =============================
updateCartCount();
loadFeatured();

window.onload=function(){
    console.log("Market Development Centre Loaded");
    updateCartCount();
    loadFeatured();
}
