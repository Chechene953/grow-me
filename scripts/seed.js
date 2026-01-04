// Script to seed Firebase with initial plant data
// Run with: node scripts/seed.js
// This is a JavaScript version that works without ts-node

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration - requires .env file with EXPO_PUBLIC_FIREBASE_* variables
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error('Error: Firebase configuration not found. Make sure .env file exists with EXPO_PUBLIC_FIREBASE_* variables.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ACCESSORIES = [
  {
    id: 'acc1',
    name: 'Plant Food',
    description: 'Organic fertilizer for indoor plants',
    price: 8.99,
  },
  {
    id: 'acc2',
    name: 'Spray Bottle',
    description: 'Misting bottle for plant care',
    price: 5.99,
  },
  {
    id: 'acc3',
    name: 'Plant Stand',
    description: 'Decorative wooden stand',
    price: 24.99,
  },
  {
    id: 'acc4',
    name: 'Watering Can',
    description: 'Small indoor watering can',
    price: 12.99,
  },
];

const BASE_URL = 'https://growme-9e45f.web.app/images/plants';
const AR_MODEL_URL = 'https://growme-9e45f.web.app/models/Peaceful_Elegance_1105145247_texture.usdz';

const PLANTS = [
  {
    name: 'Monstera Deliciosa',
    category: 'Easy Care',
    description: 'A stunning tropical plant with large, glossy, heart-shaped leaves that develop natural holes as they mature. Perfect for beginners and adds a dramatic touch to any room. This plant is known for its air-purifying qualities and can grow quite large with proper care.',
    basePrice: 29.99,
    images: [
      `${BASE_URL}/monstera-deliciosa/white-ceramic/1.jpg`,
      `${BASE_URL}/monstera-deliciosa/white-ceramic/2.jpg`,
    ],
    sizes: ['Small', 'Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 5, images: [`${BASE_URL}/monstera-deliciosa/white-ceramic/1.jpg`, `${BASE_URL}/monstera-deliciosa/white-ceramic/2.jpg`, `${BASE_URL}/monstera-deliciosa/white-ceramic/3.jpg`, `${BASE_URL}/monstera-deliciosa/white-ceramic/4.jpg`] },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0, images: [`${BASE_URL}/monstera-deliciosa/terracotta/1.jpg`, `${BASE_URL}/monstera-deliciosa/terracotta/2.jpg`, `${BASE_URL}/monstera-deliciosa/terracotta/3.jpg`, `${BASE_URL}/monstera-deliciosa/terracotta/4.jpg`] },
      { name: 'Black Ceramic', material: 'Ceramic', hexCode: '#2C2C2C', priceModifier: 8, images: [`${BASE_URL}/monstera-deliciosa/black-ceramic/1.jpg`, `${BASE_URL}/monstera-deliciosa/black-ceramic/2.jpg`, `${BASE_URL}/monstera-deliciosa/black-ceramic/3.jpg`, `${BASE_URL}/monstera-deliciosa/black-ceramic/4.jpg`] },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 5, images: [`${BASE_URL}/monstera-deliciosa/gray-ceramic/1.jpg`, `${BASE_URL}/monstera-deliciosa/gray-ceramic/2.jpg`, `${BASE_URL}/monstera-deliciosa/gray-ceramic/3.jpg`, `${BASE_URL}/monstera-deliciosa/gray-ceramic/4.jpg`] },
    ],
    lightPreference: 'Medium',
    careLevel: 'Easy',
    airPurifying: true,
    featured: true,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Snake Plant',
    category: 'Low Light',
    description: 'A hardy, low-maintenance plant that thrives in low light conditions. Perfect for bedrooms and offices. This plant is nearly indestructible and can survive weeks without water. It\'s excellent for air purification, especially at night.',
    basePrice: 19.99,
    images: [
      `${BASE_URL}/snake-plant/white-ceramic/1.jpg`,
      `${BASE_URL}/snake-plant/white-ceramic/2.jpg`,
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 5, images: [`${BASE_URL}/snake-plant/white-ceramic/1.jpg`, `${BASE_URL}/snake-plant/white-ceramic/2.jpg`, `${BASE_URL}/snake-plant/white-ceramic/3.jpg`, `${BASE_URL}/snake-plant/white-ceramic/4.jpg`] },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0, images: [`${BASE_URL}/snake-plant/terracotta/1.jpg`, `${BASE_URL}/snake-plant/terracotta/2.jpg`, `${BASE_URL}/snake-plant/terracotta/3.jpg`, `${BASE_URL}/snake-plant/terracotta/4.jpg`] },
      { name: 'Black Ceramic', material: 'Ceramic', hexCode: '#2C2C2C', priceModifier: 8, images: [`${BASE_URL}/snake-plant/black-ceramic/1.jpg`, `${BASE_URL}/snake-plant/black-ceramic/2.jpg`, `${BASE_URL}/snake-plant/black-ceramic/3.jpg`, `${BASE_URL}/snake-plant/black-ceramic/4.jpg`] },
    ],
    lightPreference: 'Low',
    careLevel: 'Easy',
    airPurifying: true,
    featured: true,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Fiddle Leaf Fig',
    category: 'Large Plants',
    description: 'A stunning tree-like plant with large, violin-shaped leaves. This statement plant can grow up to 6 feet tall indoors. It requires bright, indirect light and consistent watering. Perfect for filling empty corners and adding height to your space.',
    basePrice: 49.99,
    images: [
      `${BASE_URL}/fiddle-leaf-fig/white-ceramic/1.jpg`,
      `${BASE_URL}/fiddle-leaf-fig/white-ceramic/2.jpg`,
    ],
    sizes: ['Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 10, images: [`${BASE_URL}/fiddle-leaf-fig/white-ceramic/1.jpg`, `${BASE_URL}/fiddle-leaf-fig/white-ceramic/2.jpg`, `${BASE_URL}/fiddle-leaf-fig/white-ceramic/3.jpg`, `${BASE_URL}/fiddle-leaf-fig/white-ceramic/4.jpg`] },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 5, images: [`${BASE_URL}/fiddle-leaf-fig/terracotta/1.jpg`, `${BASE_URL}/fiddle-leaf-fig/terracotta/2.jpg`, `${BASE_URL}/fiddle-leaf-fig/terracotta/3.jpg`, `${BASE_URL}/fiddle-leaf-fig/terracotta/4.jpg`] },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 8, images: [`${BASE_URL}/fiddle-leaf-fig/gray-ceramic/1.jpg`, `${BASE_URL}/fiddle-leaf-fig/gray-ceramic/2.jpg`, `${BASE_URL}/fiddle-leaf-fig/gray-ceramic/3.jpg`, `${BASE_URL}/fiddle-leaf-fig/gray-ceramic/4.jpg`] },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: true,
    featured: true,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Pothos Golden',
    category: 'Air Purifying',
    description: 'A trailing vine with heart-shaped leaves that are variegated with golden yellow. Extremely easy to care for and perfect for hanging baskets or shelves. This plant is known for its air-purifying capabilities and can grow in various light conditions.',
    basePrice: 14.99,
    images: [`${BASE_URL}/pothos-golden/white-ceramic/1.jpg`, `${BASE_URL}/pothos-golden/white-ceramic/2.jpg`],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3, images: [`${BASE_URL}/pothos-golden/white-ceramic/1.jpg`, `${BASE_URL}/pothos-golden/white-ceramic/2.jpg`, `${BASE_URL}/pothos-golden/white-ceramic/3.jpg`, `${BASE_URL}/pothos-golden/white-ceramic/4.jpg`] },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0, images: [`${BASE_URL}/pothos-golden/terracotta/1.jpg`, `${BASE_URL}/pothos-golden/terracotta/2.jpg`, `${BASE_URL}/pothos-golden/terracotta/3.jpg`, `${BASE_URL}/pothos-golden/terracotta/4.jpg`] },
      { name: 'Hanging Basket', material: 'Plastic', hexCode: '#8B4513', priceModifier: 2, images: [`${BASE_URL}/pothos-golden/hanging-basket/1.jpg`, `${BASE_URL}/pothos-golden/hanging-basket/2.jpg`, `${BASE_URL}/pothos-golden/hanging-basket/3.jpg`, `${BASE_URL}/pothos-golden/hanging-basket/4.jpg`] },
    ],
    lightPreference: 'Low',
    careLevel: 'Easy',
    airPurifying: true,
    featured: true,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'ZZ Plant',
    category: 'Low Light',
    description: 'A nearly indestructible plant with glossy, dark green leaves that thrive in low light and can survive weeks without water. Perfect for beginners or those who travel frequently. The ZZ plant is also known for its air-purifying qualities.',
    basePrice: 24.99,
    images: [`${BASE_URL}/zz-plant/white-ceramic/1.jpg`, `${BASE_URL}/zz-plant/white-ceramic/2.jpg`],
    sizes: ['Small', 'Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 5, images: [`${BASE_URL}/zz-plant/white-ceramic/1.jpg`, `${BASE_URL}/zz-plant/white-ceramic/2.jpg`, `${BASE_URL}/zz-plant/white-ceramic/3.jpg`, `${BASE_URL}/zz-plant/white-ceramic/4.jpg`] },
      { name: 'Black Ceramic', material: 'Ceramic', hexCode: '#2C2C2C', priceModifier: 8, images: [`${BASE_URL}/zz-plant/black-ceramic/1.jpg`, `${BASE_URL}/zz-plant/black-ceramic/2.jpg`, `${BASE_URL}/zz-plant/black-ceramic/3.jpg`, `${BASE_URL}/zz-plant/black-ceramic/4.jpg`] },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 5, images: [`${BASE_URL}/zz-plant/gray-ceramic/1.jpg`, `${BASE_URL}/zz-plant/gray-ceramic/2.jpg`, `${BASE_URL}/zz-plant/gray-ceramic/3.jpg`, `${BASE_URL}/zz-plant/gray-ceramic/4.jpg`] },
    ],
    lightPreference: 'Low',
    careLevel: 'Easy',
    airPurifying: true,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Peace Lily',
    category: 'Air Purifying',
    description: 'Beautiful plant with dark green leaves and elegant white flowers. Excellent air purifier that removes toxins from the air. Prefers medium to low light and consistent moisture. Perfect for bathrooms and bedrooms.',
    basePrice: 22.99,
    images: [`${BASE_URL}/peace-lily/white-ceramic/1.jpg`, `${BASE_URL}/peace-lily/white-ceramic/2.jpg`],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 5, images: [`${BASE_URL}/peace-lily/white-ceramic/1.jpg`, `${BASE_URL}/peace-lily/white-ceramic/2.jpg`, `${BASE_URL}/peace-lily/white-ceramic/3.jpg`, `${BASE_URL}/peace-lily/white-ceramic/4.jpg`] },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0, images: [`${BASE_URL}/peace-lily/terracotta/1.jpg`, `${BASE_URL}/peace-lily/terracotta/2.jpg`, `${BASE_URL}/peace-lily/terracotta/3.jpg`, `${BASE_URL}/peace-lily/terracotta/4.jpg`] },
    ],
    lightPreference: 'Medium',
    careLevel: 'Easy',
    airPurifying: true,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Aloe Vera',
    category: 'Succulents',
    description: 'A healing succulent with thick, fleshy leaves that contain a gel used for skin care. Requires minimal care and bright, indirect light. Perfect for sunny windowsills. The gel inside can be used to soothe burns and skin irritations.',
    basePrice: 12.99,
    images: [`${BASE_URL}/aloe-vera/terracotta/1.jpg`, `${BASE_URL}/aloe-vera/terracotta/2.jpg`],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0, images: [`${BASE_URL}/aloe-vera/terracotta/1.jpg`, `${BASE_URL}/aloe-vera/terracotta/2.jpg`, `${BASE_URL}/aloe-vera/terracotta/3.jpg`, `${BASE_URL}/aloe-vera/terracotta/4.jpg`] },
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3, images: [`${BASE_URL}/aloe-vera/white-ceramic/1.jpg`, `${BASE_URL}/aloe-vera/white-ceramic/2.jpg`, `${BASE_URL}/aloe-vera/white-ceramic/3.jpg`, `${BASE_URL}/aloe-vera/white-ceramic/4.jpg`] },
    ],
    lightPreference: 'Bright',
    careLevel: 'Easy',
    airPurifying: false,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Spider Plant',
    category: 'Air Purifying',
    description: 'Produces baby plants (spiderettes) that dangle from the mother plant. Excellent for air purification and very easy to care for. Perfect for hanging baskets or high shelves. The plantlets can be propagated to create new plants.',
    basePrice: 16.99,
    images: [`${BASE_URL}/spider-plant/white-ceramic/1.jpg`, `${BASE_URL}/spider-plant/white-ceramic/2.jpg`],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3, images: [`${BASE_URL}/spider-plant/white-ceramic/1.jpg`, `${BASE_URL}/spider-plant/white-ceramic/2.jpg`, `${BASE_URL}/spider-plant/white-ceramic/3.jpg`, `${BASE_URL}/spider-plant/white-ceramic/4.jpg`] },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0, images: [`${BASE_URL}/spider-plant/terracotta/1.jpg`, `${BASE_URL}/spider-plant/terracotta/2.jpg`, `${BASE_URL}/spider-plant/terracotta/3.jpg`, `${BASE_URL}/spider-plant/terracotta/4.jpg`] },
      { name: 'Hanging Basket', material: 'Plastic', hexCode: '#8B4513', priceModifier: 2, images: [`${BASE_URL}/spider-plant/hanging-basket/1.jpg`, `${BASE_URL}/spider-plant/hanging-basket/2.jpg`, `${BASE_URL}/spider-plant/hanging-basket/3.jpg`, `${BASE_URL}/spider-plant/hanging-basket/4.jpg`] },
    ],
    lightPreference: 'Medium',
    careLevel: 'Easy',
    airPurifying: true,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Rubber Plant',
    category: 'Large Plants',
    description: 'A bold, architectural plant with large, glossy leaves. Can grow quite tall and makes a stunning statement piece. Prefers bright, indirect light and consistent watering. The leaves are thick and rubbery, giving it its name.',
    basePrice: 34.99,
    images: [`${BASE_URL}/rubber-plant/white-ceramic/1.jpg`, `${BASE_URL}/rubber-plant/white-ceramic/2.jpg`],
    sizes: ['Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 8, images: [`${BASE_URL}/rubber-plant/white-ceramic/1.jpg`, `${BASE_URL}/rubber-plant/white-ceramic/2.jpg`, `${BASE_URL}/rubber-plant/white-ceramic/3.jpg`, `${BASE_URL}/rubber-plant/white-ceramic/4.jpg`] },
      { name: 'Black Ceramic', material: 'Ceramic', hexCode: '#2C2C2C', priceModifier: 10, images: [`${BASE_URL}/rubber-plant/black-ceramic/1.jpg`, `${BASE_URL}/rubber-plant/black-ceramic/2.jpg`, `${BASE_URL}/rubber-plant/black-ceramic/3.jpg`, `${BASE_URL}/rubber-plant/black-ceramic/4.jpg`] },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 8, images: [`${BASE_URL}/rubber-plant/gray-ceramic/1.jpg`, `${BASE_URL}/rubber-plant/gray-ceramic/2.jpg`, `${BASE_URL}/rubber-plant/gray-ceramic/3.jpg`, `${BASE_URL}/rubber-plant/gray-ceramic/4.jpg`] },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: true,
    featured: true,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Philodendron Heartleaf',
    category: 'Easy Care',
    description: 'A trailing plant with heart-shaped leaves that cascade beautifully. Extremely easy to care for and perfect for hanging baskets or training on a trellis. This plant is very forgiving and can tolerate various light conditions.',
    basePrice: 18.99,
    images: [`${BASE_URL}/philodendron-heartleaf/white-ceramic/1.jpg`, `${BASE_URL}/philodendron-heartleaf/white-ceramic/2.jpg`],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3, images: [`${BASE_URL}/philodendron-heartleaf/white-ceramic/1.jpg`, `${BASE_URL}/philodendron-heartleaf/white-ceramic/2.jpg`, `${BASE_URL}/philodendron-heartleaf/white-ceramic/3.jpg`, `${BASE_URL}/philodendron-heartleaf/white-ceramic/4.jpg`] },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0, images: [`${BASE_URL}/philodendron-heartleaf/terracotta/1.jpg`, `${BASE_URL}/philodendron-heartleaf/terracotta/2.jpg`, `${BASE_URL}/philodendron-heartleaf/terracotta/3.jpg`, `${BASE_URL}/philodendron-heartleaf/terracotta/4.jpg`] },
      { name: 'Hanging Basket', material: 'Plastic', hexCode: '#8B4513', priceModifier: 2, images: [`${BASE_URL}/philodendron-heartleaf/hanging-basket/1.jpg`, `${BASE_URL}/philodendron-heartleaf/hanging-basket/2.jpg`, `${BASE_URL}/philodendron-heartleaf/hanging-basket/3.jpg`, `${BASE_URL}/philodendron-heartleaf/hanging-basket/4.jpg`] },
    ],
    lightPreference: 'Medium',
    careLevel: 'Easy',
    airPurifying: true,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'String of Pearls',
    category: 'Succulents',
    description: 'A unique trailing succulent with small, bead-like leaves that cascade like a waterfall. Perfect for hanging planters and high shelves. Requires bright light and infrequent watering. Very striking when displayed properly.',
    basePrice: 21.99,
    images: [`${BASE_URL}/string-of-pearls/terracotta/1.jpg`, `${BASE_URL}/string-of-pearls/terracotta/2.jpg`],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0, images: [`${BASE_URL}/string-of-pearls/terracotta/1.jpg`, `${BASE_URL}/string-of-pearls/terracotta/2.jpg`, `${BASE_URL}/string-of-pearls/terracotta/3.jpg`, `${BASE_URL}/string-of-pearls/terracotta/4.jpg`] },
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3, images: [`${BASE_URL}/string-of-pearls/white-ceramic/1.jpg`, `${BASE_URL}/string-of-pearls/white-ceramic/2.jpg`, `${BASE_URL}/string-of-pearls/white-ceramic/3.jpg`, `${BASE_URL}/string-of-pearls/white-ceramic/4.jpg`] },
      { name: 'Hanging Basket', material: 'Plastic', hexCode: '#8B4513', priceModifier: 2, images: [`${BASE_URL}/string-of-pearls/hanging-basket/1.jpg`, `${BASE_URL}/string-of-pearls/hanging-basket/2.jpg`, `${BASE_URL}/string-of-pearls/hanging-basket/3.jpg`, `${BASE_URL}/string-of-pearls/hanging-basket/4.jpg`] },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: false,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Bird of Paradise',
    category: 'Large Plants',
    description: 'A dramatic, tropical plant with large, banana-like leaves. Can grow very tall and makes an impressive statement. Requires bright light and consistent watering. The plant gets its name from its bird-like flowers.',
    basePrice: 59.99,
    images: [`${BASE_URL}/bird-of-paradise/white-ceramic/1.jpg`, `${BASE_URL}/bird-of-paradise/white-ceramic/2.jpg`],
    sizes: ['Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 12, images: [`${BASE_URL}/bird-of-paradise/white-ceramic/1.jpg`, `${BASE_URL}/bird-of-paradise/white-ceramic/2.jpg`, `${BASE_URL}/bird-of-paradise/white-ceramic/3.jpg`, `${BASE_URL}/bird-of-paradise/white-ceramic/4.jpg`] },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 10, images: [`${BASE_URL}/bird-of-paradise/gray-ceramic/1.jpg`, `${BASE_URL}/bird-of-paradise/gray-ceramic/2.jpg`, `${BASE_URL}/bird-of-paradise/gray-ceramic/3.jpg`, `${BASE_URL}/bird-of-paradise/gray-ceramic/4.jpg`] },
      { name: 'Black Ceramic', material: 'Ceramic', hexCode: '#2C2C2C', priceModifier: 15, images: [`${BASE_URL}/bird-of-paradise/black-ceramic/1.jpg`, `${BASE_URL}/bird-of-paradise/black-ceramic/2.jpg`, `${BASE_URL}/bird-of-paradise/black-ceramic/3.jpg`, `${BASE_URL}/bird-of-paradise/black-ceramic/4.jpg`] },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: true,
    featured: true,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Chinese Money Plant',
    category: 'Small Plants',
    description: 'A charming plant with round, coin-like leaves on long stems. Also known as Pilea peperomioides. Easy to care for and produces many baby plants. Perfect for small spaces and makes a great gift.',
    basePrice: 19.99,
    images: [`${BASE_URL}/chinese-money-plant/white-ceramic/1.jpg`, `${BASE_URL}/chinese-money-plant/white-ceramic/2.jpg`],
    sizes: ['Small'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 4, images: [`${BASE_URL}/chinese-money-plant/white-ceramic/1.jpg`, `${BASE_URL}/chinese-money-plant/white-ceramic/2.jpg`, `${BASE_URL}/chinese-money-plant/white-ceramic/3.jpg`, `${BASE_URL}/chinese-money-plant/white-ceramic/4.jpg`] },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0, images: [`${BASE_URL}/chinese-money-plant/terracotta/1.jpg`, `${BASE_URL}/chinese-money-plant/terracotta/2.jpg`, `${BASE_URL}/chinese-money-plant/terracotta/3.jpg`, `${BASE_URL}/chinese-money-plant/terracotta/4.jpg`] },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 4, images: [`${BASE_URL}/chinese-money-plant/gray-ceramic/1.jpg`, `${BASE_URL}/chinese-money-plant/gray-ceramic/2.jpg`, `${BASE_URL}/chinese-money-plant/gray-ceramic/3.jpg`, `${BASE_URL}/chinese-money-plant/gray-ceramic/4.jpg`] },
    ],
    lightPreference: 'Medium',
    careLevel: 'Easy',
    airPurifying: true,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Calathea Medallion',
    category: 'Small Plants',
    description: 'A stunning plant with beautifully patterned leaves that fold up at night. Known for its vibrant colors and patterns. Requires high humidity and indirect light. Perfect for adding color and interest to your space.',
    basePrice: 26.99,
    images: [`${BASE_URL}/calathea-medallion/white-ceramic/1.jpg`, `${BASE_URL}/calathea-medallion/white-ceramic/2.jpg`],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 6, images: [`${BASE_URL}/calathea-medallion/white-ceramic/1.jpg`, `${BASE_URL}/calathea-medallion/white-ceramic/2.jpg`, `${BASE_URL}/calathea-medallion/white-ceramic/3.jpg`, `${BASE_URL}/calathea-medallion/white-ceramic/4.jpg`] },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 6, images: [`${BASE_URL}/calathea-medallion/gray-ceramic/1.jpg`, `${BASE_URL}/calathea-medallion/gray-ceramic/2.jpg`, `${BASE_URL}/calathea-medallion/gray-ceramic/3.jpg`, `${BASE_URL}/calathea-medallion/gray-ceramic/4.jpg`] },
    ],
    lightPreference: 'Medium',
    careLevel: 'Medium',
    airPurifying: true,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Echeveria',
    category: 'Succulents',
    description: 'A beautiful rosette-forming succulent with colorful, fleshy leaves. Perfect for sunny windowsills and requires minimal care. Comes in various colors and makes a lovely addition to any succulent collection.',
    basePrice: 9.99,
    images: [`${BASE_URL}/echeveria/terracotta/1.jpg`, `${BASE_URL}/echeveria/terracotta/2.jpg`],
    sizes: ['Small'],
    colors: [
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0, images: [`${BASE_URL}/echeveria/terracotta/1.jpg`, `${BASE_URL}/echeveria/terracotta/2.jpg`, `${BASE_URL}/echeveria/terracotta/3.jpg`, `${BASE_URL}/echeveria/terracotta/4.jpg`] },
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 2, images: [`${BASE_URL}/echeveria/white-ceramic/1.jpg`, `${BASE_URL}/echeveria/white-ceramic/2.jpg`, `${BASE_URL}/echeveria/white-ceramic/3.jpg`, `${BASE_URL}/echeveria/white-ceramic/4.jpg`] },
    ],
    lightPreference: 'Bright',
    careLevel: 'Easy',
    airPurifying: false,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Jade Plant',
    category: 'Succulents',
    description: 'A classic succulent with thick, jade-green leaves. Known as a symbol of good luck and prosperity. Very easy to care for and can live for many years. Perfect for beginners and those who want a low-maintenance plant.',
    basePrice: 15.99,
    images: [`${BASE_URL}/jade-plant/terracotta/1.jpg`, `${BASE_URL}/jade-plant/terracotta/2.jpg`],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0, images: [`${BASE_URL}/jade-plant/terracotta/1.jpg`, `${BASE_URL}/jade-plant/terracotta/2.jpg`, `${BASE_URL}/jade-plant/terracotta/3.jpg`, `${BASE_URL}/jade-plant/terracotta/4.jpg`] },
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3, images: [`${BASE_URL}/jade-plant/white-ceramic/1.jpg`, `${BASE_URL}/jade-plant/white-ceramic/2.jpg`, `${BASE_URL}/jade-plant/white-ceramic/3.jpg`, `${BASE_URL}/jade-plant/white-ceramic/4.jpg`] },
    ],
    lightPreference: 'Bright',
    careLevel: 'Easy',
    airPurifying: false,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Boston Fern',
    category: 'Air Purifying',
    description: 'A lush, feathery fern that thrives in high humidity. Excellent for bathrooms and kitchens. Known for its air-purifying qualities and elegant, arching fronds. Requires consistent moisture and indirect light.',
    basePrice: 18.99,
    images: [`${BASE_URL}/boston-fern/white-ceramic/1.jpg`, `${BASE_URL}/boston-fern/white-ceramic/2.jpg`],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 4, images: [`${BASE_URL}/boston-fern/white-ceramic/1.jpg`, `${BASE_URL}/boston-fern/white-ceramic/2.jpg`, `${BASE_URL}/boston-fern/white-ceramic/3.jpg`, `${BASE_URL}/boston-fern/white-ceramic/4.jpg`] },
      { name: 'Hanging Basket', material: 'Plastic', hexCode: '#8B4513', priceModifier: 2, images: [`${BASE_URL}/boston-fern/hanging-basket/1.jpg`, `${BASE_URL}/boston-fern/hanging-basket/2.jpg`, `${BASE_URL}/boston-fern/hanging-basket/3.jpg`, `${BASE_URL}/boston-fern/hanging-basket/4.jpg`] },
    ],
    lightPreference: 'Medium',
    careLevel: 'Medium',
    airPurifying: true,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Anthurium',
    category: 'Flowering',
    description: 'A tropical plant with glossy, heart-shaped leaves and striking red, pink, or white flowers. Blooms year-round with proper care. Requires bright, indirect light and high humidity. Perfect for adding a pop of color.',
    basePrice: 32.99,
    images: [`${BASE_URL}/anthurium/white-ceramic/1.jpg`, `${BASE_URL}/anthurium/white-ceramic/2.jpg`],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 6, images: [`${BASE_URL}/anthurium/white-ceramic/1.jpg`, `${BASE_URL}/anthurium/white-ceramic/2.jpg`, `${BASE_URL}/anthurium/white-ceramic/3.jpg`, `${BASE_URL}/anthurium/white-ceramic/4.jpg`] },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 6, images: [`${BASE_URL}/anthurium/gray-ceramic/1.jpg`, `${BASE_URL}/anthurium/gray-ceramic/2.jpg`, `${BASE_URL}/anthurium/gray-ceramic/3.jpg`, `${BASE_URL}/anthurium/gray-ceramic/4.jpg`] },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: true,
    featured: true,
    modelUsdzUrl: AR_MODEL_URL,
  },
  {
    name: 'Bamboo Palm',
    category: 'Air Purifying',
    description: 'A tall, elegant palm that adds a tropical feel to any space. Excellent air purifier that removes toxins from the air. Requires bright, indirect light and consistent watering. Can grow quite tall indoors.',
    basePrice: 39.99,
    images: [`${BASE_URL}/bamboo-palm/white-ceramic/1.jpg`, `${BASE_URL}/bamboo-palm/white-ceramic/2.jpg`],
    sizes: ['Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 10, images: [`${BASE_URL}/bamboo-palm/white-ceramic/1.jpg`, `${BASE_URL}/bamboo-palm/white-ceramic/2.jpg`, `${BASE_URL}/bamboo-palm/white-ceramic/3.jpg`, `${BASE_URL}/bamboo-palm/white-ceramic/4.jpg`] },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 10, images: [`${BASE_URL}/bamboo-palm/gray-ceramic/1.jpg`, `${BASE_URL}/bamboo-palm/gray-ceramic/2.jpg`, `${BASE_URL}/bamboo-palm/gray-ceramic/3.jpg`, `${BASE_URL}/bamboo-palm/gray-ceramic/4.jpg`] },
      { name: 'Black Ceramic', material: 'Ceramic', hexCode: '#2C2C2C', priceModifier: 12, images: [`${BASE_URL}/bamboo-palm/black-ceramic/1.jpg`, `${BASE_URL}/bamboo-palm/black-ceramic/2.jpg`, `${BASE_URL}/bamboo-palm/black-ceramic/3.jpg`, `${BASE_URL}/bamboo-palm/black-ceramic/4.jpg`] },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: true,
    featured: false,
    modelUsdzUrl: AR_MODEL_URL,
  },
];

