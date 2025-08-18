require('dotenv').config({ path: '.env.local' });
const { HandleResolutionService } = require('./dist/services/handleResolutionService');
const { RegisterService } = require('./dist/services/register');
const { CheckRegisterService } = require('./dist/services/checkRegister');

async function testBatchingSystem() {
  console.log('🧪 Testing Batching System\n');
  
  // Initialize services
  const registerService = new RegisterService();
  const checkRegisterService = new CheckRegisterService(registerService);
  const handleResolver = new HandleResolutionService(checkRegisterService, registerService);
  
  // Test addresses - mix of known Farcaster users and unknown addresses
  const testAddresses = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik (known Farcaster)
    '0x88aC88774f92c41c9403c158BcDF341D7f57213E', // Papa Wheelie (known Farcaster)
    '0x683d1a8e788Ea8aeac004278072A1d19C43c14fD', // Relicc (known Farcaster)
    '0x45932054e758a51a421646f07428841a19a45d40', // No Farcaster handle
    '0xfbd29b4390348711a3dbed30742a4de57bf4a867', // No Farcaster handle
    '0x5e2e23cf4d3be0e6e8770c55e462eebf047ec09e', // No Farcaster handle
    '0xb0139f585dc774f8431e1700469d9cce434cd022'  // No Farcaster handle
  ];
  
  console.log('📋 Test addresses:\n');
  testAddresses.forEach((addr, i) => {
    console.log(`${i + 1}. ${addr}`);
  });
  console.log('');
  
  // Step 1: Check initial batch stats
  console.log('1️⃣ Initial batch stats:');
  const initialStats = handleResolver.getBatchStats();
  console.log(`   Queue size: ${initialStats.queueSize}`);
  console.log(`   Processing: ${initialStats.isProcessing}\n`);
  
  // Step 2: Resolve handles (this should add addresses to the queue)
  console.log('2️⃣ Resolving handles (should add to queue)...\n');
  
  for (let i = 0; i < testAddresses.length; i++) {
    const address = testAddresses[i];
    console.log(`${i + 1}. Resolving ${address}:`);
    
    try {
      const resolution = await handleResolver.resolveHandle(address);
      console.log(`   Result: ${resolution.source} - ${resolution.displayName}`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  // Step 3: Check queue after resolution
  console.log('\n3️⃣ Queue after resolution:');
  const queueStats = handleResolver.getBatchStats();
  console.log(`   Queue size: ${queueStats.queueSize}`);
  console.log(`   Processing: ${queueStats.isProcessing}\n`);
  
  // Step 4: Force process the batch
  console.log('4️⃣ Force processing batch...');
  await handleResolver.forceProcessBatch();
  console.log('   Batch processed!\n');
  
  // Step 5: Check queue after processing
  console.log('5️⃣ Queue after processing:');
  const finalStats = handleResolver.getBatchStats();
  console.log(`   Queue size: ${finalStats.queueSize}`);
  console.log(`   Processing: ${finalStats.isProcessing}\n`);
  
  // Step 6: Check results after batch processing
  console.log('6️⃣ Results after batch processing:\n');
  
  for (let i = 0; i < testAddresses.length; i++) {
    const address = testAddresses[i];
    console.log(`${i + 1}. ${address}:`);
    
    try {
      const resolution = await handleResolver.resolveHandle(address);
      console.log(`   Result: ${resolution.source} - ${resolution.displayName}`);
      
      if (resolution.source === 'farcaster') {
        console.log(`   ✅ Farcaster handle resolved!`);
        if (resolution.handle) {
          console.log(`   Handle: @${resolution.handle}`);
        }
        if (resolution.twitterHandle) {
          console.log(`   Twitter: @${resolution.twitterHandle}`);
        }
      } else if (resolution.source === 'basenames') {
        console.log(`   ✅ Basename resolved!`);
        console.log(`   Handle: ${resolution.handle}`);
      } else {
        console.log(`   ⚠️  Still showing shortened address`);
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }
  
  // Step 7: Test bulk resolution
  console.log('7️⃣ Testing bulk resolution...');
  const bulkResults = await handleResolver.resolveHandlesBulk(testAddresses.slice(0, 3));
  console.log('   Bulk results:');
  Object.entries(bulkResults).forEach(([address, resolution]) => {
    console.log(`   ${address}: ${resolution.source} - ${resolution.displayName}`);
  });
  console.log('');
  
  console.log('🏁 Batching system test completed!');
  console.log('\n💡 The batching system should:');
  console.log('   - Collect addresses in a queue');
  console.log('   - Process them in bulk every minute');
  console.log('   - Update cache and register with results');
  console.log('   - Show Farcaster handles for known users');
}

// Run the test
testBatchingSystem().catch(console.error);
