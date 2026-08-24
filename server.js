// ============================================
// MARKET DEVELOPMENT CENTRE - Backend Server
// Real Node.js backend using only built-in modules
// No external dependencies required
// Run with: node server.js
// ============================================

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

// ============================================
// ENVIRONMENT LOADER (Zero-dependency .env reader)
// ============================================
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        try {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const eqIdx = trimmed.indexOf('=');
                    if (eqIdx !== -1) {
                        const key = trimmed.substring(0, eqIdx).trim();
                        const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
                        if (!process.env[key]) {
                            process.env[key] = val;
                        }
                    }
                }
            });
            console.log('✅ Loaded environment variables from .env');
        } catch (e) {
            console.warn('⚠️ Could not load .env:', e.message);
        }
    }
}
loadEnv();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// ============================================
// DATA STORAGE (JSON files in data/ folder)
// ============================================
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const OTP_FILE = path.join(DATA_DIR, 'otp.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ============================================
// Product Database (100+ fruits, veggies, dairy, groceries & drinks)
// Prices in INR (₹)
// ============================================
const PRODUCTS = [
  {
    "id": 1,
    "name": "Fresh Tomato",
    "price": 40,
    "category": "vegetable",
    "image": "images/tomato.svg",
    "desc": "Farm fresh red juicy tomatoes",
    "rating": 5,
    "unit": "kg",
    "stock": 150
  },
  {
    "id": 2,
    "name": "Farm Fresh Potato",
    "price": 30,
    "category": "vegetable",
    "image": "images/potato.svg",
    "desc": "Fresh harvested Agra potatoes",
    "rating": 5,
    "unit": "kg",
    "stock": 200
  },
  {
    "id": 3,
    "name": "Sweet Crunchy Carrot",
    "price": 60,
    "category": "vegetable",
    "image": "images/carrot.svg",
    "desc": "Tender orange Ooty carrots",
    "rating": 4,
    "unit": "kg",
    "stock": 120
  },
  {
    "id": 4,
    "name": "Fresh Red Onion",
    "price": 45,
    "category": "vegetable",
    "image": "images/onion.svg",
    "desc": "Crispy premium Nashik red onions",
    "rating": 5,
    "unit": "kg",
    "stock": 180
  },
  {
    "id": 5,
    "name": "Purple Brinjal",
    "price": 50,
    "category": "vegetable",
    "image": "images/brinjal.svg",
    "desc": "Fresh glossy purple brinjals",
    "rating": 4,
    "unit": "kg",
    "stock": 100
  },
  {
    "id": 6,
    "name": "Tender Ladies Finger (Okra)",
    "price": 55,
    "category": "vegetable",
    "image": "images/ladiesfinger.svg",
    "desc": "Farm fresh tender green bhindi",
    "rating": 4,
    "unit": "kg",
    "stock": 90
  },
  {
    "id": 7,
    "name": "Green Cabbage",
    "price": 35,
    "category": "vegetable",
    "image": "images/cabbage.svg",
    "desc": "Crisp leafy whole green cabbage",
    "rating": 4,
    "unit": "piece",
    "stock": 80
  },
  {
    "id": 8,
    "name": "White Cauliflower",
    "price": 45,
    "category": "vegetable",
    "image": "images/cauliflower.svg",
    "desc": "Fresh spotless white cauliflower",
    "rating": 4,
    "unit": "piece",
    "stock": 75
  },
  {
    "id": 9,
    "name": "Green Capsicum",
    "price": 70,
    "category": "vegetable",
    "image": "images/capsicum.svg",
    "desc": "Crunchy green bell peppers",
    "rating": 4,
    "unit": "kg",
    "stock": 85
  },
  {
    "id": 10,
    "name": "Red Bell Pepper",
    "price": 120,
    "category": "vegetable",
    "image": "images/capsicum_red.svg",
    "desc": "Sweet exotic red capsicum",
    "rating": 5,
    "unit": "kg",
    "stock": 50
  },
  {
    "id": 11,
    "name": "Yellow Bell Pepper",
    "price": 130,
    "category": "vegetable",
    "image": "images/capsicum_yellow.svg",
    "desc": "Sweet exotic yellow capsicum",
    "rating": 5,
    "unit": "kg",
    "stock": 50
  },
  {
    "id": 12,
    "name": "Fresh Palak (Spinach)",
    "price": 25,
    "category": "vegetable",
    "image": "images/spinach.svg",
    "desc": "Nutrient-dense fresh green spinach",
    "rating": 5,
    "unit": "bunch",
    "stock": 110
  },
  {
    "id": 13,
    "name": "Fresh Coriander Leaves",
    "price": 20,
    "category": "vegetable",
    "image": "images/coriander.svg",
    "desc": "Aromatic farm fresh dhaniya leaves",
    "rating": 5,
    "unit": "bunch",
    "stock": 130
  },
  {
    "id": 14,
    "name": "Fresh Mint (Pudina)",
    "price": 15,
    "category": "vegetable",
    "image": "images/mint.svg",
    "desc": "Cool refreshing organic mint leaves",
    "rating": 4,
    "unit": "bunch",
    "stock": 100
  },
  {
    "id": 15,
    "name": "Tender Green Beans",
    "price": 65,
    "category": "vegetable",
    "image": "images/beans.svg",
    "desc": "Handpicked crisp French beans",
    "rating": 4,
    "unit": "kg",
    "stock": 95
  },
  {
    "id": 16,
    "name": "Organic Orange Pumpkin",
    "price": 30,
    "category": "vegetable",
    "image": "images/pumpkin.svg",
    "desc": "Sweet hearty orange pumpkin",
    "rating": 4,
    "unit": "kg",
    "stock": 70
  },
  {
    "id": 17,
    "name": "White Radish (Mooli)",
    "price": 40,
    "category": "vegetable",
    "image": "images/radish.svg",
    "desc": "Crispy spicy white radish",
    "rating": 4,
    "unit": "kg",
    "stock": 85
  },
  {
    "id": 18,
    "name": "Sweet Beetroot",
    "price": 55,
    "category": "vegetable",
    "image": "images/beetroot.svg",
    "desc": "Fresh nutrient rich red beetroot",
    "rating": 4,
    "unit": "kg",
    "stock": 90
  },
  {
    "id": 19,
    "name": "Cool Cucumber",
    "price": 35,
    "category": "vegetable",
    "image": "images/cucumber.svg",
    "desc": "Refreshing hydration salad cucumber",
    "rating": 5,
    "unit": "kg",
    "stock": 120
  },
  {
    "id": 20,
    "name": "Spicy Green Chilli",
    "price": 30,
    "category": "vegetable",
    "image": "images/greenchilli.svg",
    "desc": "Fresh hot spicy green chillies",
    "rating": 5,
    "unit": "250g",
    "stock": 140
  },
  {
    "id": 21,
    "name": "Fresh Ginger (Adrak)",
    "price": 45,
    "category": "vegetable",
    "image": "images/ginger.svg",
    "desc": "Zesty aromatic fresh ginger root",
    "rating": 5,
    "unit": "250g",
    "stock": 100
  },
  {
    "id": 22,
    "name": "Desi Garlic (Lahsun)",
    "price": 60,
    "category": "vegetable",
    "image": "images/garlic.svg",
    "desc": "Strong flavoured organic garlic bulbs",
    "rating": 5,
    "unit": "250g",
    "stock": 100
  },
  {
    "id": 23,
    "name": "Bottle Gourd (Lauki)",
    "price": 40,
    "category": "vegetable",
    "image": "images/bottlegourd.svg",
    "desc": "Tender organic light green lauki",
    "rating": 4,
    "unit": "piece",
    "stock": 65
  },
  {
    "id": 24,
    "name": "Bitter Gourd (Karela)",
    "price": 50,
    "category": "vegetable",
    "image": "images/bittergourd.svg",
    "desc": "Fresh organic small green karela",
    "rating": 4,
    "unit": "kg",
    "stock": 60
  },
  {
    "id": 25,
    "name": "Fresh Green Peas (Matar)",
    "price": 80,
    "category": "vegetable",
    "image": "images/greenpeas.svg",
    "desc": "Sweet juicy farm fresh green peas",
    "rating": 5,
    "unit": "kg",
    "stock": 110
  },
  {
    "id": 26,
    "name": "Shimla Red Apple",
    "price": 180,
    "category": "fruit",
    "image": "images/apple.svg",
    "desc": "Crisp and sweet Himachal apples",
    "rating": 5,
    "unit": "kg",
    "stock": 120
  },
  {
    "id": 27,
    "name": "Royal Gala Apple",
    "price": 220,
    "category": "fruit",
    "image": "images/apple_gala.svg",
    "desc": "Premium imported crunchy sweet gala apples",
    "rating": 5,
    "unit": "kg",
    "stock": 90
  },
  {
    "id": 28,
    "name": "Robusta Banana",
    "price": 50,
    "category": "fruit",
    "image": "images/banana.svg",
    "desc": "Fresh potassium-rich robusta bananas",
    "rating": 5,
    "unit": "bunch",
    "stock": 160
  },
  {
    "id": 29,
    "name": "Yelakki Banana",
    "price": 70,
    "category": "fruit",
    "image": "images/banana_yelakki.svg",
    "desc": "Naturally sweet small Yelakki bananas",
    "rating": 5,
    "unit": "bunch",
    "stock": 130
  },
  {
    "id": 30,
    "name": "Alphonso Mango",
    "price": 160,
    "category": "fruit",
    "image": "images/mango.svg",
    "desc": "King of fruits - Ratnagiri Alphonso mangoes",
    "rating": 5,
    "unit": "kg",
    "stock": 140
  },
  {
    "id": 31,
    "name": "Nagpur Orange",
    "price": 80,
    "category": "fruit",
    "image": "images/orange.svg",
    "desc": "Juicy vitamin-C rich Nagpur sweet oranges",
    "rating": 5,
    "unit": "kg",
    "stock": 110
  },
  {
    "id": 32,
    "name": "Seedless Green Grapes",
    "price": 110,
    "category": "fruit",
    "image": "images/grapes.svg",
    "desc": "Sweet juicy Nashik green grapes",
    "rating": 4,
    "unit": "kg",
    "stock": 95
  },
  {
    "id": 33,
    "name": "Black Seedless Grapes",
    "price": 140,
    "category": "fruit",
    "image": "images/grapes_black.svg",
    "desc": "Sweet rich antioxidant black grapes",
    "rating": 5,
    "unit": "kg",
    "stock": 80
  },
  {
    "id": 34,
    "name": "Sweet Red Watermelon",
    "price": 35,
    "category": "fruit",
    "image": "images/watermelon.svg",
    "desc": "Crisp cooling hydrating sweet watermelon",
    "rating": 5,
    "unit": "kg",
    "stock": 100
  },
  {
    "id": 35,
    "name": "Ruby Red Pomegranate",
    "price": 180,
    "category": "fruit",
    "image": "images/pomegranate.svg",
    "desc": "Juicy ruby red pearls pomegranate",
    "rating": 5,
    "unit": "kg",
    "stock": 85
  },
  {
    "id": 36,
    "name": "Sweet Papaya",
    "price": 45,
    "category": "fruit",
    "image": "images/papaya.svg",
    "desc": "Ripe sweet digestive enzyme papaya",
    "rating": 4,
    "unit": "kg",
    "stock": 90
  },
  {
    "id": 37,
    "name": "Golden Pineapple",
    "price": 65,
    "category": "fruit",
    "image": "images/pineapple.svg",
    "desc": "Tropical sweet tangy ripe pineapple",
    "rating": 4,
    "unit": "piece",
    "stock": 70
  },
  {
    "id": 38,
    "name": "Fresh Strawberry Box",
    "price": 199,
    "category": "fruit",
    "image": "images/strawberry.svg",
    "desc": "Mahabaleshwar sweet fresh red strawberries",
    "rating": 5,
    "unit": "box",
    "stock": 80
  },
  {
    "id": 39,
    "name": "Fresh Green Guava",
    "price": 60,
    "category": "fruit",
    "image": "images/guava.svg",
    "desc": "Crispy sweet vitamin-rich Allahabad guava",
    "rating": 4,
    "unit": "kg",
    "stock": 95
  },
  {
    "id": 40,
    "name": "Sweet Green Pear",
    "price": 150,
    "category": "fruit",
    "image": "images/pears.svg",
    "desc": "Juicy crisp aromatic green pears",
    "rating": 4,
    "unit": "kg",
    "stock": 75
  },
  {
    "id": 41,
    "name": "Zespri Green Kiwi",
    "price": 99,
    "category": "fruit",
    "image": "images/kiwi.svg",
    "desc": "Imported fresh tangy green kiwi pack (3 pcs)",
    "rating": 5,
    "unit": "pack",
    "stock": 65
  },
  {
    "id": 42,
    "name": "Exotic Dragon Fruit",
    "price": 110,
    "category": "fruit",
    "image": "images/dragonfruit.svg",
    "desc": "Vibrant pink pitaya dragon fruit",
    "rating": 4,
    "unit": "piece",
    "stock": 60
  },
  {
    "id": 43,
    "name": "Sweet Muskmelon (Kharbuja)",
    "price": 50,
    "category": "fruit",
    "image": "images/muskmelon.svg",
    "desc": "Fragrant sweet orange pulp muskmelon",
    "rating": 4,
    "unit": "kg",
    "stock": 80
  },
  {
    "id": 44,
    "name": "Sweet Lime (Mosambi)",
    "price": 75,
    "category": "fruit",
    "image": "images/sweetlime.svg",
    "desc": "Juicy refreshingly sweet mosambi",
    "rating": 4,
    "unit": "kg",
    "stock": 90
  },
  {
    "id": 45,
    "name": "Custard Apple (Sitaphal)",
    "price": 120,
    "category": "fruit",
    "image": "images/custardapple.svg",
    "desc": "Creamy sweet seasonal custard apple",
    "rating": 5,
    "unit": "kg",
    "stock": 55
  },
  {
    "id": 46,
    "name": "Fresh Blueberries Box",
    "price": 249,
    "category": "fruit",
    "image": "images/blueberry.svg",
    "desc": "Imported antioxidant superfood blueberries",
    "rating": 5,
    "unit": "box",
    "stock": 45
  },
  {
    "id": 47,
    "name": "Hass Avocado",
    "price": 140,
    "category": "fruit",
    "image": "images/avocado.svg",
    "desc": "Creamy rich healthy fats Hass avocado",
    "rating": 5,
    "unit": "piece",
    "stock": 60
  },
  {
    "id": 48,
    "name": "Fresh Brown Coconut",
    "price": 40,
    "category": "fruit",
    "image": "images/coconut.svg",
    "desc": "Water-filled fresh dry coconut for cooking",
    "rating": 5,
    "unit": "piece",
    "stock": 120
  },
  {
    "id": 49,
    "name": "Kashmir Fresh Cherries",
    "price": 299,
    "category": "fruit",
    "image": "images/cherry.svg",
    "desc": "Sweet juicy red Kashmir cherries box",
    "rating": 5,
    "unit": "box",
    "stock": 40
  },
  {
    "id": 50,
    "name": "Sweet Sapota (Chiku)",
    "price": 70,
    "category": "fruit",
    "image": "images/chiku.svg",
    "desc": "Caramel sweet ripe brown chiku",
    "rating": 4,
    "unit": "kg",
    "stock": 85
  },
  {
    "id": 51,
    "name": "Pure Farm Fresh Milk 1L",
    "price": 62,
    "category": "dairy",
    "image": "images/milk.svg",
    "desc": "Pasteurized homogenized pure cow milk (1 Litre)",
    "rating": 5,
    "unit": "litre",
    "stock": 200
  },
  {
    "id": 52,
    "name": "Full Cream Buffalo Milk 1L",
    "price": 68,
    "category": "dairy",
    "image": "images/milk_fullcream.svg",
    "desc": "Rich 6% fat creamy fresh buffalo milk",
    "rating": 5,
    "unit": "litre",
    "stock": 150
  },
  {
    "id": 53,
    "name": "Creamy Fresh Curd 500g",
    "price": 38,
    "category": "dairy",
    "image": "images/curd.svg",
    "desc": "Thick probiotic creamy set curd pouch",
    "rating": 5,
    "unit": "pack",
    "stock": 180
  },
  {
    "id": 54,
    "name": "Pure Desi Cow Ghee 500ml",
    "price": 340,
    "category": "dairy",
    "image": "images/ghee.svg",
    "desc": "Traditional bilona method pure golden ghee",
    "rating": 5,
    "unit": "jar",
    "stock": 90
  },
  {
    "id": 55,
    "name": "Salted Table Butter 100g",
    "price": 56,
    "category": "dairy",
    "image": "images/butter.svg",
    "desc": "Creamy golden salted dairy butter",
    "rating": 5,
    "unit": "pack",
    "stock": 140
  },
  {
    "id": 56,
    "name": "Desi White Makhan 200g",
    "price": 95,
    "category": "dairy",
    "image": "images/butter_white.svg",
    "desc": "Unsalted fresh homemade style white butter",
    "rating": 5,
    "unit": "pack",
    "stock": 85
  },
  {
    "id": 57,
    "name": "Fresh Malai Paneer 200g",
    "price": 90,
    "category": "dairy",
    "image": "images/paneer.svg",
    "desc": "Soft melt-in-mouth fresh cottage cheese",
    "rating": 5,
    "unit": "pack",
    "stock": 160
  },
  {
    "id": 58,
    "name": "Processed Cheese Block 200g",
    "price": 145,
    "category": "dairy",
    "image": "images/cheese.svg",
    "desc": "Rich cheddar-style block cheese",
    "rating": 4,
    "unit": "pack",
    "stock": 100
  },
  {
    "id": 59,
    "name": "Mozzarella Pizza Cheese 200g",
    "price": 175,
    "category": "dairy",
    "image": "images/mozzarella.svg",
    "desc": "Perfect melt & stretch mozzarella cheese",
    "rating": 5,
    "unit": "pack",
    "stock": 90
  },
  {
    "id": 60,
    "name": "Strawberry Greek Yogurt",
    "price": 65,
    "category": "dairy",
    "image": "images/yogurt.svg",
    "desc": "High-protein thick berry flavored yogurt cup",
    "rating": 4,
    "unit": "cup",
    "stock": 80
  },
  {
    "id": 61,
    "name": "Spiced Buttermilk (Chaas) 500ml",
    "price": 20,
    "category": "dairy",
    "image": "images/chaas.svg",
    "desc": "Refreshing jeera-coriander salted chaas",
    "rating": 5,
    "unit": "bottle",
    "stock": 150
  },
  {
    "id": 62,
    "name": "Fresh Dairy Cream 250ml",
    "price": 75,
    "category": "dairy",
    "image": "images/cream.svg",
    "desc": "25% milk fat whipping and cooking cream",
    "rating": 4,
    "unit": "pack",
    "stock": 75
  },
  {
    "id": 63,
    "name": "Farm Fresh Brown Eggs (6 Pcs)",
    "price": 70,
    "category": "dairy",
    "image": "images/eggs_brown.svg",
    "desc": "Nutritious free-range brown farm eggs",
    "rating": 5,
    "unit": "box",
    "stock": 120
  },
  {
    "id": 64,
    "name": "Organic Farm Eggs (12 Pcs)",
    "price": 95,
    "category": "dairy",
    "image": "images/eggs_white.svg",
    "desc": "Clean protein-rich graded farm white eggs",
    "rating": 5,
    "unit": "box",
    "stock": 130
  },
  {
    "id": 65,
    "name": "Organic Soya Tofu 200g",
    "price": 70,
    "category": "dairy",
    "image": "images/tofu.svg",
    "desc": "High protein vegan soy curd paneer block",
    "rating": 4,
    "unit": "pack",
    "stock": 80
  },
  {
    "id": 66,
    "name": "Royal Basmati Rice 1kg",
    "price": 95,
    "category": "grocery",
    "image": "images/rice.svg",
    "desc": "Long grain aromatic aged basmati rice",
    "rating": 5,
    "unit": "kg",
    "stock": 200
  },
  {
    "id": 67,
    "name": "Sona Masoori Rice 1kg",
    "price": 65,
    "category": "grocery",
    "image": "images/rice_sona.svg",
    "desc": "Light fluffy everyday premium south rice",
    "rating": 4,
    "unit": "kg",
    "stock": 180
  },
  {
    "id": 68,
    "name": "Sharbati Whole Wheat Atta 1kg",
    "price": 55,
    "category": "grocery",
    "image": "images/wheat.svg",
    "desc": "100% MP Sharbati wheat stone ground chakki flour",
    "rating": 5,
    "unit": "kg",
    "stock": 250
  },
  {
    "id": 69,
    "name": "Unpolished Toor Dal 1kg",
    "price": 140,
    "category": "grocery",
    "image": "images/dal.svg",
    "desc": "High protein unpolished premium arhar dal",
    "rating": 5,
    "unit": "kg",
    "stock": 170
  },
  {
    "id": 70,
    "name": "Yellow Moong Dal 1kg",
    "price": 130,
    "category": "grocery",
    "image": "images/moongdal.svg",
    "desc": "Quick cooking easy digestive yellow lentils",
    "rating": 4,
    "unit": "kg",
    "stock": 140
  },
  {
    "id": 71,
    "name": "Bengal Gram Chana Dal 1kg",
    "price": 90,
    "category": "grocery",
    "image": "images/chanadal.svg",
    "desc": "Clean premium quality yellow split chana dal",
    "rating": 4,
    "unit": "kg",
    "stock": 130
  },
  {
    "id": 72,
    "name": "Whole Black Urad Dal 1kg",
    "price": 135,
    "category": "grocery",
    "image": "images/uraddal.svg",
    "desc": "Rich flavour black gram for dal makhani",
    "rating": 5,
    "unit": "kg",
    "stock": 110
  },
  {
    "id": 73,
    "name": "Kabuli Chana (Chickpeas) 1kg",
    "price": 125,
    "category": "grocery",
    "image": "images/chana_kabuli.svg",
    "desc": "Large grain chickpeas for Amritsari chole",
    "rating": 5,
    "unit": "kg",
    "stock": 120
  },
  {
    "id": 74,
    "name": "Red Kidney Beans (Rajma) 1kg",
    "price": 130,
    "category": "grocery",
    "image": "images/rajma.svg",
    "desc": "Jammu special royal red rajma beans",
    "rating": 5,
    "unit": "kg",
    "stock": 130
  },
  {
    "id": 75,
    "name": "Refined White Sugar 1kg",
    "price": 44,
    "category": "grocery",
    "image": "images/sugar.svg",
    "desc": "Sulphur-free sparkling white sugar crystals",
    "rating": 4,
    "unit": "kg",
    "stock": 200
  },
  {
    "id": 76,
    "name": "Organic Desi Jaggery (Gur) 1kg",
    "price": 65,
    "category": "grocery",
    "image": "images/jaggery.svg",
    "desc": "Chemical-free unrefined healthy pure jaggery block",
    "rating": 5,
    "unit": "kg",
    "stock": 110
  },
  {
    "id": 77,
    "name": "Kachi Ghani Mustard Oil 1L",
    "price": 160,
    "category": "grocery",
    "image": "images/mustardoil.svg",
    "desc": "Cold pressed pungent pure sarson oil",
    "rating": 5,
    "unit": "bottle",
    "stock": 140
  },
  {
    "id": 78,
    "name": "Cold Pressed Sunflower Oil 1L",
    "price": 175,
    "category": "grocery",
    "image": "images/sunfloweroil.svg",
    "desc": "Light heart-healthy cooking refined oil",
    "rating": 4,
    "unit": "bottle",
    "stock": 130
  },
  {
    "id": 79,
    "name": "Natural Rock Salt (Sendha) 1kg",
    "price": 28,
    "category": "grocery",
    "image": "images/salt.svg",
    "desc": "Mineral rich pure pink Himalayan rock salt",
    "rating": 5,
    "unit": "pack",
    "stock": 180
  },
  {
    "id": 80,
    "name": "Thick Poha (Rice Flakes) 500g",
    "price": 38,
    "category": "grocery",
    "image": "images/poha.svg",
    "desc": "Clean thick flattened rice for tasty breakfast",
    "rating": 4,
    "unit": "pack",
    "stock": 150
  },
  {
    "id": 81,
    "name": "California Almonds (Badam) 250g",
    "price": 220,
    "category": "grocery",
    "image": "images/almonds.svg",
    "desc": "Crunchy premium grade whole almond nuts",
    "rating": 5,
    "unit": "pack",
    "stock": 120
  },
  {
    "id": 82,
    "name": "W240 Jumbo Cashews (Kaju) 250g",
    "price": 260,
    "category": "grocery",
    "image": "images/cashews.svg",
    "desc": "Whole white creamy cashew nuts",
    "rating": 5,
    "unit": "pack",
    "stock": 110
  },
  {
    "id": 83,
    "name": "Roasted Salted Pistachios 200g",
    "price": 290,
    "category": "grocery",
    "image": "images/pista.svg",
    "desc": "Crisp crunchy roasted salted green pista",
    "rating": 5,
    "unit": "pack",
    "stock": 90
  },
  {
    "id": 84,
    "name": "Chilean Walnut Kernels 200g",
    "price": 280,
    "category": "grocery",
    "image": "images/walnuts.svg",
    "desc": "Omega-3 rich brain food walnut halves",
    "rating": 5,
    "unit": "pack",
    "stock": 85
  },
  {
    "id": 85,
    "name": "Golden Indian Raisins (Kismis) 250g",
    "price": 120,
    "category": "grocery",
    "image": "images/raisins.svg",
    "desc": "Sweet succulent long golden kismis",
    "rating": 4,
    "unit": "pack",
    "stock": 130
  },
  {
    "id": 86,
    "name": "Oman Royal Dates (Khajoor) 500g",
    "price": 190,
    "category": "grocery",
    "image": "images/dates.svg",
    "desc": "Soft rich sweet energy booster black dates",
    "rating": 5,
    "unit": "pack",
    "stock": 100
  },
  {
    "id": 87,
    "name": "Organic Raw Chia Seeds 150g",
    "price": 99,
    "category": "grocery",
    "image": "images/chiaseeds.svg",
    "desc": "Fiber and protein rich superfood seeds",
    "rating": 5,
    "unit": "pack",
    "stock": 75
  },
  {
    "id": 88,
    "name": "Raw Pumpkin Seeds 150g",
    "price": 110,
    "category": "grocery",
    "image": "images/pumpkinseeds.svg",
    "desc": "Zinc rich crunchy green pumpkin seeds",
    "rating": 4,
    "unit": "pack",
    "stock": 70
  },
  {
    "id": 89,
    "name": "Crispy Roasted Makhana 100g",
    "price": 115,
    "category": "grocery",
    "image": "images/makhana.svg",
    "desc": "Light calcium rich foxnuts snack",
    "rating": 5,
    "unit": "pack",
    "stock": 120
  },
  {
    "id": 90,
    "name": "Royal Mixed Dry Fruit Fusion 250g",
    "price": 275,
    "category": "grocery",
    "image": "images/mixednuts.svg",
    "desc": "Almonds, cashews, pista, walnuts, raisins mix",
    "rating": 5,
    "unit": "pack",
    "stock": 100
  },
  {
    "id": 91,
    "name": "Fresh Pressed Orange Juice 500ml",
    "price": 90,
    "category": "drinks",
    "image": "images/juice.svg",
    "desc": "100% pure squeezed citrus orange juice bottle",
    "rating": 5,
    "unit": "bottle",
    "stock": 140
  },
  {
    "id": 92,
    "name": "Cold Pressed Apple Juice 500ml",
    "price": 110,
    "category": "drinks",
    "image": "images/applejuice.svg",
    "desc": "Clear crisp Himachal sweet apple juice",
    "rating": 5,
    "unit": "bottle",
    "stock": 100
  },
  {
    "id": 93,
    "name": "Pure Tender Coconut Water 300ml",
    "price": 50,
    "category": "drinks",
    "image": "images/coconutwater.svg",
    "desc": "Natural electrolyte fresh coconut water",
    "rating": 5,
    "unit": "bottle",
    "stock": 180
  },
  {
    "id": 94,
    "name": "Fresh Sugarcane Juice with Ginger",
    "price": 40,
    "category": "drinks",
    "image": "images/sugarcane.svg",
    "desc": "Refreshing sweet ganna juice with lemon-mint",
    "rating": 5,
    "unit": "bottle",
    "stock": 120
  },
  {
    "id": 95,
    "name": "Traditional Aam Panna Cooler",
    "price": 50,
    "category": "drinks",
    "image": "images/aampanna.svg",
    "desc": "Sweet & tangy raw mango summer cooler",
    "rating": 4,
    "unit": "bottle",
    "stock": 95
  },
  {
    "id": 96,
    "name": "Artisanal Cold Brew Coffee 250ml",
    "price": 99,
    "category": "drinks",
    "image": "images/coldcoffee.svg",
    "desc": "18-hour brewed Arabica smooth black coffee",
    "rating": 5,
    "unit": "bottle",
    "stock": 85
  },
  {
    "id": 97,
    "name": "Fizzy Lemon Soda 500ml",
    "price": 35,
    "category": "drinks",
    "image": "images/drink.svg",
    "desc": "Sparkling fresh lime fizzy cooler",
    "rating": 4,
    "unit": "bottle",
    "stock": 150
  },
  {
    "id": 98,
    "name": "Thick Sweet Mango Lassi 300ml",
    "price": 45,
    "category": "drinks",
    "image": "images/mangolassi.svg",
    "desc": "Creamy Alphonso mango blended dahi lassi",
    "rating": 5,
    "unit": "bottle",
    "stock": 130
  },
  {
    "id": 99,
    "name": "Mixed Berry Antioxidant Smoothie",
    "price": 120,
    "category": "drinks",
    "image": "images/smoothie.svg",
    "desc": "Strawberries, blueberries, yogurt smoothie",
    "rating": 5,
    "unit": "bottle",
    "stock": 80
  },
  {
    "id": 100,
    "name": "Assam Organic Green Tea 100g",
    "price": 160,
    "category": "drinks",
    "image": "images/greentea.svg",
    "desc": "Detox pure whole leaf green tea tin",
    "rating": 5,
    "unit": "pack",
    "stock": 90
  }
];

// ============================================
// Helper Functions
// ============================================

// Read JSON file safely
function readJSON(file, fallback) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading ' + file + ': ' + e.message);
    }
    return fallback;
}

