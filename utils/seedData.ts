import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Plant, Order, Accessory } from '../types';

const ACCESSORIES: Accessory[] = [
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

const PLANTS: Omit<Plant, 'id'>[] = [
  {
    name: 'Monstera Deliciosa',
    category: 'Easy Care',
    description: 'A stunning tropical plant with large, glossy, heart-shaped leaves that develop natural holes as they mature. Perfect for beginners and adds a dramatic touch to any room. This plant is known for its air-purifying qualities and can grow quite large with proper care.',
    basePrice: 29.99,
    images: [
      'https://images.unsplash.com/photo-1519336056116-9e7d8c8b4c7a?w=800',
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
    ],
    sizes: ['Small', 'Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 5 },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0 },
      { name: 'Black Ceramic', material: 'Ceramic', hexCode: '#2C2C2C', priceModifier: 8 },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 5 },
    ],
    lightPreference: 'Medium',
    careLevel: 'Easy',
    airPurifying: true,
    featured: true,
  },
  {
    name: 'Snake Plant',
    category: 'Low Light',
    description: 'A hardy, low-maintenance plant that thrives in low light conditions. Perfect for bedrooms and offices. This plant is nearly indestructible and can survive weeks without water. It\'s excellent for air purification, especially at night.',
    basePrice: 19.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { 
        name: 'White Ceramic', 
        material: 'Ceramic', 
        hexCode: '#FFFFFF', 
        priceModifier: 5,
        images: [
          'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
          'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
          'https://images.unsplash.com/photo-1574178611456-9c8eab9c83e4?w=800',
          'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
        ],
      },
      { 
        name: 'Terracotta', 
        material: 'Terracotta', 
        hexCode: '#E2725B', 
        priceModifier: 0,
        images: [
          'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
          'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
          'https://images.unsplash.com/photo-1574178611456-9c8eab9c83e4?w=800',
          'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
        ],
      },
      { 
        name: 'Black Ceramic', 
        material: 'Ceramic', 
        hexCode: '#2C2C2C', 
        priceModifier: 8,
        images: [
          'https://images.unsplash.com/photo-1574178611456-9c8eab9c83e4?w=800',
          'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
          'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
          'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
        ],
      },
    ],
    lightPreference: 'Low',
    careLevel: 'Easy',
    airPurifying: true,
    featured: true,
  },
  {
    name: 'Fiddle Leaf Fig',
    category: 'Large Plants',
    description: 'A stunning tree-like plant with large, violin-shaped leaves. This statement plant can grow up to 6 feet tall indoors. It requires bright, indirect light and consistent watering. Perfect for filling empty corners and adding height to your space.',
    basePrice: 49.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 10 },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 5 },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 8 },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: true,
    featured: true,
  },
  {
    name: 'Pothos Golden',
    category: 'Air Purifying',
    description: 'A trailing vine with heart-shaped leaves that are variegated with golden yellow. Extremely easy to care for and perfect for hanging baskets or shelves. This plant is known for its air-purifying capabilities and can grow in various light conditions.',
    basePrice: 14.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3 },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0 },
      { name: 'Hanging Basket', material: 'Plastic', hexCode: '#8B4513', priceModifier: 2 },
    ],
    lightPreference: 'Low',
    careLevel: 'Easy',
    airPurifying: true,
    featured: true,
  },
  {
    name: 'ZZ Plant',
    category: 'Low Light',
    description: 'A nearly indestructible plant with glossy, dark green leaves that thrive in low light and can survive weeks without water. Perfect for beginners or those who travel frequently. The ZZ plant is also known for its air-purifying qualities.',
    basePrice: 24.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 5 },
      { name: 'Black Ceramic', material: 'Ceramic', hexCode: '#2C2C2C', priceModifier: 8 },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 5 },
    ],
    lightPreference: 'Low',
    careLevel: 'Easy',
    airPurifying: true,
    featured: false,
  },
  {
    name: 'Peace Lily',
    category: 'Air Purifying',
    description: 'Beautiful plant with dark green leaves and elegant white flowers. Excellent air purifier that removes toxins from the air. Prefers medium to low light and consistent moisture. Perfect for bathrooms and bedrooms.',
    basePrice: 22.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { 
        name: 'White Ceramic', 
        material: 'Ceramic', 
        hexCode: '#FFFFFF', 
        priceModifier: 5,
        images: [
          'https://growme-9e45f.web.app/images/plants/peace-lily/white-ceramic/1.jpg',
          'https://growme-9e45f.web.app/images/plants/peace-lily/white-ceramic/2.jpg',
          'https://growme-9e45f.web.app/images/plants/peace-lily/white-ceramic/3.jpg',
          'https://growme-9e45f.web.app/images/plants/peace-lily/white-ceramic/4.jpg',
        ],
      },
      { 
        name: 'Terracotta', 
        material: 'Terracotta', 
        hexCode: '#E2725B', 
        priceModifier: 0,
        images: [
          'https://growme-9e45f.web.app/images/plants/peace-lily/terracotta/1.jpg',
          'https://growme-9e45f.web.app/images/plants/peace-lily/terracotta/2.jpg',
          'https://growme-9e45f.web.app/images/plants/peace-lily/terracotta/3.jpg',
          'https://growme-9e45f.web.app/images/plants/peace-lily/terracotta/4.jpg',
        ],
      },
    ],
    lightPreference: 'Medium',
    careLevel: 'Easy',
    airPurifying: true,
    featured: false,
    modelUsdzUrl: 'https://growme-9e45f.web.app/models/Peaceful_Elegance_1105145247_texture.usdz',
  },
  {
    name: 'Aloe Vera',
    category: 'Succulents',
    description: 'A healing succulent with thick, fleshy leaves that contain a gel used for skin care. Requires minimal care and bright, indirect light. Perfect for sunny windowsills. The gel inside can be used to soothe burns and skin irritations.',
    basePrice: 12.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0 },
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3 },
    ],
    lightPreference: 'Bright',
    careLevel: 'Easy',
    airPurifying: false,
    featured: false,
  },
  {
    name: 'Spider Plant',
    category: 'Air Purifying',
    description: 'Produces baby plants (spiderettes) that dangle from the mother plant. Excellent for air purification and very easy to care for. Perfect for hanging baskets or high shelves. The plantlets can be propagated to create new plants.',
    basePrice: 16.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3 },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0 },
      { name: 'Hanging Basket', material: 'Plastic', hexCode: '#8B4513', priceModifier: 2 },
    ],
    lightPreference: 'Medium',
    careLevel: 'Easy',
    airPurifying: true,
    featured: false,
  },
  {
    name: 'Rubber Plant',
    category: 'Large Plants',
    description: 'A bold, architectural plant with large, glossy leaves. Can grow quite tall and makes a stunning statement piece. Prefers bright, indirect light and consistent watering. The leaves are thick and rubbery, giving it its name.',
    basePrice: 34.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 8 },
      { name: 'Black Ceramic', material: 'Ceramic', hexCode: '#2C2C2C', priceModifier: 10 },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 8 },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: true,
    featured: true,
  },
  {
    name: 'Philodendron Heartleaf',
    category: 'Easy Care',
    description: 'A trailing plant with heart-shaped leaves that cascade beautifully. Extremely easy to care for and perfect for hanging baskets or training on a trellis. This plant is very forgiving and can tolerate various light conditions.',
    basePrice: 18.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3 },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0 },
      { name: 'Hanging Basket', material: 'Plastic', hexCode: '#8B4513', priceModifier: 2 },
    ],
    lightPreference: 'Medium',
    careLevel: 'Easy',
    airPurifying: true,
    featured: false,
  },
  {
    name: 'String of Pearls',
    category: 'Succulents',
    description: 'A unique trailing succulent with small, bead-like leaves that cascade like a waterfall. Perfect for hanging planters and high shelves. Requires bright light and infrequent watering. Very striking when displayed properly.',
    basePrice: 21.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0 },
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3 },
      { name: 'Hanging Basket', material: 'Plastic', hexCode: '#8B4513', priceModifier: 2 },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: false,
    featured: false,
  },
  {
    name: 'Bird of Paradise',
    category: 'Large Plants',
    description: 'A dramatic, tropical plant with large, banana-like leaves. Can grow very tall and makes an impressive statement. Requires bright light and consistent watering. The plant gets its name from its bird-like flowers.',
    basePrice: 59.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 12 },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 10 },
      { name: 'Black Ceramic', material: 'Ceramic', hexCode: '#2C2C2C', priceModifier: 15 },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: true,
    featured: true,
  },
  {
    name: 'Chinese Money Plant',
    category: 'Small Plants',
    description: 'A charming plant with round, coin-like leaves on long stems. Also known as Pilea peperomioides. Easy to care for and produces many baby plants. Perfect for small spaces and makes a great gift.',
    basePrice: 19.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 4 },
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0 },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 4 },
    ],
    lightPreference: 'Medium',
    careLevel: 'Easy',
    airPurifying: true,
    featured: false,
  },
  {
    name: 'Calathea Medallion',
    category: 'Small Plants',
    description: 'A stunning plant with beautifully patterned leaves that fold up at night. Known for its vibrant colors and patterns. Requires high humidity and indirect light. Perfect for adding color and interest to your space.',
    basePrice: 26.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 6 },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 6 },
    ],
    lightPreference: 'Medium',
    careLevel: 'Medium',
    airPurifying: true,
    featured: false,
  },
  {
    name: 'Echeveria',
    category: 'Succulents',
    description: 'A beautiful rosette-forming succulent with colorful, fleshy leaves. Perfect for sunny windowsills and requires minimal care. Comes in various colors and makes a lovely addition to any succulent collection.',
    basePrice: 9.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small'],
    colors: [
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0 },
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 2 },
    ],
    lightPreference: 'Bright',
    careLevel: 'Easy',
    airPurifying: false,
    featured: false,
  },
  {
    name: 'Jade Plant',
    category: 'Succulents',
    description: 'A classic succulent with thick, jade-green leaves. Known as a symbol of good luck and prosperity. Very easy to care for and can live for many years. Perfect for beginners and those who want a low-maintenance plant.',
    basePrice: 15.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'Terracotta', material: 'Terracotta', hexCode: '#E2725B', priceModifier: 0 },
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 3 },
    ],
    lightPreference: 'Bright',
    careLevel: 'Easy',
    airPurifying: false,
    featured: false,
  },
  {
    name: 'Boston Fern',
    category: 'Air Purifying',
    description: 'A lush, feathery fern that thrives in high humidity. Excellent for bathrooms and kitchens. Known for its air-purifying qualities and elegant, arching fronds. Requires consistent moisture and indirect light.',
    basePrice: 18.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 4 },
      { name: 'Hanging Basket', material: 'Plastic', hexCode: '#8B4513', priceModifier: 2 },
    ],
    lightPreference: 'Medium',
    careLevel: 'Medium',
    airPurifying: true,
    featured: false,
  },
  {
    name: 'Anthurium',
    category: 'Flowering',
    description: 'A tropical plant with glossy, heart-shaped leaves and striking red, pink, or white flowers. Blooms year-round with proper care. Requires bright, indirect light and high humidity. Perfect for adding a pop of color.',
    basePrice: 32.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Small', 'Medium'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 6 },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 6 },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: true,
    featured: true,
  },
  {
    name: 'Bamboo Palm',
    category: 'Air Purifying',
    description: 'A tall, elegant palm that adds a tropical feel to any space. Excellent air purifier that removes toxins from the air. Requires bright, indirect light and consistent watering. Can grow quite tall indoors.',
    basePrice: 39.99,
    images: [
      'https://images.unsplash.com/photo-1593691509546-c4a29642233c?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
    sizes: ['Medium', 'Large'],
    colors: [
      { name: 'White Ceramic', material: 'Ceramic', hexCode: '#FFFFFF', priceModifier: 10 },
      { name: 'Gray Ceramic', material: 'Ceramic', hexCode: '#9E9E9E', priceModifier: 10 },
      { name: 'Black Ceramic', material: 'Ceramic', hexCode: '#2C2C2C', priceModifier: 12 },
    ],
    lightPreference: 'Bright',
    careLevel: 'Medium',
    airPurifying: true,
    featured: false,
  },
];

