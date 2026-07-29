// =============================
// FreshMart App
// =============================

// Product List
const products = [
    {id:1,name:"Tomato",price:2,image:"images/tomato.png"},
    {id:2,name:"Potato",price:1.5,image:"images/potato.png"},
    {id:3,name:"Carrot",price:3,image:"images/carrot.png"},
    {id:4,name:"Onion",price:2.2,image:"images/onion.png"},
    {id:5,name:"Apple",price:5,image:"images/apple.png"},
    {id:6,name:"Banana",price:2.5,image:"images/banana.png"}
];

// Load Cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// =============================
// Update Cart Counter
// =============================
function updateCartCount(){

    let count=document.getElementById("cartCount");

    if(count)
        count.innerHTML=cart.length;
}

updateCartCount();


// =============================
// Add Product
// =============================
function addCart(name,price){

    let item={
        name:name,
        price:price,
        qty:1
    };

    let exist=cart.find(p=>p.name===name);

    if(exist){

        exist.qty++;

    }else{

        cart.push(item);

    }

    localStorage.setItem("cart",JSON.stringify(cart));

    updateCartCount();

    alert(name+" Added To Cart");
}


// =============================
// Search Product
// =============================
function searchProduct(){

    let input=document.getElementById("searchBox").value.toLowerCase();

    let cards=document.querySelectorAll(".card");

    cards.forEach(card=>{

        let product=card.querySelector("h3").innerText.toLowerCase();

        if(product.includes(input))
            card.style.display="block";

        else
            card.style.display="none";

    });

}


// =============================
// Open Product Page
// =============================
function openProduct(id){

    localStorage.setItem("selectedProduct",id);

    window.location.href="product.html";

}


// =============================
// View Cart
// =============================
function viewCart(){

    window.location.href="cart.html";

}


// =============================
// Clear Cart
// =============================
function clearCart(){

    if(confirm("Clear Cart ?")){

        cart=[];

        localStorage.setItem("cart","[]");

        updateCartCount();

        alert("Cart Cleared");

    }

}


// =============================
// Checkout
// =============================
function checkout(){

    if(cart.length==0){

        alert("Cart is Empty");

        return;

    }

    window.location.href="checkout.html";

}


// =============================
// Dark Mode
// =============================
function darkMode(){

    document.body.classList.toggle("dark");

}


// =============================
// Show Welcome
// =============================
window.onload=function(){

    console.log("FreshMart Loaded");

    updateCartCount();

}


// =============================
// Today's Offer
// =============================
function offer(){

    alert("🎉 Congratulations!\nYou got 20% OFF on Fresh Vegetables.");

}


// =============================
// Newsletter
// =============================
function subscribe(){

    let email=prompt("Enter your Email");

    if(email!=null && email!=""){

        alert("Subscribed Successfully");

    }

}