// Write JSON file safely
function writeJSON(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error('Error writing ' + file + ': ' + e.message);
        return false;
    }
}

// Initialize storage
function initDB() {
    if (!fs.existsSync(USERS_FILE)) writeJSON(USERS_FILE, []);
    if (!fs.existsSync(ORDERS_FILE)) writeJSON(ORDERS_FILE, []);
    if (!fs.existsSync(PRODUCTS_FILE)) writeJSON(PRODUCTS_FILE, PRODUCTS);
    if (!fs.existsSync(OTP_FILE)) writeJSON(OTP_FILE, {});
    console.log('✅ Database initialized');
}
initDB();

// Generate a token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Generate OTP (6-digit)
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Parse request body
function getBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', reject);
    });
}

// Send JSON response
function sendJSON(res, status, data) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Token'
    });
    res.end(JSON.stringify(data));
}

// Compute order total with delivery fee
function computeTotal(items) {
    let subtotal = 0;
    let totalItems = 0;
    items.forEach(item => {
        let price = Number(item.price) || 0;
        let qty = Number(item.qty) || 1;
        subtotal += price * qty;
        totalItems += qty;
    });
    let delivery = subtotal >= 500 ? 0 : 40; // Free delivery above ₹500
    return { subtotal, delivery, total: subtotal + delivery, totalItems };
}

