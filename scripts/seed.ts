// Script to seed Firebase with initial plant data
// Run with: npx ts-node scripts/seed.ts

import { seedPlants, seedAccessories } from '../utils/seedData';

async function main() {
  try {
    console.log('🚀 Starting database seeding...\n');
    
    // Seed plants
    await seedPlants();
    console.log('');
    
    // Seed accessories
    await seedAccessories();
    console.log('');
    
    console.log('✨ All seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   - Check your Firestore database to see the new plants');
    console.log('   - Test the app by searching for plants');
    console.log('   - Add plants to cart and test the checkout flow');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();


