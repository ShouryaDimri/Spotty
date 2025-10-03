// Comprehensive Bug Test for Spotty App
const axios = require('axios');

const BASE_URL = 'https://spotty-git-master-shouryadimris-projects.vercel.app/api';

const testEndpoint = async (name, method, endpoint, data = null, headers = {}) => {
  try {
    console.log(`\n🔍 Testing ${name}...`);
    
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${name}: WORKING (${response.status})`);
    if (response.data) {
      const dataStr = JSON.stringify(response.data);
      console.log(`   Data: ${dataStr.substring(0, 150)}${dataStr.length > 150 ? '...' : ''}`);
    }
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`❌ ${name}: NOT WORKING (${error.response?.status || 'ERROR'})`);
    console.log(`   Error: ${error.message}`);
    if (error.response?.data) {
      console.log(`   Response: ${JSON.stringify(error.response.data).substring(0, 150)}...`);
    }
    return { success: false, error: error.message, status: error.response?.status };
  }
};

const testUpload = async () => {
  console.log('\n🔍 Testing Upload Functionality...');
  
  // Test 1: Test Upload Endpoint
  const testUploadResult = await testEndpoint('Test Upload Endpoint', 'POST', '/admin/test-upload');
  
  // Test 2: Upload Song (with mock data)
  try {
    console.log('\n🔍 Testing Upload Song...');
    const formData = new FormData();
    formData.append('title', 'Test Song');
    formData.append('artist', 'Test Artist');
    formData.append('duration', '180');
    
    const uploadResponse = await axios.post(`${BASE_URL}/admin/upload-song`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000
    });
    
    console.log('✅ Upload Song: WORKING (200)');
    console.log('   Response:', uploadResponse.data);
    return { success: true, data: uploadResponse.data };
  } catch (error) {
    console.log('❌ Upload Song: NOT WORKING');
    console.log('   Error:', error.message);
    console.log('   Status:', error.response?.status);
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
    return { success: false, error: error.message, status: error.response?.status };
  }
};

const runComprehensiveTest = async () => {
  console.log('🎯 COMPREHENSIVE BUG TEST FOR SPOTTY APP');
  console.log('=' .repeat(60));
  console.log('Testing all functionality to identify and fix bugs...\n');
  
  const results = {
    basic: [],
    database: [],
    upload: [],
    chat: [],
    admin: []
  };
  
  // Basic API Tests
  console.log('📡 BASIC API TESTS');
  console.log('-'.repeat(30));
  results.basic.push(await testEndpoint('Health Check', 'GET', '/health'));
  results.basic.push(await testEndpoint('Test Endpoint', 'GET', '/test'));
  
  // Database Tests
  console.log('\n🗄️ DATABASE TESTS');
  console.log('-'.repeat(30));
  results.database.push(await testEndpoint('Get All Users', 'GET', '/users'));
  results.database.push(await testEndpoint('Get All Songs', 'GET', '/songs'));
  results.database.push(await testEndpoint('Get Statistics', 'GET', '/statistics'));
  results.database.push(await testEndpoint('Get All Albums', 'GET', '/albums'));
  results.database.push(await testEndpoint('Get All Messages', 'GET', '/messages/all'));
  
  // Upload Tests
  console.log('\n📤 UPLOAD TESTS');
  console.log('-'.repeat(30));
  const uploadResult = await testUpload();
  results.upload.push(uploadResult);
  
  // Chat Tests
  console.log('\n💬 CHAT TESTS');
  console.log('-'.repeat(30));
  results.chat.push(await testEndpoint('Get Messages', 'GET', '/messages/all'));
  
  // Admin Tests
  console.log('\n👑 ADMIN TESTS');
  console.log('-'.repeat(30));
  results.admin.push(await testEndpoint('Admin Songs', 'GET', '/admin/songs'));
  results.admin.push(await testEndpoint('Admin Albums', 'GET', '/admin/albums'));
  results.admin.push(await testEndpoint('Admin Statistics', 'GET', '/statistics'));
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(60));
  
  const categories = [
    { name: 'Basic API', tests: results.basic },
    { name: 'Database', tests: results.database },
    { name: 'Upload', tests: results.upload },
    { name: 'Chat', tests: results.chat },
    { name: 'Admin', tests: results.admin }
  ];
  
  let totalWorking = 0;
  let totalTests = 0;
  
  categories.forEach(category => {
    const working = category.tests.filter(t => t.success).length;
    const total = category.tests.length;
    totalWorking += working;
    totalTests += total;
    
    console.log(`\n${category.name}: ${working}/${total} (${Math.round((working/total)*100)}%)`);
    category.tests.forEach(test => {
      if (!test.success) {
        console.log(`  ❌ ${test.error} (${test.status || 'ERROR'})`);
      }
    });
  });
  
  console.log(`\n🎯 OVERALL: ${totalWorking}/${totalTests} (${Math.round((totalWorking/totalTests)*100)}%)`);
  
  // Identify critical issues
  console.log('\n🚨 CRITICAL ISSUES TO FIX:');
  console.log('-'.repeat(40));
  
  const criticalIssues = [];
  
  if (results.upload.some(t => !t.success)) {
    criticalIssues.push('❌ Upload functionality not working');
  }
  
  if (results.database.some(t => !t.success)) {
    criticalIssues.push('❌ Database queries failing');
  }
  
  if (results.chat.some(t => !t.success)) {
    criticalIssues.push('❌ Chat functionality not working');
  }
  
  if (criticalIssues.length === 0) {
    console.log('✅ No critical issues found! App is working properly.');
  } else {
    criticalIssues.forEach(issue => console.log(issue));
  }
  
  console.log('\n🎯 Comprehensive bug test complete!');
  
  return {
    totalWorking,
    totalTests,
    successRate: Math.round((totalWorking/totalTests)*100),
    criticalIssues
  };
};

runComprehensiveTest().catch(console.error);
