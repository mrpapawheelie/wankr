require('dotenv').config({ path: '.env.local' });
const { HandleResolutionFID } = require('./dist/services/handleResolutionFID');

async function testBulkFarcasterResolution() {
  console.log('🔍 Testing Bulk Farcaster Resolution\n');
  
  // Initialize FID resolver
  const fidResolver = new HandleResolutionFID();
  
  // Test addresses - including some with Twitter handles
  const testAddresses = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik
    '0x88aC88774f92c41c9403c158BcDF341D7f57213E', // Papa Wheelie (has Twitter)
    '0x683d1a8e788Ea8aeac004278072A1d19C43c14fD', // Relicc
    '0x45932054e758a51a421646f07428841a19a45d40'  // No Farcaster handle
  ];
  
  console.log(`📋 Testing bulk resolution for ${testAddresses.length} addresses:\n`);
  testAddresses.forEach((addr, i) => {
    console.log(`${i + 1}. ${addr}`);
  });
  console.log('');
  
  try {
    console.log('🚀 Making bulk API call...');
    const results = await fidResolver.resolveFIDBulk(testAddresses);
    
    console.log('📊 Results:\n');
    testAddresses.forEach((address, i) => {
      const result = results[address.toLowerCase()];
      console.log(`${i + 1}. ${address}:`);
      
      if (result) {
        console.log(`   ✅ Farcaster: @${result.handle}`);
        console.log(`   📝 Display: ${result.displayName}`);
        if (result.twitterHandle) {
          console.log(`   🐦 Twitter: @${result.twitterHandle}`);
        }
        if (result.avatar) {
          console.log(`   🖼️  Avatar: ${result.avatar.substring(0, 50)}...`);
        }
      } else {
        console.log(`   ❌ No Farcaster handle found`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Bulk resolution failed:', error.message);
  }
  
  console.log('🏁 Bulk resolution test completed!');
}

// Run the test
testBulkFarcasterResolution().catch(console.error);