async function clearCollection(collectionName) {
  console.log(`Clearing existing ${collectionName}...`);
  const collRef = collection(db, collectionName);
  const snapshot = await getDocs(collRef);
  let count = 0;
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
    count++;
  }
  console.log(`Deleted ${count} existing ${collectionName}`);
  return count;
}

async function seedPlants() {
  try {
    await clearCollection('plants');
    console.log('Starting to seed plants...');
    const plantsRef = collection(db, 'plants');

    let count = 0;
    for (const plant of PLANTS) {
      await addDoc(plantsRef, {
        ...plant,
        createdAt: Timestamp.now(),
      });
      count++;
      console.log(`Added plant ${count}/${PLANTS.length}: ${plant.name}`);
    }

    console.log(`Successfully added ${count} plants`);
    return count;
  } catch (error) {
    console.error('Error seeding plants:', error);
    throw error;
  }
}

async function seedAccessories() {
  try {
    await clearCollection('accessories');
    console.log('Starting to seed accessories...');
    const accessoriesRef = collection(db, 'accessories');

    let count = 0;
    for (const accessory of ACCESSORIES) {
      await addDoc(accessoriesRef, {
        ...accessory,
        createdAt: Timestamp.now(),
      });
      count++;
      console.log(`Added accessory ${count}/${ACCESSORIES.length}: ${accessory.name}`);
    }

    console.log(`Successfully added ${count} accessories`);
    return count;
  } catch (error) {
    console.error('Error seeding accessories:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting database seeding...\n');

    await seedPlants();
    console.log('');

    await seedAccessories();
    console.log('');

    console.log('All seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();


