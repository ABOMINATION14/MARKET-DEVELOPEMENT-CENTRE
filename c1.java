import java.util.*;

public class c1{
    public static void main(String[] args) {
        ArrayList<String> products = new ArrayList<>();
        products.add("Tomato");
        products.add("Potato");
        products.add("Carrot");
        products.add("Onion");
        products.add("Brinjal");

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter product to search: ");
        String search = sc.nextLine();

        boolean found = false;

        for (String product : products) {
            if (product.equalsIgnoreCase(search)) {
                System.out.println("Product Found: " + product);
                found = true;
            }
        }

        if (!found) {
            System.out.println("Product Not Found");
        }
    }
}