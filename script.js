// ============================================
// MARKET DEVELOPMENT CENTRE - Main Script
// ============================================

// =============================
// API Base URL
// =============================
const API = 'http://localhost:8080';

// =============================
// Currency Formatter (INR ₹)
// =============================
function formatPrice(price){
    return '₹' + Number(price).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
}

// =============================
// Auth Helper Functions
// =============================
function getToken(){
    return localStorage.getItem('token');
}

function getCurrentUser(){
    try{
        return JSON.parse(localStorage.getItem('user'));
    }catch(e){
        return null;
    }
}

function isLoggedIn(){
    return !!getToken();
}

// =============================
// Auth Guard - redirect to login if not authenticated
// =============================
function requireAuth(){
    if(!isLoggedIn()){
        // Save the intended page so we can redirect back after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname.split('/').pop());
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// =============================
// Sign Out
// =============================
async function logout(){
    try{
        await fetch(API+'/api/auth/logout',{
            method:'POST',
            headers:{'Authorization':'Bearer '+getToken()}
        });
    }catch(e){}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('👋 Signed out successfully!');
    setTimeout(()=>{window.location.href='login.html';},1000);
}

// =============================
// Product Database (INR ₹)
// 41 products - wide variety of fruits & vegetables
// =============================
const products = [
    // ---- VEGETABLES ----
    {id:1, name:"Tomato", price:40, category:"vegetable", image:"images/tomato.svg", desc:"Fresh juicy tomatoes", rating:5, unit:"kg"},
    {id:2, name:"Potato", price:30, category:"vegetable", image:"images/potato.svg", desc:"Farm fresh potatoes", rating:5, unit:"kg"},
    {id:3, name:"Carrot", price:60, category:"vegetable", image:"images/carrot.svg", desc:"Sweet crunchy carrots", rating:4, unit:"kg"},
    {id:4, name:"Onion", price:45, category:"vegetable", image:"images/onion.svg", desc:"Fresh red onions", rating:5, unit:"kg"},
    {id:5, name:"Brinjal", price:50, category:"vegetable", image:"images/vegetables.svg", desc:"Fresh purple brinjals", rating:4, unit:"kg"},
    {id:6, name:"Ladies Finger", price:55, category:"vegetable", image:"images/vegetables.svg", desc:"Tender okra", rating:4, unit:"kg"},
    {id:7, name:"Cabbage", price:35, category:"vegetable", image:"images/vegetables.svg", desc:"Fresh green cabbage", rating:4, unit:"piece"},
    {id:8, name:"Cauliflower", price:45, category:"vegetable", image:"images/vegetables.svg", desc:"White fresh cauliflower", rating:4, unit:"piece"},
    {id:9, name:"Capsicum", price:70, category:"vegetable", image:"images/vegetables.svg", desc:"Crispy green capsicum", rating:4, unit:"kg"},
    {id:10, name:"Spinach", price:25, category:"vegetable", image:"images/vegetables.svg", desc:"Fresh leafy spinach", rating:4, unit:"bunch"},
    {id:11, name:"Coriander", price:20, category:"vegetable", image:"images/vegetables.svg", desc:"Fresh coriander leaves", rating:4, unit:"bunch"},
    {id:12, name:"Beans", price:65, category:"vegetable", image:"images/vegetables.svg", desc:"Fresh green beans", rating:4, unit:"kg"},
    {id:13, name:"Pumpkin", price:30, category:"vegetable", image:"images/vegetables.svg", desc:"Fresh orange pumpkin", rating:4, unit:"kg"},
    {id:14, name:"Radish", price:40, category:"vegetable", image:"images/vegetables.svg", desc:"Crispy white radish", rating:4, unit:"kg"},
    {id:15, name:"Beetroot", price:55, category:"vegetable", image:"images/vegetables.svg", desc:"Sweet red beetroot", rating:4, unit:"kg"},
    {id:16, name:"Cucumber", price:35, category:"vegetable", image:"images/vegetables.svg", desc:"Cool fresh cucumber", rating:4, unit:"kg"},
    {id:17, name:"Green Chilli", price:30, category:"vegetable", image:"images/vegetables.svg", desc:"Fresh green chillies", rating:4, unit:"kg"},

    // ---- FRUITS ----
    {id:18, name:"Apple", price:200, category:"fruit", image:"images/apple.svg", desc:"Crisp red apples", rating:5, unit:"kg"},
    {id:19, name:"Banana", price:60, category:"fruit", image:"images/banana.svg", desc:"Sweet ripe bananas", rating:4, unit:"bunch"},
    {id:20, name:"Mango", price:150, category:"fruit", image:"images/fruits.svg", desc:"Juicy alphonso mangoes", rating:5, unit:"kg"},
    {id:21, name:"Orange", price:80, category:"fruit", image:"images/fruits.svg", desc:"Sweet juicy oranges", rating:5, unit:"kg"},
    {id:22, name:"Grapes", price:120, category:"fruit", image:"images/fruits.svg", desc:"Fresh green grapes", rating:4, unit:"kg"},
    {id:23, name:"Watermelon", price:35, category:"fruit", image:"images/fruits.svg", desc:"Sweet red watermelon", rating:4, unit:"kg"},
    {id:24, name:"Pomegranate", price:180, category:"fruit", image:"images/fruits.svg", desc:"Fresh red pomegranate", rating:5, unit:"kg"},
    {id:25, name:"Papaya", price:50, category:"fruit", image:"images/fruits.svg", desc:"Ripe sweet papaya", rating:4, unit:"kg"},
    {id:26, name:"Pineapple", price:70, category:"fruit", image:"images/fruits.svg", desc:"Sweet ripe pineapple", rating:4, unit:"piece"},
    {id:27, name:"Strawberry", price:250, category:"fruit", image:"images/fruits.svg", desc:"Fresh red strawberries", rating:5, unit:"box"},
    {id:28, name:"Guava", price:60, category:"fruit", image:"images/fruits.svg", desc:"Fresh green guava", rating:4, unit:"kg"},
    {id:29, name:"Pears", price:160, category:"fruit", image:"images/fruits.svg", desc:"Sweet juicy pears", rating:4, unit:"kg"},

    // ---- DAIRY ----
    {id:30, name:"Milk", price:60, category:"dairy", image:"images/milk.svg", desc:"Pure fresh milk (1L)", rating:5, unit:"litre"},
    {id:31, name:"Curd", price:40, category:"dairy", image:"images/curd.svg", desc:"Creamy fresh curd", rating:4, unit:"cup"},
    {id:32, name:"Butter", price:55, category:"dairy", image:"images/dairy.svg", desc:"Fresh creamy butter", rating:4, unit:"pack"},
    {id:33, name:"Paneer", price:200, category:"dairy", image:"images/dairy.svg", desc:"Fresh soft paneer", rating:5, unit:"kg"},
    {id:34, name:"Cheese", price:150, category:"dairy", image:"images/dairy.svg", desc:"Processed cheese slices", rating:4, unit:"pack"},

    // ---- GROCERIES ----
    {id:35, name:"Rice", price:80, category:"grocery", image:"images/rice.svg", desc:"Premium basmati rice", rating:5, unit:"kg"},
    {id:36, name:"Wheat", price:50, category:"grocery", image:"images/wheat.svg", desc:"Whole wheat grains", rating:4, unit:"kg"},
    {id:37, name:"Sugar", price:45, category:"grocery", image:"images/snacks.svg", desc:"Fine white sugar", rating:4, unit:"kg"},
    {id:38, name:"Dal", price:120, category:"grocery", image:"images/snacks.svg", desc:"Premium toor dal", rating:4, unit:"kg"},

    // ---- DRINKS ----
    {id:39, name:"Orange Juice", price:90, category:"drinks", image:"images/juice.svg", desc:"Fresh orange juice", rating:5, unit:"bottle"},
    {id:40, name:"Cold Drink", price:40, category:"drinks", image:"images/drink.svg", desc:"Refreshing cold drink", rating:4, unit:"bottle"},
    {id:41, name:"Coconut Water", price:50, category:"drinks", image:"images/drink.svg", desc:"Fresh tender coconut water", rating:5, unit:"bottle"}
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
        <div class="card" data-category="${p.category}" data-name="${p.name.toLowerCase()}">
            <div class="weight-selector" id="ws-${p.id}">
                <button class="weight-btn active" onclick="setWeight('${p.id}',1,'${p.unit}')">1 ${p.unit}</button>
                <button class="weight-btn" onclick="setWeight('${p.id}',2,'${p.unit}')">2 ${p.unit}</button>
                <button class="weight-btn" onclick="setWeight('${p.id}',5,'${p.unit}')">5 ${p.unit}</button>
            </div>
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p class="price">${formatPrice(p.price)}</p>
            <p class="desc">${p.desc}</p>
            <p class="rating">${stars}</p>
            <button onclick="addCartWeighted('${p.name}',${p.price},'ws-${p.id}')">
                <i class="fa-solid fa-cart-plus"></i> Add To Cart
            </button>
        </div>`;
    });
}

// =============================
// Weight Selector (customer chooses weight)
// =============================
function setWeight(id, qty, unit){
    let container=document.getElementById('ws-'+id);
    if(!container) return;
    let buttons=container.querySelectorAll('.weight-btn');
    buttons.forEach(btn=>btn.classList.remove('active'));
    event.target.classList.add('active');
    container.setAttribute('data-qty',qty);
    container.setAttribute('data-unit',unit);
}

// Add to cart with selected weight/qty
function addCartWeighted(name, price, weightId){
    let container=document.getElementById(weightId);
    let qty = container ? parseInt(container.getAttribute('data-qty')) || 1 : 1;
    let unit = container ? (container.getAttribute('data-unit') || 'kg') : 'kg';

    let item={name:name, price:price, qty:qty, unit:unit};
    let exist=cart.find(p=>p.name===name);
    if(exist){
        exist.qty += qty;
    }else{
        cart.push(item);
    }
    localStorage.setItem("cart",JSON.stringify(cart));
    updateCartCount();
    showToast(name + " (" + qty + " " + unit + ") added to cart 🛒");
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
// Live Location (Zepto style)
// =============================
function detectLocation(){
    let locText=document.getElementById('locText');
    if(!locText) return;

    if(!navigator.geolocation){
        locText.innerHTML='<strong>Location not supported</strong> - Please enter address manually';
        return;
    }

    locText.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Detecting your location...';

    navigator.geolocation.getCurrentPosition(async (position)=>{
        let lat=position.coords.latitude;
        let lng=position.coords.longitude;

        try{
            let res=await fetch(API+'/api/location/reverse?lat='+lat+'&lng='+lng);
            let data=await res.json();
            if(data.success){
                locText.innerHTML='Deliver to: <strong>'+data.address+'</strong>';
                localStorage.setItem('deliveryLocation',JSON.stringify({lat,lng,address:data.address}));

                // Also update checkout address if present
                let addrInput=document.getElementById('address');
                if(addrInput){
                    addrInput.value=data.address;
                }
                showToast('📍 Location detected!');
            }else{
                locText.innerHTML='<strong>Location detected</strong> - '+data.message;
            }
        }catch(e){
            locText.innerHTML='<strong>Deliver to: '+lat.toFixed(4)+', '+lng.toFixed(4)+'</strong>';
            localStorage.setItem('deliveryLocation',JSON.stringify({lat,lng,address:lat.toFixed(4)+', '+lng.toFixed(4)}));
            showToast('📍 Location detected!');
        }
    }, (error)=>{
        locText.innerHTML='<strong>Location access denied</strong> - Please enter address manually';
        showToast('⚠️ Enable location access or enter address manually');
    });
}

// Load saved location on page load
function loadLocation(){
    let locText=document.getElementById('locText');
    if(!locText) return;
    let saved=localStorage.getItem('deliveryLocation');
    if(saved){
        try{
            let data=JSON.parse(saved);
            locText.innerHTML='Deliver to: <strong>'+data.address+'</strong>';
        }catch(e){}
    }else{
        locText.innerHTML='Deliver to: <strong>Select location</strong>';
    }
}

// =============================
// Initialize
// =============================
updateCartCount();
loadFeatured();
loadLocation();

window.onload=function(){
    console.log("Market Development Centre Loaded");
    updateCartCount();
    loadFeatured();
    loadLocation();
}
