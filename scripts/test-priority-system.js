require('dotenv').config({ path: '.env.local' });
const { HandleResolutionService } = require('./dist/services/handleResolutionService');
const { RegisterService } = require('./dist/services/register');
const { CheckRegisterService } = require('./dist/services/checkRegister');

async function testPrioritySystem() {
  console.log('🎯 Testing Priority System\n');
  
  // Initialize services
  const registerService = new RegisterService();
  const checkRegisterService = new CheckRegisterService(registerService);
  const handleResolver = new HandleResolutionService(checkRegisterService, registerService);
  
  // Test addresses
  const testAddresses = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik (known Farcaster)
    '0x88aC88774f92c41c9403c158BcDF341D7f57213E', // Papa Wheelie (known Farcaster)
    '0x45932054e758a51a421646f07428841a19a45d40'  // No handles
  ];
  
  console.log('📋 Test addresses:\n');
  testAddresses.forEach((addr, i) => {
    console.log(`${i + 1}. ${addr}`);
  });
  console.log('');
  
  // Step 1: Initial resolution (should show shortened)
  console.log('1️⃣ Initial resolution (should show shortened):\n');
  
  for (let i = 0; i < testAddresses.length; i++) {
    const address = testAddresses[i];
    console.log(`${i + 1}. ${address}:`);
    
    try {
      const resolution = await handleResolver.resolveHandle(address);
      console.log(`   Result: ${resolution.source} - ${resolution.displayName} (Priority: ${resolution.priority})`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  // Step 2: Check batch stats
  console.log('\n2️⃣ Batch processing stats:');
  const batchStats = handleResolver.getBatchStats();
  console.log(`   Queue size: ${batchStats.queueSize}`);
  console.log(`   Processing: ${batchStats.isProcessing}\n`);
  
  // Step 3: Force process batch
  console.log('3️⃣ Force processing batch...');
  await handleResolver.forceProcessBatch();
  console.log('   Batch processed!\n');
  
  // Step 4: Check results after processing
  console.log('4️⃣ Results after batch processing:\n');
  
  for (let i = 0; i < testAddresses.length; i++) {
    const address = testAddresses[i];
    console.log(`${i + 1}. ${address}:`);
    
    try {
      const resolution = await handleResolver.resolveHandle(address);
      console.log(`   Result: ${resolution.source} - ${resolution.displayName} (Priority: ${resolution.priority})`);
      
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
  
  // Step 5: Test priority system with simulated Basename result
  console.log('5️⃣ Testing priority system...');
  console.log('   Simulating Basename result for Vitalik (higher priority)...\n');
  
  // Simulate a Basename result for Vitalik (higher priority than Farcaster)
  const simulatedBasename = {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    displayName: 'vitalik.basename',
    source: 'basenames',
    handle: 'vitalik.basename',
    platform: 'basenames',
    verified: true,
    lastUpdated: Date.now(),
    priority: 1 // Higher priority than Farcaster
  };
  
  // This would normally come from the Basenames service
  // For testing, we'll manually trigger the update
  handleResolver['updateCacheAndRegisterIfBetter']('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', simulatedBasename);
  
  // Check if priority update worked
  console.log('6️⃣ Checking priority update:\n');
  const vitalikResolution = await handleResolver.resolveHandle('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  console.log(`Vitalik: ${vitalikResolution.source} - ${vitalikResolution.displayName} (Priority: ${vitalikResolution.priority})`);
  
  if (vitalikResolution.source === 'basenames') {
    console.log('   ✅ Priority system working! Basename (priority 1) overrode Farcaster (priority 2)');
  } else {
    console.log('   ❌ Priority system not working correctly');
  }
  
  console.log('\n🏁 Priority system test completed!');
  console.log('\n💡 Priority order:');
  console.log('   1. Basenames (on-chain, verified)');
  console.log('   2. Farcaster (social, verified)');
  console.log('   3. Shortened (fallback)');
}

// Run the test
testPrioritySystem().catch(console.error);
