const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const testConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(name, success, message = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  const result = { name, success, message, timestamp: new Date().toISOString() };
  
  console.log(`${status} ${name}${message ? `: ${message}` : ''}`);
  
  results.tests.push(result);
  if (success) {
    results.passed++;
  } else {
    results.failed++;
  }
}

// Test functions
async function testHealthEndpoint() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, testConfig);
    
    if (response.status === 200 && response.data.status === 'OK') {
      logTest('Health Check', true);
      console.log('   Database:', response.data.database);
      console.log('   Environment:', response.data.environment);
    } else {
      logTest('Health Check', false, 'Unexpected response format');
    }
  } catch (error) {
    logTest('Health Check', false, error.message);
  }
}

async function testRootEndpoint() {
  try {
    const response = await axios.get(`${BASE_URL}/`, testConfig);
    
    if (response.status === 200 && response.data.message) {
      logTest('Root Endpoint', true);
      console.log('   Message:', response.data.message);
      console.log('   Version:', response.data.version);
    } else {
      logTest('Root Endpoint', false, 'Unexpected response format');
    }
  } catch (error) {
    logTest('Root Endpoint', false, error.message);
  }
}

async function testSariEndpoints() {
  try {
    // Test GET /api/saris
    const response = await axios.get(`${BASE_URL}/api/saris`, testConfig);
    
    if (response.status === 200 && response.data.success) {
      logTest('GET /api/saris', true);
      console.log(`   Total Saris: ${response.data.data.length}`);
    } else {
      logTest('GET /api/saris', false, 'Unexpected response format');
    }
  } catch (error) {
    logTest('GET /api/saris', false, error.message);
  }
}

async function testMovementEndpoints() {
  try {
    // Test GET /api/movements
    const response = await axios.get(`${BASE_URL}/api/movements`, testConfig);
    
    if (response.status === 200 && response.data.success) {
      logTest('GET /api/movements', true);
      console.log(`   Total Movements: ${response.data.data.length}`);
    } else {
      logTest('GET /api/movements', false, 'Unexpected response format');
    }
  } catch (error) {
    logTest('GET /api/movements', false, error.message);
  }
}

async function testDashboardEndpoints() {
  try {
    // Test GET /api/dashboard/overview
    const response = await axios.get(`${BASE_URL}/api/dashboard/overview`, testConfig);
    
    if (response.status === 200 && response.data.success) {
      logTest('GET /api/dashboard/overview', true);
      console.log(`   Total Saris: ${response.data.data.totalSaris}`);
      console.log(`   Active Saris: ${response.data.data.activeSaris}`);
    } else {
      logTest('GET /api/dashboard/overview', false, 'Unexpected response format');
    }
  } catch (error) {
    logTest('GET /api/dashboard/overview', false, error.message);
  }
}

async function testCustomerEndpoints() {
  try {
    // Test GET /api/customers
    const response = await axios.get(`${BASE_URL}/api/customers`, testConfig);
    
    if (response.status === 200 && response.data.success) {
      logTest('GET /api/customers', true);
      console.log(`   Total Customers: ${response.data.data.length}`);
    } else {
      logTest('GET /api/customers', false, 'Unexpected response format');
    }
  } catch (error) {
    logTest('GET /api/customers', false, error.message);
  }
}

async function testSupplierEndpoints() {
  try {
    // Test GET /api/suppliers
    const response = await axios.get(`${BASE_URL}/api/suppliers`, testConfig);
    
    if (response.status === 200 && response.data.success) {
      logTest('GET /api/suppliers', true);
      console.log(`   Total Suppliers: ${response.data.data.length}`);
    } else {
      logTest('GET /api/suppliers', false, 'Unexpected response format');
    }
  } catch (error) {
    logTest('GET /api/suppliers', false, error.message);
  }
}

async function test404Endpoint() {
  try {
    const response = await axios.get(`${BASE_URL}/nonexistent`, testConfig);
    logTest('404 Handler', false, 'Should have returned 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logTest('404 Handler', true);
    } else {
      logTest('404 Handler', false, `Unexpected error: ${error.message}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Sari Inventory Backend API Tests...\n');
  console.log(`📍 Testing API at: ${BASE_URL}\n`);
  
  const startTime = Date.now();
  
  // Run all tests
  await testHealthEndpoint();
  await testRootEndpoint();
  await testSariEndpoints();
  await testMovementEndpoints();
  await testDashboardEndpoints();
  await testCustomerEndpoints();
  await testSupplierEndpoints();
  await test404Endpoint();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log('='.repeat(60));
  
  // Print failed tests if any
  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.message}`);
      });
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Check if server is running before starting tests
async function checkServerHealth() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log('✅ Server is running, starting tests...\n');
    await runAllTests();
  } catch (error) {
    console.error('❌ Server is not running or not accessible');
    console.error('   Please start the backend server first:');
    console.error('   cd backend && npm start');
    console.error('\n   Error details:', error.message);
    process.exit(1);
  }
}

// Start testing
checkServerHealth();