// Get token from request
function getToken(req) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }
    return req.headers['x-token'] || null;
}

// Get current user by token
function getUserByToken(token) {
    if (!token) return null;
    let users = readJSON(USERS_FILE, []);
    return users.find(u => u.token === token) || null;
}

// Helper: HTTPS GET (e.g. for Google OAuth token verification)
function fetchHTTPS(urlStr) {
    return new Promise((resolve, reject) => {
        https.get(urlStr, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        }).on('error', reject);
    });
}

// Helper: HTTPS POST (e.g. for Razorpay order creation)
function postHTTPS(urlStr, bodyObj, headers = {}) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(urlStr);
        const postData = JSON.stringify(bodyObj);
        const options = {
            hostname: parsed.hostname,
            port: 443,
            path: parsed.pathname + parsed.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Normalize role: buyer, seller, delivery_partner
function normalizeRole(role) {
    if (role === 'seller') return 'seller';
    if (role === 'delivery_partner' || role === 'delivery') return 'delivery_partner';
    return 'buyer';
}

// ============================================
// CONFIG HANDLER
// ============================================
async function handleGetConfig(req, res) {
    sendJSON(res, 200, {
        success: true,
        googleClientId: GOOGLE_CLIENT_ID,
        razorpayKeyId: RAZORPAY_KEY_ID,
        hasGoogleAuth: !!GOOGLE_CLIENT_ID,
        hasRazorpay: !!RAZORPAY_KEY_ID
    });
}

// ============================================
// AUTH HANDLERS (3 Roles: Buyer, Seller, Delivery Partner)
// ============================================

// Register / Sign Up (Email/Phone + Password)
async function handleRegister(req, res, body) {
    const { name, email, phone, password, role } = body;
    if (!name || !email || !phone || !password) {
        return sendJSON(res, 400, { success: false, message: 'All fields are required' });
    }
    const cleanPhone = String(phone).trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
        return sendJSON(res, 400, { success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    let users = readJSON(USERS_FILE, []);
    if (users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
        return sendJSON(res, 400, { success: false, message: 'Email already registered. Please login.' });
    }
    if (users.find(u => u.phone === cleanPhone)) {
        return sendJSON(res, 400, { success: false, message: 'Mobile number already registered. Please login.' });
    }

    // Hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
    const userRole = normalizeRole(role);
    const token = generateToken();

    const user = {
        id: generateToken().slice(0, 16),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        role: userRole,
        authProvider: 'password',
        password: hash,
        salt: salt,
        token: token,
        createdAt: new Date().toISOString()
    };

    users.push(user);
    writeJSON(USERS_FILE, users);

    console.log(`👤 New user registered: ${user.name} (${user.phone}) as [${user.role}]`);

    sendJSON(res, 201, {
        success: true,
        message: 'Registration successful!',
        token,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
}

// Login / Sign In (Email or Mobile + Password)
async function handleLogin(req, res, body) {
    const { email, phone, identifier, password, role } = body;
    const loginId = (identifier || email || phone || '').trim();
    if (!password || !loginId) {
        return sendJSON(res, 400, { success: false, message: 'Please provide email/phone and password' });
    }

    const cleanPhone = loginId.replace(/\D/g, '');
    let users = readJSON(USERS_FILE, []);
    let user = users.find(u => 
        (u.email && u.email.toLowerCase() === loginId.toLowerCase()) || 
        (cleanPhone.length === 10 && u.phone === cleanPhone)
    );

    if (!user) {
        return sendJSON(res, 401, { success: false, message: 'Account not found. Please register first.' });
    }

    if (!user.password || !user.salt) {
        return sendJSON(res, 401, { success: false, message: 'This account was created via OTP or Google. Please sign in using OTP or Google.' });
    }

    const hash = crypto.createHash('sha256').update(password + user.salt).digest('hex');
    if (hash !== user.password) {
        return sendJSON(res, 401, { success: false, message: 'Incorrect password. Please try again.' });
    }

    if (role && ['buyer', 'seller', 'delivery_partner'].includes(role)) {
        user.role = role;
    }

    const token = generateToken();
    user.token = token;
    writeJSON(USERS_FILE, users);

    console.log(`🔓 User logged in: ${user.name} [${user.role}]`);

    sendJSON(res, 200, {
        success: true,
        message: 'Login successful!',
        token,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
}

// Send OTP for Direct Mobile Login
async function handleSendLoginOTP(req, res, body) {
    const { phone, role } = body;
    const cleanPhone = String(phone || '').trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
        return sendJSON(res, 400, { success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    const otp = generateOTP();
    const otpData = readJSON(OTP_FILE, {});
    otpData[cleanPhone] = {
        otp: otp,
        role: normalizeRole(role),
        expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    writeJSON(OTP_FILE, otpData);

    console.log(`📱 Direct Login OTP for ${cleanPhone} (${normalizeRole(role)}): [${otp}]`);

    sendJSON(res, 200, {
        success: true,
        message: 'OTP sent to mobile number ' + cleanPhone,
        otp: otp, // Returned for testing / demo
        expiresInSeconds: 600
    });
}

// Verify OTP for Direct Mobile Login (Passwordless Login / Auto-Registration)
async function handleVerifyLoginOTP(req, res, body) {
    const { phone, otp, role, name } = body;
    const cleanPhone = String(phone || '').trim().replace(/\D/g, '');
    const cleanOTP = String(otp || '').trim();

    if (cleanPhone.length !== 10 || !cleanOTP) {
        return sendJSON(res, 400, { success: false, message: 'Please provide mobile number and OTP' });
    }

    const otpData = readJSON(OTP_FILE, {});
    const record = otpData[cleanPhone];

    if (record) {
        if (Date.now() > record.expires) {
            delete otpData[cleanPhone];
            writeJSON(OTP_FILE, otpData);
        } else if (record.otp !== cleanOTP && cleanOTP !== '123456') {
            return sendJSON(res, 400, { success: false, message: 'Invalid OTP code. Please use demo code: 123456 or request a new OTP.' });
        }
        delete otpData[cleanPhone];
        writeJSON(OTP_FILE, otpData);
    } else if (cleanOTP !== '123456' && cleanOTP.length !== 6) {
        // If no active record, allow demo OTP 123456 or any 6-digit code for testing
        return sendJSON(res, 400, { success: false, message: 'Please enter OTP code (Demo code: 123456)' });
    }

    const selectedRole = normalizeRole(role || (record ? record.role : 'buyer'));

    let users = readJSON(USERS_FILE, []);
    let user = users.find(u => u.phone === cleanPhone);
    const token = generateToken();

    if (!user) {
        const fallbackName = name ? name.trim() : (selectedRole === 'delivery_partner' ? 'Delivery Partner' : (selectedRole === 'seller' ? 'Seller' : 'Customer'));
        user = {
            id: generateToken().slice(0, 16),
            name: fallbackName,
            email: cleanPhone + '@marketdc.in',
            phone: cleanPhone,
            role: selectedRole,
            authProvider: 'otp',
            token: token,
            createdAt: new Date().toISOString()
        };
        users.push(user);
    } else {
        user.token = token;
        if (role) {
            user.role = selectedRole;
        }
    }

    writeJSON(USERS_FILE, users);
    console.log(`📱 OTP login successful for ${user.name} (${user.phone}) as [${user.role}]`);

    sendJSON(res, 200, {
        success: true,
        message: 'Signed in successfully!',
        token: token,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
}

// Google Sign-In (Google Identity Services)
async function handleGoogleAuth(req, res, body) {
    const { credential, role } = body;
    if (!credential) {
        return sendJSON(res, 400, { success: false, message: 'Missing Google credential token' });
    }

    try {
        let googleUser = null;

        // Support mock/test credential for demo & development without external network calls
        if (credential.startsWith('mock_') || credential.startsWith('test_') || credential.startsWith('google-') || credential === 'google-demo-token') {
            const testEmail = body.email || 'google.user@example.com';
            const testName = body.name || 'Google Verified User';
            googleUser = {
                email: testEmail,
                name: testName,
                sub: 'mock_google_id_' + Date.now(),
                picture: body.picture || ''
            };
        } else {
            const googleRes = await fetchHTTPS(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
            
            if (googleRes.status !== 200 || !googleRes.data || !googleRes.data.email) {
                console.error('Google token verification failed:', googleRes.data);
                return sendJSON(res, 401, { success: false, message: 'Google token verification failed' });
            }
            googleUser = googleRes.data;
        }

        const email = googleUser.email.toLowerCase();
        const name = googleUser.name || googleUser.given_name || 'Google User';
        const picture = googleUser.picture || '';
        const userRole = normalizeRole(role);

        let users = readJSON(USERS_FILE, []);
        let user = users.find(u => u.email && u.email.toLowerCase() === email);
        const token = generateToken();

        if (!user) {
            user = {
                id: generateToken().slice(0, 16),
                name: name,
                email: email,
                phone: '',
                role: userRole,
                authProvider: 'google',
                googleId: googleUser.sub,
                avatar: picture,
                token: token,
                createdAt: new Date().toISOString()
            };
            users.push(user);
        } else {
            user.token = token;
            user.avatar = picture || user.avatar;
            if (role) {
                user.role = userRole;
            }
        }

        writeJSON(USERS_FILE, users);
        console.log(`🌐 Google sign-in successful: ${user.name} (${user.email}) as [${user.role}]`);

        sendJSON(res, 200, {
            success: true,
            message: 'Signed in with Google!',
            token: token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar }
        });
    } catch (err) {
        console.error('Google Auth Error:', err.message);
        sendJSON(res, 500, { success: false, message: 'Error verifying Google authentication: ' + err.message });
    }
}

// Forgot Password - send OTP
async function handleForgot(req, res, body) {
    const { phone, email, identifier } = body;
    const query = (identifier || phone || email || '').trim();
    if (!query) {
        return sendJSON(res, 400, { success: false, message: 'Please enter your mobile number or email' });
    }

    const cleanPhone = query.replace(/\D/g, '');
    let users = readJSON(USERS_FILE, []);
    let user = users.find(u => 
        (cleanPhone.length === 10 && u.phone === cleanPhone) ||
        (u.email && u.email.toLowerCase() === query.toLowerCase())
    );

    if (!user) {
        return sendJSON(res, 404, { success: false, message: 'No registered account found with these details' });
    }

    const targetKey = user.phone || user.email;
    const otp = generateOTP();
    const otpData = readJSON(OTP_FILE, {});
    otpData[targetKey] = {
        otp: otp,
        expires: Date.now() + 10 * 60 * 1000,
        token: generateToken()
    };
    writeJSON(OTP_FILE, otpData);

    console.log(`🔐 Password Reset OTP for ${targetKey}: [${otp}]`);

    sendJSON(res, 200, {
        success: true,
        message: 'Password reset OTP sent to ' + targetKey,
        otp: otp, // Demo only
        target: targetKey
    });
}

// Verify OTP and reset password
async function handleVerifyOTP(req, res, body) {
    const { phone, email, identifier, otp, newPassword } = body;
    const query = (identifier || phone || email || '').trim();
    const cleanPhone = query.replace(/\D/g, '');
    const cleanOTP = String(otp || '').trim();

    if (!query || !cleanOTP) {
        return sendJSON(res, 400, { success: false, message: 'Please provide mobile/email and OTP' });
    }

    let users = readJSON(USERS_FILE, []);
    let user = users.find(u => 
        (cleanPhone.length === 10 && u.phone === cleanPhone) ||
        (u.email && u.email.toLowerCase() === query.toLowerCase())
    );

    if (!user) {
        return sendJSON(res, 404, { success: false, message: 'Account not found' });
    }

    const targetKey = user.phone || user.email;
    const otpData = readJSON(OTP_FILE, {});
    const record = otpData[targetKey] || (user.phone ? otpData[user.phone] : null) || (user.email ? otpData[user.email] : null);

    if (!record) {
        return sendJSON(res, 400, { success: false, message: 'No OTP requested. Please request a new OTP.' });
    }
    if (Date.now() > record.expires) {
        return sendJSON(res, 400, { success: false, message: 'OTP has expired. Please request a new OTP.' });
    }
    if (record.otp !== cleanOTP && cleanOTP !== '123456') {
        return sendJSON(res, 400, { success: false, message: 'Incorrect OTP. Please try again.' });
    }

    if (newPassword) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.createHash('sha256').update(newPassword + salt).digest('hex');
        user.password = hash;
        user.salt = salt;
        writeJSON(USERS_FILE, users);
    }

    delete otpData[targetKey];
    if (user.phone) delete otpData[user.phone];
    if (user.email) delete otpData[user.email];
    writeJSON(OTP_FILE, otpData);

    console.log(`🔐 Password reset successful for user: ${user.name}`);
    sendJSON(res, 200, { success: true, message: 'Password reset successful! You can now sign in.' });
}

// Current User Profile
async function handleGetMe(req, res) {
    const token = getToken(req);
    const user = getUserByToken(token);
    if (!user) {
        return sendJSON(res, 401, { success: false, message: 'Not authenticated' });
    }
    sendJSON(res, 200, {
        success: true,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar }
    });
}

// Logout / Sign Out
async function handleLogout(req, res) {
    const token = getToken(req);
    if (token) {
        let users = readJSON(USERS_FILE, []);
        let user = users.find(u => u.token === token);
        if (user) {
            delete user.token;
            writeJSON(USERS_FILE, users);
        }
    }
    sendJSON(res, 200, { success: true, message: 'Logged out successfully' });
}

// ============================================
// PRODUCT HANDLERS
// ============================================
async function handleGetProducts(req, res) {
    let products = readJSON(PRODUCTS_FILE, PRODUCTS);
    let category = req.urlParams.get('category');
    let search = req.urlParams.get('search');

    if (category && category !== 'all') {
        products = products.filter(p => p.category === category);
    }
    if (search) {
        const s = search.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(s) || (p.desc && p.desc.toLowerCase().includes(s)));
    }
    sendJSON(res, 200, { success: true, count: products.length, products });
}

// Add Product (For Sellers)
async function handleAddProduct(req, res, body) {
    const token = getToken(req);
    const user = getUserByToken(token);
    
    const { name, price, category, unit, desc, image } = body;
    if (!name || !price || !category) {
        return sendJSON(res, 400, { success: false, message: 'Please provide product name, price, and category' });
    }

    let products = readJSON(PRODUCTS_FILE, PRODUCTS);
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: name.trim(),
        price: Number(price),
        category: category.toLowerCase(),
        image: image || 'images/vegetables.svg',
        desc: desc || 'Fresh market produce',
        rating: 5,
        unit: unit || 'kg',
        time: '10 mins',
        seller: user ? user.name : 'Verified Seller'
    };

    products.push(newProduct);
    writeJSON(PRODUCTS_FILE, products);

    sendJSON(res, 201, { success: true, message: 'Product listed successfully!', product: newProduct });
}

// ============================================
// PAYMENT HANDLERS (Razorpay Gateway Integration)
// ============================================
async function handleCreatePaymentOrder(req, res, body) {
    const { amount, currency } = body;
    const orderAmount = Number(amount) || 0;
    if (orderAmount <= 0) {
        return sendJSON(res, 400, { success: false, message: 'Invalid order amount' });
    }

    const amountInPaise = Math.round(orderAmount * 100);
    const receipt = 'rcpt_' + Math.floor(100000 + Math.random() * 900000);

    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
        try {
            const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
            const rzpRes = await postHTTPS(
                'https://api.razorpay.com/v1/orders',
                {
                    amount: amountInPaise,
                    currency: currency || 'INR',
                    receipt: receipt,
                    payment_capture: 1
                },
                { 'Authorization': authHeader }
            );

            if (rzpRes.status === 200 || rzpRes.status === 201) {
                return sendJSON(res, 200, {
                    success: true,
                    orderId: rzpRes.data.id,
                    amount: rzpRes.data.amount,
                    currency: rzpRes.data.currency,
                    keyId: RAZORPAY_KEY_ID
                });
            } else {
                console.warn('Razorpay API error, falling back to simulated order:', rzpRes.data);
            }
        } catch (e) {
            console.warn('Razorpay connect error, using simulated order:', e.message);
        }
    }

    // Sandbox / Test fallback order
    const simOrderId = 'order_test_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    sendJSON(res, 200, {
        success: true,
        orderId: simOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        mode: 'test_sandbox'
    });
}

async function handleVerifyPayment(req, res, body) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    if (!razorpay_order_id || !razorpay_payment_id) {
        return sendJSON(res, 400, { success: false, message: 'Missing payment confirmation parameters' });
    }

    if (RAZORPAY_KEY_SECRET && razorpay_signature) {
        const expectedSig = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSig !== razorpay_signature) {
            return sendJSON(res, 400, { success: false, message: 'Invalid payment signature. Verification failed.' });
        }
    }

    sendJSON(res, 200, {
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
        message: 'Payment verified successfully!'
    });
}

// ============================================
// ORDER HANDLERS
// ============================================
async function handlePlaceOrder(req, res, body) {
    const token = getToken(req);
    const user = getUserByToken(token);

    const { items, address, payment, phone, name, email, location } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return sendJSON(res, 400, { success: false, message: 'Cart is empty' });
    }
    if (!address) {
        return sendJSON(res, 400, { success: false, message: 'Delivery address is required' });
    }
    if (!payment) {
        return sendJSON(res, 400, { success: false, message: 'Payment method is required' });
    }

    const totals = computeTotal(items);
    const orderId = 'MDC-' + Math.floor(1000 + Math.random() * 9000);
    const orderTime = new Date().toISOString();

    const order = {
        id: orderId,
        userEmail: user ? user.email : (email || 'guest@marketdc.in'),
        userName: user ? user.name : (name || 'Customer'),
        phone: phone || (user ? user.phone : ''),
        items: items,
        address: address,
        location: location || null,
        payment: payment,
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        total: totals.total,
        totalItems: totals.totalItems,
        status: 'Placed', // Placed -> Packed -> Out for Delivery -> Delivered
        statusHistory: [
            { status: 'Placed', time: orderTime, note: 'Order placed and confirmed' }
        ],
        estimatedDeliveryTime: '10-15 mins',
        createdAt: orderTime,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    let orders = readJSON(ORDERS_FILE, []);
    orders.unshift(order);
    writeJSON(ORDERS_FILE, orders);

    console.log(`📦 New Order placed: ${order.id} | Total: ₹${order.total} | User: ${order.userName}`);

    sendJSON(res, 201, { success: true, message: 'Order placed successfully!', order: order });
}

async function handleGetOrders(req, res) {
    const token = getToken(req);
    const user = getUserByToken(token);
    let orders = readJSON(ORDERS_FILE, []);

    // Delivery partner and Seller see all orders
    if (user && (user.role === 'delivery_partner' || user.role === 'seller')) {
        return sendJSON(res, 200, { success: true, count: orders.length, orders: orders, role: user.role });
    }

    // Buyer sees own orders
    if (user && user.email) {
        orders = orders.filter(o => o.userEmail === user.email || (user.phone && o.phone === user.phone));
    }

    sendJSON(res, 200, { success: true, count: orders.length, orders: orders });
}

// Update Order Status (For Delivery Partner & Seller)
async function handleUpdateOrderStatus(req, res, body) {
    const token = getToken(req);
    const user = getUserByToken(token);
    const { orderId, status, note } = body;

    const validStatuses = ['Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!orderId || !status || !validStatuses.includes(status)) {
        return sendJSON(res, 400, { success: false, message: 'Valid orderId and status required (' + validStatuses.join(', ') + ')' });
    }

    let orders = readJSON(ORDERS_FILE, []);
    let order = orders.find(o => o.id === orderId);
    if (!order) {
        return sendJSON(res, 404, { success: false, message: 'Order not found' });
    }

    order.status = status;
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
        status: status,
        time: new Date().toISOString(),
        updatedBy: user ? `${user.name} (${user.role})` : 'System',
        note: note || `Status updated to ${status}`
    });

    writeJSON(ORDERS_FILE, orders);
    console.log(`🚚 Order ${orderId} status updated to: ${status}`);

    sendJSON(res, 200, { success: true, message: `Order ${orderId} updated to ${status}`, order: order });
}

// ============================================
// LOCATION HANDLER (reverse geocode)
// ============================================
async function handleReverseGeocode(req, res) {
    const lat = parseFloat(req.urlParams.get('lat'));
    const lng = parseFloat(req.urlParams.get('lng'));

    if (isNaN(lat) || isNaN(lng)) {
        return sendJSON(res, 400, { success: false, message: 'Invalid coordinates' });
    }

    const landmarks = ['Near Main Market', 'Near City Park', 'Near Metro Station', 'Near Bus Stand', 'Near City Center'];
    const randomLandmark = landmarks[Math.abs(Math.floor(lat * 100 + lng * 100)) % landmarks.length];
    const coords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const address = `${randomLandmark}, Sector ${Math.floor(Math.abs(lat) % 20) + 1} (${coords})`;

    sendJSON(res, 200, {
        success: true,
        address,
        latitude: lat,
        longitude: lng
    });
}

// ============================================
// STATIC FILE SERVING
// ============================================
const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

function serveStatic(req, res, pathname) {
    let safePath = pathname.replace(/\.\./g, '');
    let filePath = path.join(__dirname, safePath);
    if (safePath === '/' || safePath === '') {
        filePath = path.join(__dirname, 'index.html');
    }

    // Security: prevent path traversal
    if (!filePath.startsWith(__dirname)) {
        sendJSON(res, 403, { success: false, message: 'Forbidden' });
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            sendJSON(res, 404, { success: false, message: 'File not found' });
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });
        res.end(data);
    });
}

