require('dotenv').config({ path: '.env.local' });
const { HandleResolutionFID } = require('./dist/services/handleResolutionFID');

async function testFarcasterResolution() {
  console.log('🔍 Testing Farcaster Resolution\n');
  
  // Check if Neynar API key is loaded
  console.log(`🔑 Neynar API Key loaded: ${process.env.NEYNAR_API_KEY ? 'YES' : 'NO'}`);
  if (process.env.NEYNAR_API_KEY) {
    console.log(`   Key: ${process.env.NEYNAR_API_KEY.substring(0, 8)}...\n`);
  }
  
  // Initialize FID resolver
  const fidResolver = new HandleResolutionFID();
  
  // Test with a known Farcaster address (Vitalik's address)
  const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
  
  console.log(`📋 Testing Farcaster resolution for: ${testAddress}\n`);
  
  try {
    console.log('1️⃣ Attempting Farcaster resolution...');
    const resolution = await fidResolver.resolveFID(testAddress);
    
    if (resolution) {
      console.log('   ✅ Farcaster resolution successful:');
      console.log(`      Address: ${resolution.address}`);
      console.log(`      Display Name: ${resolution.displayName}`);
      console.log(`      Handle: ${resolution.handle}`);
      console.log(`      Platform: ${resolution.platform}`);
      console.log(`      Verified: ${resolution.verified}`);
      console.log(`      Avatar: ${resolution.avatar || 'N/A'}`);
      console.log(`      Last Updated: ${new Date(resolution.lastUpdated).toISOString()}\n`);
    } else {
      console.log('   ❌ No Farcaster handle found for this address\n');
    }
  } catch (error) {
    console.log(`   ❌ Farcaster resolution failed: ${error.message}\n`);
  }
  
  // Test with the original address
  const testAddress2 = '0x45932054e758a51a421646f07428841a19a45d40';
  console.log(`📋 Testing Farcaster resolution for: ${testAddress2}\n`);
  
  try {
    console.log('2️⃣ Attempting Farcaster resolution for original address...');
    const resolution2 = await fidResolver.resolveFID(testAddress2);
    
    if (resolution2) {
      console.log('   ✅ Farcaster resolution successful:');
      console.log(`      Address: ${resolution2.address}`);
      console.log(`      Display Name: ${resolution2.displayName}`);
      console.log(`      Handle: ${resolution2.handle}`);
      console.log(`      Platform: ${resolution2.platform}`);
      console.log(`      Verified: ${resolution2.verified}`);
      console.log(`      Avatar: ${resolution2.avatar || 'N/A'}`);
      console.log(`      Last Updated: ${new Date(resolution2.lastUpdated).toISOString()}\n`);
    } else {
      console.log('   ❌ No Farcaster handle found for this address\n');
    }
  } catch (error) {
    console.log(`   ❌ Farcaster resolution failed: ${error.message}\n`);
  }
  
  console.log('🏁 Farcaster resolution test completed!');
}

// Run the test
testFarcasterResolution().catch(console.error);
