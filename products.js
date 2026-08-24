// ============================================
// MARKET DEVELOPMENT CENTRE - Products Controller
// ============================================

let currentCategory = "all";
let currentSearch = "";
let loadedProducts = [];

// Category Labels Mapping
const CATEGORY_NAMES = {
    all: "All Fresh Produce",
    vegetable: "Fresh Vegetables",
    fruit: "Farm Fresh Fruits",
    dairy: "Dairy, Butter & Milk",
    grocery: "Staples & Groceries",
    drinks: "Cold Drinks & Juices"
};

// =============================
// Fetch & Load Products
// =============================
async function fetchAndRenderProducts() {
    const container = document.getElementById("productList");
    const skeleton = document.getElementById("skeletonGrid");
    if (!container) return;

    if (skeleton) skeleton.style.display = "grid";
    container.style.display = "none";

    loadedProducts = await SmartAPI.getProducts();

    if (skeleton) skeleton.style.display = "none";
    container.style.display = "grid";

    renderProductCards(loadedProducts);
    loadCategoryFromURL();
}

// =============================
// Render Product Cards with Steppers
// =============================
function renderProductCards(items) {
    const container = document.getElementById("productList");
    if (!container) return;

    container.innerHTML = "";

    items.forEach(p => {
        const stars = "⭐".repeat(p.rating || 5);
        const qty = getCartItemQty(p.name);
        const unit = p.unit || 'kg';
        const img = p.image || 'images/vegetables.svg';

        container.innerHTML += `
        <div class="product-card-enhanced" data-category="${p.category}" data-name="${p.name.toLowerCase()}">
            <div class="product-badge-time">
                <i class="fa-solid fa-bolt" style="color:var(--orange)"></i> 10 MINS
            </div>
            <div class="product-image-wrap">
                <img src="${img}" alt="${p.name}" loading="lazy">
            </div>
            <div class="product-title" title="${p.name}">${p.name}</div>
            <div class="product-unit-text">1 ${unit} &bull; <span style="color:#16a34a;font-weight:600;"><i class="fa-solid fa-circle-check" style="font-size:11px;"></i> In Stock (${p.stock || 100})</span></div>
            <div class="product-pricing-row">
                <div class="product-price-current">${formatPrice(p.price)}</div>
                <div class="product-rating-pill">
                    <i class="fa-solid fa-star" style="font-size:10px;"></i> ${p.rating || 5}
                </div>
            </div>
            <div class="card-action-wrap" data-prod-name="${p.name}" data-prod-price="${p.price}" data-prod-unit="${unit}" data-prod-img="${img}">
                ${qty > 0 ? `
                    <div class="stepper-control">
                        <button type="button" onclick="event.stopPropagation(); changeCartQty('${p.name}', -1, ${p.price}, '${unit}', '${img}')">-</button>
                        <span class="stepper-count">${qty}</span>
                        <button type="button" onclick="event.stopPropagation(); changeCartQty('${p.name}', 1, ${p.price}, '${unit}', '${img}')">+</button>
                    </div>
                ` : `
                    <button type="button" class="card-add-btn" onclick="event.stopPropagation(); changeCartQty('${p.name}', 1, ${p.price}, '${unit}', '${img}')">
                        <i class="fa-solid fa-plus"></i> ADD
                    </button>
                `}
            </div>
        </div>`;
    });

    applyFilters();
}

// =============================
// Category Chip Selection
// =============================
function selectCategory(cat, btn) {
    currentCategory = cat;

    // Update active chip styling
    document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
    if (btn) {
        btn.classList.add('active');
    } else {
        const matchingBtn = document.querySelector(`.chip-btn[data-cat="${cat}"]`);
        if (matchingBtn) matchingBtn.classList.add('active');
    }

    // Update Category Title
    const titleEl = document.getElementById("pageCatTitle");
    if (titleEl) {
        titleEl.innerText = CATEGORY_NAMES[cat] || "Fresh Products";
    }

    applyFilters();
}

// =============================
// Filter & Search Logic
// =============================
function applyFilters() {
    const cards = document.querySelectorAll("#productList .product-card-enhanced");
    const emptyMsg = document.getElementById("noResults");
    const countBadge = document.getElementById("productCountBadge");
    let visibleCount = 0;

    cards.forEach(card => {
        const cat = card.getAttribute("data-category");
        const name = card.getAttribute("data-name");

        const catMatch = currentCategory === "all" || cat === currentCategory;
        const searchMatch = !currentSearch || name.includes(currentSearch);

        if (catMatch && searchMatch) {
            card.style.display = "flex";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });

    if (emptyMsg) {
        emptyMsg.style.display = visibleCount === 0 ? "block" : "none";
    }

    if (countBadge) {
        countBadge.innerText = `${visibleCount} item${visibleCount === 1 ? '' : 's'} available`;
    }
}

// Debounced Search Handler
let searchTimer = null;
function searchProduct() {
    const input = document.getElementById("searchBox");
    if (input) {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            currentSearch = input.value.trim().toLowerCase();
            applyFilters();
        }, 150);
    }
}

// =============================
// URL Parameter Sync
// =============================
function loadCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    if (cat && ["vegetable", "fruit", "dairy", "grocery", "drinks"].includes(cat)) {
        selectCategory(cat, document.querySelector(`.chip-btn[data-cat="${cat}"]`));
    }
}

// =============================
// Initialize
// =============================
document.addEventListener("DOMContentLoaded", () => {
    fetchAndRenderProducts();
});