// ============================================
// ROUTER
// ============================================
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;
    req.urlParams = url.searchParams;

    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Token'
        });
        res.end();
        return;
    }

    try {
        // ===== CONFIG =====
        if (pathname === '/api/config' && req.method === 'GET') {
            return await handleGetConfig(req, res);
        }

        // ===== AUTH ROUTES =====
        if (pathname === '/api/auth/register' && req.method === 'POST') {
            return await handleRegister(req, res, await getBody(req));
        }
        if (pathname === '/api/auth/login' && req.method === 'POST') {
            return await handleLogin(req, res, await getBody(req));
        }
        if (pathname === '/api/auth/send-login-otp' && req.method === 'POST') {
            return await handleSendLoginOTP(req, res, await getBody(req));
        }
        if (pathname === '/api/auth/verify-login-otp' && req.method === 'POST') {
            return await handleVerifyLoginOTP(req, res, await getBody(req));
        }
        if (pathname === '/api/auth/google' && req.method === 'POST') {
            return await handleGoogleAuth(req, res, await getBody(req));
        }
        if (pathname === '/api/auth/forgot' && req.method === 'POST') {
            return await handleForgot(req, res, await getBody(req));
        }
        if (pathname === '/api/auth/verify-otp' && req.method === 'POST') {
            return await handleVerifyOTP(req, res, await getBody(req));
        }
        if (pathname === '/api/auth/me' && req.method === 'GET') {
            return await handleGetMe(req, res);
        }
        if (pathname === '/api/auth/logout' && req.method === 'POST') {
            return await handleLogout(req, res);
        }

        // ===== PRODUCTS =====
        if (pathname === '/api/products' && req.method === 'GET') {
            return await handleGetProducts(req, res);
        }
        if (pathname === '/api/products' && req.method === 'POST') {
            return await handleAddProduct(req, res, await getBody(req));
        }

        // ===== PAYMENTS =====
        if (pathname === '/api/payment/create-order' && req.method === 'POST') {
            return await handleCreatePaymentOrder(req, res, await getBody(req));
        }
        if (pathname === '/api/payment/verify' && req.method === 'POST') {
            return await handleVerifyPayment(req, res, await getBody(req));
        }

        // ===== ORDERS =====
        if (pathname === '/api/orders' && req.method === 'POST') {
            return await handlePlaceOrder(req, res, await getBody(req));
        }
        if (pathname === '/api/orders' && req.method === 'GET') {
            return await handleGetOrders(req, res);
        }
        const orderStatusMatch = pathname.match(/^\/api\/orders\/([^\/]+)\/status$/);
        if (orderStatusMatch && (req.method === 'POST' || req.method === 'PUT')) {
            const body = await getBody(req);
            body.orderId = body.orderId || orderStatusMatch[1];
            return await handleUpdateOrderStatus(req, res, body);
        }
        if ((pathname === '/api/orders/update-status' || pathname === '/api/orders/status') && (req.method === 'POST' || req.method === 'PUT')) {
            return await handleUpdateOrderStatus(req, res, await getBody(req));
        }

        // ===== LOCATION =====
        if (pathname === '/api/location/reverse' && req.method === 'GET') {
            return await handleReverseGeocode(req, res);
        }

        // ===== 404 FOR API =====
        if (pathname.startsWith('/api/')) {
            return sendJSON(res, 404, { success: false, message: 'API endpoint not found' });
        }

        return serveStatic(req, res, pathname);
    } catch (err) {
        console.error('Server error:', err);
        return sendJSON(res, 500, { success: false, message: 'Internal Server Error: ' + err.message });
    }
});

// ============================================
// START SERVER
// ============================================
let currentPort = parseInt(process.env.PORT, 10) || 8080;
const HOST = '127.0.0.1';

function startServer(port) {
    currentPort = port;
    server.listen(port, HOST, () => {
        console.log('============================================');
        console.log('  MARKET DEVELOPMENT CENTRE - Backend');
        console.log('============================================');
        console.log(`  🌐 Server running at: http://${HOST}:${port}`);
        console.log(`  📦 Products: ${PRODUCTS.length} items`);
        console.log(`  🔑 Google OAuth: ${GOOGLE_CLIENT_ID ? 'Configured' : 'Ready for .env key'}`);
        console.log(`  💳 Razorpay: ${RAZORPAY_KEY_ID ? 'Configured' : 'Test Mode'}`);
        console.log('============================================');
    });
}

server.on('error', (err) => {
    if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
        const nextPort = currentPort === 8080 ? 3000 : (currentPort === 3000 ? 5000 : currentPort + 1);
        console.warn(`⚠️ Port ${currentPort} unavailable (${err.code}). Retrying on port ${nextPort}...`);
        setTimeout(() => {
            startServer(nextPort);
        }, 300);
    } else {
        console.error('Server fatal error:', err);
    }
});

startServer(currentPort);

