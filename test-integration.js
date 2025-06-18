// Test script to verify the complete LBCFT WEBAPP integration
const http = require('http');

function testEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`✓ ${path}: ${res.statusCode} (expected ${expectedStatus})`);
      resolve(res.statusCode === expectedStatus);
    });

    req.on('error', (err) => {
      console.log(`✗ ${path}: Error - ${err.message}`);
      reject(err);
    });

    req.setTimeout(5000, () => {
      console.log(`✗ ${path}: Timeout`);
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing BCP2S Dashboard Integration...\n');

  const tests = [
    { path: '/', name: 'Main Dashboard' },
    { path: '/amlcenter', name: 'AML Center (LBCFT WEBAPP)' },
    { path: '/amlcenter/search', name: 'AML Search' },
    { path: '/amlcenter/client-space', name: 'AML Client Space' },
    { path: '/rep-watch', name: 'Rep Watch' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const success = await testEndpoint(test.path);
      if (success) {
        console.log(`✅ ${test.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! The integration is working correctly.');
    console.log('\n🔗 Available URLs:');
    console.log('   • Main Dashboard: http://localhost:3000');
    console.log('   • AML Center: http://localhost:3000/amlcenter');
    console.log('   • Rep Watch: http://localhost:3000/rep-watch');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server logs.');
  }
}

// Run the tests
runTests().catch(console.error);
