// Script to delete duplicate Peace Lily plants from Firestore
// Run with: node scripts/cleanDuplicates.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');
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

async function cleanDuplicates() {
  try {
    console.log('🔍 Searching for duplicate Peace Lily plants...\n');
    
    const plantsRef = collection(db, 'plants');
    const q = query(plantsRef, where('name', '==', 'Peace Lily'));
    const querySnapshot = await getDocs(q);
    
    const peaceLilies = [];
    querySnapshot.forEach((doc) => {
      peaceLilies.push({ id: doc.id, data: doc.data() });
    });
    
    console.log(`Found ${peaceLilies.length} Peace Lily plant(s)`);
    
    if (peaceLilies.length === 0) {
      console.log('✅ No Peace Lily plants found. Nothing to clean.');
      process.exit(0);
    }
    
    // Find the one with images (the good one)
    const goodOne = peaceLilies.find(p => 
      p.data.colors && 
      p.data.colors[0] && 
      p.data.colors[0].images && 
      p.data.colors[0].images.length > 0
    );
    
    const badOnes = peaceLilies.filter(p => 
      !p.data.colors || 
      !p.data.colors[0] || 
      !p.data.colors[0].images || 
      p.data.colors[0].images.length === 0 ||
      p.id !== goodOne?.id
    );
    
    if (!goodOne) {
      console.log('⚠️  No Peace Lily with images found. Keeping all for now.');
      console.log('💡 Re-run seed to create the correct one.');
      process.exit(0);
    }
    
    console.log(`\n✅ Good Peace Lily found (ID: ${goodOne.id})`);
    console.log(`   - Has ${goodOne.data.colors?.[0]?.images?.length || 0} images for first color`);
    console.log(`   - Has modelUsdzUrl: ${goodOne.data.modelUsdzUrl ? 'Yes' : 'No'}`);
    
    if (badOnes.length === 0) {
      console.log('\n✅ No duplicates to delete. Everything is clean!');
      process.exit(0);
    }
    
    console.log(`\n🗑️  Found ${badOnes.length} duplicate(s) to delete:`);
    badOnes.forEach((p, i) => {
      console.log(`   ${i + 1}. ID: ${p.id}`);
    });
    
    // Delete bad ones
    console.log('\n🗑️  Deleting duplicates...');
    for (const bad of badOnes) {
      await deleteDoc(doc(db, 'plants', bad.id));
      console.log(`   ✅ Deleted: ${bad.id}`);
    }
    
    console.log(`\n🎉 Successfully cleaned ${badOnes.length} duplicate(s)!`);
    console.log('✅ Only the good Peace Lily remains.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error cleaning duplicates:', error);
    process.exit(1);
  }
}

cleanDuplicates();




