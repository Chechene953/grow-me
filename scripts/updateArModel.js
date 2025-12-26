// Script to update only the modelUsdzUrl field for Snake Plant
// Run with: node scripts/updateArModel.js

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function updateSnakePlantAR() {
  try {
    console.log('🔍 Searching for Snake Plant...\n');
    
    const plantsRef = db.collection('plants');
    const snapshot = await plantsRef.where('name', '==', 'Snake Plant').get();
    
    if (snapshot.empty) {
      console.log('❌ No Snake Plant found in Firestore');
      console.log('💡 Run "npm run seed" to create the plants first');
      process.exit(1);
    }
    
    const batch = db.batch();
    let updated = 0;
    
    snapshot.forEach((doc) => {
      const plantData = doc.data();
      console.log(`📝 Found: ${plantData.name} (ID: ${doc.id})`);
      
      batch.update(doc.ref, {
        modelUsdzUrl: 'https://growme-9e45f.web.app/models/Peaceful_Elegance_1105145247_texture.usdz',
      });
      updated++;
    });
    
    await batch.commit();
    
    console.log(`\n✅ Successfully updated ${updated} Snake Plant(s) with AR model URL!`);
    console.log('\n🎉 You can now test AR in the app!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating plant:', error);
    process.exit(1);
  }
}

updateSnakePlantAR();




