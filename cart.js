// FreshMart Cart JavaScript


// Get cart data from local storage

let cart = JSON.parse(localStorage.getItem("cart")) || [];




// Display Cart Items

function displayCart() {


    let cartItems = document.getElementById("cartItems");


    let totalPrice = 0;

    let totalItems = 0;



    cartItems.innerHTML = "";



    if(cart.length === 0) {


        cartItems.innerHTML = `

        <div class="empty-cart">

            <h2>Your cart is empty 🛒</h2>

            <p>Add some fresh products!</p>

        </div>

        `;


        updateSummary(0,0);

        return;

    }




    cart.forEach((item,index)=>{


        totalPrice += item.price * item.quantity;

        totalItems += item.quantity;



        cartItems.innerHTML += `


        <div class="cart-item">


            <h3>${item.name}</h3>


            <p>
                Price: $${item.price}
            </p>


            <div class="quantity">


                <button onclick="decreaseQuantity(${index})">
                    -
                </button>


                <span>
                    ${item.quantity}
                </span>


                <button onclick="increaseQuantity(${index})">
                    +
                </button>


            </div>


            <p>
                Sub Total:
                $${(item.price * item.quantity).toFixed(2)}
            </p>



            <button class="remove-btn"
            onclick="removeItem(${index})">

                Remove

            </button>



        </div>


        `;


    });



    updateSummary(totalItems,totalPrice);


}





// Update Cart Summary

function updateSummary(items,price){


    document.getElementById("totalItems")
    .innerText = items;


    document.getElementById("totalPrice")
    .innerText = price.toFixed(2);


}






// Increase Quantity

function increaseQuantity(index){


    cart[index].quantity++;


    saveCart();


}






// Decrease Quantity

function decreaseQuantity(index){


    if(cart[index].quantity > 1){

        cart[index].quantity--;

    }

    else{

        cart.splice(index,1);

    }


    saveCart();

}







// Remove Product

function removeItem(index){


    cart.splice(index,1);


    saveCart();


}






// Save Cart Data

function saveCart(){


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    displayCart();

}






// Checkout Button

function checkout(){


    if(cart.length === 0){


        alert(
            "Your cart is empty!"
        );


        return;

    }



    window.location.href =
    "checkout.html";


}






// Load Cart When Page Opens

window.onload = displayCart;