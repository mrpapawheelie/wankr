const { HandleResolutionService } = require('./dist/services/handleResolutionService');
const { RegisterService } = require('./dist/services/register');
const { CheckRegisterService } = require('./dist/services/checkRegister');

async function testHandleResolution() {
  console.log('🔍 Testing Handle Resolution Flow\n');
  
  // Initialize services
  const registerService = new RegisterService();
  const checkRegisterService = new CheckRegisterService(registerService);
  const handleResolver = new HandleResolutionService(checkRegisterService, registerService);
  
  // Test address - replace with the actual FID address you're seeing
  const testAddress = '0x45932054e758a51a421646f07428841a19a45d40'; // Example from register
  
  console.log(`📋 Testing address: ${testAddress}\n`);
  
  // Step 1: Check if address is in register
  console.log('1️⃣ Checking register...');
  const registerEntry = checkRegisterService.checkRegister(testAddress);
  if (registerEntry) {
    console.log('   ✅ Found in register:');
    console.log(`      Display Name: ${registerEntry.displayName}`);
    console.log(`      Source: ${registerEntry.source}`);
    console.log(`      Handle: ${registerEntry.handle || 'N/A'}`);
    console.log(`      Platform: ${registerEntry.platform || 'N/A'}`);
    console.log(`      Verified: ${registerEntry.verified || false}`);
    console.log(`      Last Updated: ${new Date(registerEntry.lastUpdated).toISOString()}`);
    console.log(`      Refresh Due: ${new Date(registerEntry.refreshDue).toISOString()}`);
    console.log(`      Expired: ${Date.now() >= registerEntry.refreshDue ? 'YES' : 'NO'}\n`);
  } else {
    console.log('   ❌ Not found in register\n');
  }
  
  // Step 2: Check cache
  console.log('2️⃣ Checking cache...');
  const cacheStats = handleResolver.getCacheStats();
  console.log(`   Cache size: ${cacheStats.size}`);
  if (cacheStats.size > 0) {
    console.log(`   Cached addresses: ${cacheStats.entries.slice(0, 5).join(', ')}${cacheStats.entries.length > 5 ? '...' : ''}`);
  }
  console.log('');
  
  // Step 3: Test handle resolution
  console.log('3️⃣ Testing handle resolution...');
  try {
    const resolution = await handleResolver.resolveHandle(testAddress);
    console.log('   ✅ Resolution result:');
    console.log(`      Display Name: ${resolution.displayName}`);
    console.log(`      Source: ${resolution.source}`);
    console.log(`      Handle: ${resolution.handle || 'N/A'}`);
    console.log(`      Platform: ${resolution.platform || 'N/A'}`);
    console.log(`      Verified: ${resolution.verified || false}`);
    console.log(`      Last Updated: ${new Date(resolution.lastUpdated).toISOString()}\n`);
  } catch (error) {
    console.log(`   ❌ Resolution failed: ${error.message}\n`);
  }
  
  // Step 4: Check register stats
  console.log('4️⃣ Register statistics...');
  const registerStats = checkRegisterService.getRegisterStats();
  console.log(`   Total entries: ${registerStats.totalEntries}`);
  console.log(`   Valid entries: ${registerStats.validEntries}`);
  console.log(`   Expired entries: ${registerStats.expiredEntries}\n`);
  
  // Step 5: Test removing from register and cache
  console.log('5️⃣ Testing removal from register and cache...');
  
  // Remove from register
  const removedFromRegister = registerService.removeFromRegister(testAddress);
  console.log(`   Removed from register: ${removedFromRegister ? 'YES' : 'NO'}`);
  
  // Remove from cache
  handleResolver.removeFromCache([testAddress]);
  console.log('   Removed from cache: YES\n');
  
  // Step 6: Test resolution again after removal
  console.log('6️⃣ Testing resolution after removal...');
  try {
    const resolutionAfterRemoval = await handleResolver.resolveHandle(testAddress);
    console.log('   ✅ Resolution result after removal:');
    console.log(`      Display Name: ${resolutionAfterRemoval.displayName}`);
    console.log(`      Source: ${resolutionAfterRemoval.source}`);
    console.log(`      Handle: ${resolutionAfterRemoval.handle || 'N/A'}`);
    console.log(`      Platform: ${resolutionAfterRemoval.platform || 'N/A'}`);
    console.log(`      Verified: ${resolutionAfterRemoval.verified || false}`);
    console.log(`      Last Updated: ${new Date(resolutionAfterRemoval.lastUpdated).toISOString()}\n`);
  } catch (error) {
    console.log(`   ❌ Resolution failed after removal: ${error.message}\n`);
  }
  
  console.log('🏁 Test completed!');
}

// Run the test
testHandleResolution().catch(console.error);