export const seedPlants = async () => {
  try {
    console.log('🌱 Starting to seed plants...');
    const plantsRef = collection(db, 'plants');
    
    let count = 0;
    for (const plant of PLANTS) {
      await addDoc(plantsRef, {
        ...plant,
        createdAt: Timestamp.now(),
      });
      count++;
      console.log(`✅ Added plant ${count}/${PLANTS.length}: ${plant.name}`);
    }
    
    console.log(`\n🎉 Successfully added ${count} plants!`);
    return count;
  } catch (error) {
    console.error('❌ Error seeding plants:', error);
    throw error;
  }
};

export const seedAccessories = async () => {
  try {
    console.log('🎁 Starting to seed accessories...');
    const accessoriesRef = collection(db, 'accessories');
    
    let count = 0;
    for (const accessory of ACCESSORIES) {
      await addDoc(accessoriesRef, {
        ...accessory,
        createdAt: Timestamp.now(),
      });
      count++;
      console.log(`✅ Added accessory ${count}/${ACCESSORIES.length}: ${accessory.name}`);
    }
    
    console.log(`\n🎉 Successfully added ${count} accessories!`);
    return count;
  } catch (error) {
    console.error('❌ Error seeding accessories:', error);
    throw error;
  }
};

// Helper function to create test orders (requires existing plants and users)
export const createTestOrder = async (
  userId: string,
  plantIds: string[],
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
) => {
  try {
    // Note: This is a simplified version. In production, you'd fetch actual plants
    // and calculate prices properly
    const ordersRef = collection(db, 'orders');
    
    const order = {
      userId,
      items: [], // Would need actual plant data here
      subtotal: 49.99,
      deliveryFee: 5.99,
      total: 55.98,
      status: 'Processing' as const,
      address,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(ordersRef, order);
    console.log(`✅ Created test order: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating test order:', error);
    throw error;
  }
};
