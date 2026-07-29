let products=["Tomato","Potato","Carrot","Onion","Brinjal"];

let cart=[];

function searchProduct(){

let p=document.getElementById("product").value;

if(products.includes(p))
document.getElementById("output").innerHTML="Product Found";
else
document.getElementById("output").innerHTML="Product Not Found";

}

function addProduct(){

let p=document.getElementById("product").value;

cart.push(p);

document.getElementById("output").innerHTML="Added Successfully";

}

function viewCart(){

document.getElementById("output").innerHTML=cart.join("<br>");

}

function placeOrder(){

if(cart.length==0)
document.getElementById("output").innerHTML="Cart Empty";

else{

document.getElementById("output").innerHTML="Order Placed Successfully";

cart=[];

}

}