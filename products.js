// ============================================
// MARKET DEVELOPMENT CENTRE - Products Page
// ============================================

// =============================
// Display All Products
// =============================
function loadAllProducts(){
    let container=document.getElementById("productList");
    if(!container) return;

    container.innerHTML="";

    products.forEach(p=>{
        let stars="⭐".repeat(p.rating) + "☆".repeat(5-p.rating);
        container.innerHTML += `
        <div class="card" data-category="${p.category}" data-name="${p.name.toLowerCase()}">
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
// Filter by Category
// =============================
let currentCategory = "all";
let currentSearch = "";

function filterCategory(){
    let select=document.getElementById("category");
    currentCategory = select ? select.value : "all";
    applyFilters();
}

// =============================
// Apply both search and filter
// =============================
function applyFilters(){
    let cards=document.querySelectorAll("#productList .card");
    let emptyMsg=document.getElementById("noResults");
    let visibleCount=0;

    cards.forEach(card=>{
        let cat=card.getAttribute("data-category");
        let name=card.getAttribute("data-name");

        let catMatch = currentCategory==="all" || cat===currentCategory;
        let searchMatch = !currentSearch || name.includes(currentSearch);

        if(catMatch && searchMatch){
            card.style.display="block";
            visibleCount++;
        }else{
            card.style.display="none";
        }
    });

    if(emptyMsg){
        emptyMsg.style.display = visibleCount===0 ? "block" : "none";
    }
}

// Override searchProduct for products page
function searchProduct(){
    let input=document.getElementById("searchBox");
    if(input){
        currentSearch = input.value.trim().toLowerCase();
        applyFilters();
    }
}

// =============================
// Load category from URL
// =============================
function loadCategoryFromURL(){
    let params=new URLSearchParams(window.location.search);
    let cat=params.get("cat");
    if(cat){
        currentCategory=cat;
        let select=document.getElementById("category");
        if(select){
            select.value=cat;
        }
        applyFilters();
    }
}

// =============================
// Initialize
// =============================
loadAllProducts();
loadCategoryFromURL();
updateCartCount();
