import java.util.*;

public class c2 {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        ArrayList<String> cart = new ArrayList<>();

        while (true) {
            System.out.println("\n1.Add Product");
            System.out.println("2.Remove Product");
            System.out.println("3.View Cart");
            System.out.println("4.Place Order");
            System.out.println(x:"confirm order");
            System.out.println("5.Exit");
            System.out.println(x:"")

            System.out.print("Enter Choice: ");
            int choice = sc.nextInt();
            sc.nextLine();

            switch (choice) {
                case 1:
                    System.out.print("Enter Product Name: ");
                    cart.add(sc.nextLine());
                    System.out.println("Added Successfully");
                    break;

                case 2:
                    System.out.print("Enter Product Name: ");
                    cart.remove(sc.nextLine());
                    System.out.println("Removed Successfully");
                    break;

                case 3:
                    System.out.println("Cart Items: " + cart);
                    break;

                case 4:
                    if (cart.isEmpty()) {
                        System.out.println("Cart is Empty");
                    } else {
                        System.out.println("Order Placed Successfully");
                        System.out.println("Products: " + cart);
                        cart.clear();
                    }
                    break;

                case 5:
                    System.exit(0);

                default:
                    System.out.println("Invalid Choice");
            }
        }
    }
}