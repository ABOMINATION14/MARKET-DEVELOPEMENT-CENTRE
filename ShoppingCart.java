import java.util.*;

/**
 * MARKET DEVELOPMENT CENTRE
 * ShoppingCart.java
 * A simple shopping cart program for buying products
 */
public class ShoppingCart {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        ArrayList<String> cart = new ArrayList<>();
        ArrayList<Double> prices = new ArrayList<>();

        System.out.println("====================================");
        System.out.println("  MARKET DEVELOPMENT CENTRE        ");
        System.out.println("  Shopping Cart System              ");
        System.out.println("====================================");

        while (true) {
            System.out.println("\n---------- MENU ----------");
            System.out.println("1. Add Product");
            System.out.println("2. Remove Product");
            System.out.println("3. View Cart");
            System.out.println("4. Place Order / Confirm");
            System.out.println("5. Exit");
            System.out.println("--------------------------");

            System.out.print("Enter Choice: ");
            int choice = sc.nextInt();
            sc.nextLine();

            switch (choice) {
                case 1:
                    // Add product
                    System.out.print("Enter Product Name: ");
                    String product = sc.nextLine();

System.out.print("Enter Price (₹): ");
                    try {
                        double price = sc.nextDouble();
                        sc.nextLine();
                        cart.add(product);
                        prices.add(price);
                        System.out.println("✅ " + product + " added successfully! (₹" + price + ")");
                    } catch (InputMismatchException e) {
                        System.out.println("❌ Invalid price. Please enter a number.");
                        sc.nextLine();
                    }
                    break;

                case 2:
                    // Remove product
                    System.out.print("Enter Product Name to Remove: ");
                    String removeItem = sc.nextLine();

                    if (cart.remove(removeItem)) {
                        System.out.println("✅ " + removeItem + " removed successfully!");
                    } else {
                        System.out.println("❌ Product not found in cart.");
                    }
                    break;

                case 3:
                    // View cart
                    if (cart.isEmpty()) {
                        System.out.println("🛒 Cart is empty.");
                    } else {
                        System.out.println("\n🛒 Your Cart Items:");
                        double total = 0;
for (int i = 0; i < cart.size(); i++) {
                            System.out.println("   " + (i + 1) + ". " + cart.get(i) + " - ₹" + 
                                (i < prices.size() ? prices.get(i) : 0));
                            if (i < prices.size()) {
                                total += prices.get(i);
                            }
                        }
                        System.out.println("   -------------------");
System.out.println("   TOTAL: ₹" + total);
                    }
                    break;

                case 4:
                    // Place order
                    if (cart.isEmpty()) {
                        System.out.println("❌ Cart is Empty. Please add products first.");
                    } else {
                        System.out.println("\n✅ ORDER CONFIRMED!");
                        System.out.println("Products: " + cart);

                        double total = 0;
                        for (Double p : prices) {
                            total += p;
                        }
System.out.println("Total Amount: ₹" + total);
                        System.out.println("Thank you for shopping with Market Development Centre!");

                        cart.clear();
                        prices.clear();
                    }
                    break;

                case 5:
                    System.out.println("\nThank you for using Market Development Centre. Goodbye! 👋");
                    sc.close();
                    System.exit(0);

                default:
                    System.out.println("❌ Invalid Choice. Please try again.");
            }
        }
    }
}
