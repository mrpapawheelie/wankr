require('dotenv').config({ path: '.env.local' });
const { HandleResolutionService } = require('./dist/services/handleResolutionService');
const { RegisterService } = require('./dist/services/register');
const { CheckRegisterService } = require('./dist/services/checkRegister');

async function fixShameFeedResolution() {
  console.log('🔧 Fixing Shame Feed Resolution\n');
  
  // Initialize services
  const registerService = new RegisterService();
  const checkRegisterService = new CheckRegisterService(registerService);
  const handleResolver = new HandleResolutionService(checkRegisterService, registerService);
  
  // Addresses from your shame feed that should be FIDs
  const shameFeedAddresses = [
    '0x45932054e758a51a421646f07428841a19a45d40',
    '0xfbd29b4390348711a3dbed30742a4de57bf4a867',
    '0x5e2e23cf4d3be0e6e8770c55e462eebf047ec09e',
    '0xb0139f585dc774f8431e1700469d9cce434cd022'
  ];
  
  console.log('📋 Addresses to fix:\n');
  shameFeedAddresses.forEach((addr, i) => {
    console.log(`${i + 1}. ${addr}`);
  });
  console.log('');
  
  // Step 1: Check current state
  console.log('1️⃣ Checking current register state...');
  shameFeedAddresses.forEach((address, i) => {
    const entry = checkRegisterService.checkRegister(address);
    console.log(`${i + 1}. ${address}: ${entry ? `${entry.source} - ${entry.displayName}` : 'Not in register'}`);
  });
  console.log('');
  
  // Step 2: Remove from register and cache
  console.log('2️⃣ Removing from register and cache...');
  const removedFromRegister = registerService.removeFromRegisterBulk(shameFeedAddresses);
  handleResolver.removeFromCache(shameFeedAddresses);
  console.log(`   Removed ${removedFromRegister} addresses from register`);
  console.log(`   Removed ${shameFeedAddresses.length} addresses from cache\n`);
  
  // Step 3: Test resolution for each address
  console.log('3️⃣ Testing resolution after removal...\n');
  
  for (let i = 0; i < shameFeedAddresses.length; i++) {
    const address = shameFeedAddresses[i];
    console.log(`${i + 1}. Testing ${address}:`);
    
    try {
      const resolution = await handleResolver.resolveHandle(address);
      console.log(`   Result: ${resolution.source} - ${resolution.displayName}`);
      
      if (resolution.source === 'farcaster') {
        console.log(`   ✅ Successfully resolved Farcaster handle!`);
        if (resolution.handle) {
          console.log(`   Handle: @${resolution.handle}`);
        }
        if (resolution.twitterHandle) {
          console.log(`   Twitter: @${resolution.twitterHandle}`);
        }
      } else if (resolution.source === 'basenames') {
        console.log(`   ✅ Successfully resolved Basename!`);
        console.log(`   Handle: ${resolution.handle}`);
      } else {
        console.log(`   ⚠️  Fallback to shortened address`);
      }
    } catch (error) {
      console.log(`   ❌ Resolution failed: ${error.message}`);
    }
    console.log('');
  }
  
  // Step 4: Check register stats
  console.log('4️⃣ Final register statistics:');
  const stats = checkRegisterService.getRegisterStats();
  console.log(`   Total entries: ${stats.totalEntries}`);
  console.log(`   Valid entries: ${stats.validEntries}`);
  console.log(`   Expired entries: ${stats.expiredEntries}\n`);
  
  console.log('🏁 Shame feed resolution fix completed!');
  console.log('\n💡 If addresses still show as shortened, they may not have Farcaster handles.');
  console.log('   The system will now properly attempt Farcaster resolution for new transactions.');
}

// Run the fix
fixShameFeedResolution().catch(console.error);
