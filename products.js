// FreshMart Products JavaScript


// Add product to cart

function addToCart(name, price) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];


    let product = {

        name: name,
        price: price,
        quantity: 1

    };


    cart.push(product);


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    alert(name + " added to cart 🛒");

}




// Search Products

function searchProducts() {


    let searchValue = document
        .getElementById("searchBox")
        .value
        .toLowerCase();



    let products = document
        .getElementsByClassName("product-card");



    for(let i = 0; i < products.length; i++) {


        let productName = products[i]
            .getElementsByTagName("h3")[0]
            .innerText
            .toLowerCase();



        if(productName.includes(searchValue)) {

            products[i].style.display = "block";

        }

        else {

            products[i].style.display = "none";

        }

    }

}





// Filter Products by Category

function filterCategory() {


    let selectedCategory =
        document.getElementById("category").value;



    let products =
        document.getElementsByClassName("product-card");



    for(let i = 0; i < products.length; i++) {


        let category =
            products[i].getAttribute("data-category");



        if(selectedCategory === "all" ||
           category === selectedCategory) {


            products[i].style.display = "block";

        }

        else {


            products[i].style.display = "none";

        }

    }

}





// Load Products from Backend API

async function loadProducts() {


    try {


        let response = await fetch(
            "http://localhost:8080/api/products"
        );


        let products =
            await response.json();



        let container =
            document.getElementById("productList");



        container.innerHTML = "";



        products.forEach(product => {


            container.innerHTML += `

            <div class="product-card"
            data-category="${product.category}">


                <img src="${product.image}"
                alt="${product.name}">


                <h3>${product.name}</h3>


                <p class="price">
                $${product.price}
                </p>


                <p>
                ${product.description}
                </p>


                <button onclick="
                addToCart('${product.name}',
                ${product.price})">

                Add To Cart

                </button>


            </div>

            `;


        });


    }

    catch(error) {


        console.log(
            "Backend not connected. Showing default products."
        );


    }

}



// Run when page opens

// Uncomment this after Spring Boot backend is ready

// window.onload = loadProducts;