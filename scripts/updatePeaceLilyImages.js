// Script to verify and update Peace Lily images in Firestore
// Run with: node scripts/updatePeaceLilyImages.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error('Error: Firebase configuration not found. Make sure .env file exists.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CORRECT_IMAGES = {
  'White Ceramic': [
    'https://growme-9e45f.web.app/images/plants/peace-lily/white-ceramic/1.jpg',
    'https://growme-9e45f.web.app/images/plants/peace-lily/white-ceramic/2.jpg',
    'https://growme-9e45f.web.app/images/plants/peace-lily/white-ceramic/3.jpg',
    'https://growme-9e45f.web.app/images/plants/peace-lily/white-ceramic/4.jpg',
  ],
  'Terracotta': [
    'https://growme-9e45f.web.app/images/plants/peace-lily/terracotta/1.jpg',
    'https://growme-9e45f.web.app/images/plants/peace-lily/terracotta/2.jpg',
    'https://growme-9e45f.web.app/images/plants/peace-lily/terracotta/3.jpg',
    'https://growme-9e45f.web.app/images/plants/peace-lily/terracotta/4.jpg',
  ],
};

async function updatePeaceLilyImages() {
  try {
    console.log('🔍 Searching for Peace Lily plants...\n');
    
    const plantsRef = collection(db, 'plants');
    const q = query(plantsRef, where('name', '==', 'Peace Lily'));
    const querySnapshot = await getDocs(q);
    
    const peaceLilies = [];
    querySnapshot.forEach((doc) => {
      peaceLilies.push({ id: doc.id, data: doc.data() });
    });
    
    console.log(`Found ${peaceLilies.length} Peace Lily plant(s)\n`);
    
    if (peaceLilies.length === 0) {
      console.log('⚠️  No Peace Lily plants found. Run seed first.');
      process.exit(0);
    }
    
    for (const peaceLily of peaceLilies) {
      console.log(`\n📋 Checking Peace Lily (ID: ${peaceLily.id})...`);
      
      let needsUpdate = false;
      const updatedColors = peaceLily.data.colors?.map((color, index) => {
        const colorName = color.name;
        const correctImages = CORRECT_IMAGES[colorName];
        
        if (!correctImages) {
          console.log(`   ⚠️  Color "${colorName}" not found in CORRECT_IMAGES, skipping`);
          return color;
        }
        
        const currentImages = color.images || [];
        const imagesMatch = JSON.stringify(currentImages) === JSON.stringify(correctImages);
        
        if (!imagesMatch) {
          console.log(`   🔄 Updating images for "${colorName}"`);
          console.log(`      Current: ${currentImages.length} images`);
          console.log(`      Correct: ${correctImages.length} images`);
          needsUpdate = true;
          return { ...color, images: correctImages };
        } else {
          console.log(`   ✅ "${colorName}" images are correct`);
          return color;
        }
      }) || [];
      
      if (needsUpdate) {
        console.log(`\n💾 Updating Peace Lily (ID: ${peaceLily.id})...`);
        const plantRef = doc(db, 'plants', peaceLily.id);
        await updateDoc(plantRef, {
          colors: updatedColors,
        });
        console.log(`   ✅ Successfully updated!`);
      } else {
        console.log(`\n✅ Peace Lily (ID: ${peaceLily.id}) is already up to date.`);
      }
    }
    
    console.log(`\n🎉 Done! Checked ${peaceLilies.length} Peace Lily plant(s).`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating Peace Lily images:', error);
    process.exit(1);
  }
}

updatePeaceLilyImages();

