import java.util.*;

/**
 * MARKET DEVELOPMENT CENTRE
 * SearchProduce.java
 * A program to search for produce/products
 */
public class SearchProduce {

    public static void main(String[] args) {

        // List of available products
        ArrayList<String> products = new ArrayList<>();
        products.add("Tomato");
        products.add("Potato");
        products.add("Carrot");
        products.add("Onion");
        products.add("Brinjal");
        products.add("Ladies Finger");
        products.add("Apple");
        products.add("Banana");
        products.add("Milk");
        products.add("Rice");

        System.out.println("====================================");
        System.out.println("  MARKET DEVELOPMENT CENTRE        ");
        System.out.println("  Product Search System             ");
        System.out.println("====================================");
        System.out.println("\nAvailable Products:");
        for (String p : products) {
            System.out.println("   - " + p);
        }

        Scanner sc = new Scanner(System.in);

        while (true) {
            System.out.print("\nEnter product to search (or type 'exit' to quit): ");
            String search = sc.nextLine();

            // Exit condition
            if (search.equalsIgnoreCase("exit")) {
                System.out.println("Goodbye! 👋");
                sc.close();
                System.exit(0);
            }

            boolean found = false;
            boolean exactMatch = false;
            ArrayList<String> similar = new ArrayList<>();

            for (String product : products) {
                // Exact match (case-insensitive)
                if (product.equalsIgnoreCase(search)) {
                    System.out.println("✅ Product Found: " + product);
                    found = true;
                    exactMatch = true;
                }
                // Partial match for suggestions
                else if (product.toLowerCase().contains(search.toLowerCase())) {
                    similar.add(product);
                    found = true;
                }
            }

            if (!found) {
                System.out.println("❌ Product Not Found.");
                System.out.println("   Tip: Check the spelling or try a different product.");
            }
            else if (!exactMatch && !similar.isEmpty()) {
                System.out.println("🔍 No exact match. Did you mean one of these?");
                for (String s : similar) {
                    System.out.println("   - " + s);
                }
            }
        }
    }
}
