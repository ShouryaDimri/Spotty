#!/usr/bin/env node

/**
 * 360-Degree Comprehensive Check for Spotty App
 * Tests all UI, API, and functionality aspects
 */

import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';

const API_BASE_URL = 'http://localhost:5137/api';
const FRONTEND_URL = 'http://localhost:5173';

console.log('🔍 SPOTTY 360-DEGREE COMPREHENSIVE CHECK');
console.log('=' .repeat(50));

let allTestsPassed = true;
const testResults = {
    backend: { passed: 0, failed: 0, tests: [] },
    frontend: { passed: 0, failed: 0, tests: [] },
    integration: { passed: 0, failed: 0, tests: [] },
    ui: { passed: 0, failed: 0, tests: [] }
};

// Test helper function
function runTest(category, testName, testFn) {
    try {
        const result = testFn();
        if (result) {
            testResults[category].passed++;
            testResults[category].tests.push(`✅ ${testName}`);
            console.log(`✅ ${testName}`);
        } else {
            testResults[category].failed++;
            testResults[category].tests.push(`❌ ${testName}`);
            console.log(`❌ ${testName}`);
            allTestsPassed = false;
        }
    } catch (error) {
        testResults[category].failed++;
        testResults[category].tests.push(`❌ ${testName} - ${error.message}`);
        console.log(`❌ ${testName} - ${error.message}`);
        allTestsPassed = false;
    }
}

// Backend API Tests
console.log('\n🔧 BACKEND API TESTS');
console.log('-'.repeat(30));

// Test 1: Health Check
runTest('backend', 'Health Check', () => {
    try {
        const response = axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
        return response.status === 200;
    } catch (error) {
        return false;
    }
});

// Test 2: MongoDB Connection
runTest('backend', 'MongoDB Connection', () => {
    try {
        const response = axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
        return response.data.includes('MongoDB') && response.data.includes('Connected');
    } catch (error) {
        return false;
    }
});

// Test 3: Songs API
runTest('backend', 'Songs API - Get All Songs', () => {
    try {
        const response = axios.get(`${API_BASE_URL}/songs`, { timeout: 10000 });
        return response.status === 200 && Array.isArray(response.data);
    } catch (error) {
        return false;
    }
});

// Test 4: Albums API
runTest('backend', 'Albums API - Get All Albums', () => {
    try {
        const response = axios.get(`${API_BASE_URL}/albums`, { timeout: 10000 });
        return response.status === 200 && Array.isArray(response.data);
    } catch (error) {
        return false;
    }
});

// Test 5: User Status API
runTest('backend', 'User Status API - Get Statuses', () => {
    try {
        const response = axios.get(`${API_BASE_URL}/user-status`, { timeout: 10000 });
        return response.status === 200;
    } catch (error) {
        return false;
    }
});

// Test 6: Search API
runTest('backend', 'Search API - Songs Search', () => {
    try {
        const response = axios.get(`${API_BASE_URL}/songs/search?q=test`, { timeout: 10000 });
        return response.status === 200 && Array.isArray(response.data);
    } catch (error) {
        return false;
    }
});

// Test 7: Admin API
runTest('backend', 'Admin API - Get Songs', () => {
    try {
        const response = axios.get(`${API_BASE_URL}/admin/songs`, { timeout: 10000 });
        return response.status === 200 && Array.isArray(response.data);
    } catch (error) {
        return false;
    }
});

// Test 8: Messages API
runTest('backend', 'Messages API - Get All Messages', () => {
    try {
        const response = axios.get(`${API_BASE_URL}/messages/all`, { timeout: 10000 });
        return response.status === 200 && Array.isArray(response.data);
    } catch (error) {
        return false;
    }
});

// Frontend Tests
console.log('\n🎨 FRONTEND TESTS');
console.log('-'.repeat(30));

// Test 9: Frontend Build Check
runTest('frontend', 'Frontend Build Check', () => {
    try {
        const distExists = fs.existsSync('./frontend/dist');
        return distExists;
    } catch (error) {
        return false;
    }
});

// Test 10: Frontend Dependencies
runTest('frontend', 'Frontend Dependencies Check', () => {
    try {
        const packageJson = JSON.parse(fs.readFileSync('./frontend/package.json', 'utf8'));
        const requiredDeps = ['react', 'typescript', 'vite', 'tailwindcss'];
        return requiredDeps.every(dep => packageJson.dependencies[dep] || packageJson.devDependencies[dep]);
    } catch (error) {
        return false;
    }
});

// Test 11: TypeScript Compilation
runTest('frontend', 'TypeScript Compilation Check', () => {
    try {
        execSync('cd frontend && npx tsc --noEmit', { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
});

// Integration Tests
console.log('\n🔗 INTEGRATION TESTS');
console.log('-'.repeat(30));

// Test 12: API Response Format
runTest('integration', 'API Response Format Validation', () => {
    try {
        const response = axios.get(`${API_BASE_URL}/songs`, { timeout: 10000 });
        const songs = response.data;
        if (!Array.isArray(songs)) return false;
        
        // Check if songs have required fields
        if (songs.length > 0) {
            const song = songs[0];
            const requiredFields = ['_id', 'title', 'artist', 'audioUrl', 'imageUrl'];
            return requiredFields.every(field => song.hasOwnProperty(field));
        }
        return true;
    } catch (error) {
        return false;
    }
});

// Test 13: Search Integration
runTest('integration', 'Search Integration Test', () => {
    try {
        const response = axios.get(`${API_BASE_URL}/songs/search?q=test`, { timeout: 10000 });
        return response.status === 200 && Array.isArray(response.data);
    } catch (error) {
        return false;
    }
});

// Test 14: Admin Integration
runTest('integration', 'Admin Integration Test', () => {
    try {
        const response = axios.get(`${API_BASE_URL}/admin/songs`, { timeout: 10000 });
        return response.status === 200 && Array.isArray(response.data);
    } catch (error) {
        return false;
    }
});

// UI Tests
console.log('\n🎭 UI TESTS');
console.log('-'.repeat(30));

// Test 15: CSS Files Check
runTest('ui', 'CSS Files Check', () => {
    try {
        const indexCss = fs.existsSync('./frontend/src/index.css');
        return indexCss;
    } catch (error) {
        return false;
    }
});

// Test 16: Component Files Check
runTest('ui', 'Component Files Check', () => {
    try {
        const audioPlayer = fs.existsSync('./frontend/src/components/ui/AudioPlayer.tsx');
        const topbar = fs.existsSync('./frontend/src/components/ui/topbar.tsx');
        const friendsActivity = fs.existsSync('./frontend/src/components/ui/FriendsActivity.tsx');
        return audioPlayer && topbar && friendsActivity;
    } catch (error) {
        return false;
    }
});

// Test 17: Page Files Check
runTest('ui', 'Page Files Check', () => {
    try {
        const homePage = fs.existsSync('./frontend/src/pages/home/homPg.tsx');
        const adminPage = fs.existsSync('./frontend/src/pages/admin/AdminPg.tsx');
        const searchPage = fs.existsSync('./frontend/src/pages/search/SearchPg.tsx');
        const chatPage = fs.existsSync('./frontend/src/pages/Chatpage/ChatPg.tsx');
        return homePage && adminPage && searchPage && chatPage;
    } catch (error) {
        return false;
    }
});

// Test 18: Store Files Check
runTest('ui', 'Store Files Check', () => {
    try {
        const playerStore = fs.existsSync('./frontend/src/stores/usePlayerStore.ts');
        const musicStore = fs.existsSync('./frontend/src/stores/useMusicStore.ts');
        return playerStore && musicStore;
    } catch (error) {
        return false;
    }
});

// Test 19: Layout Files Check
runTest('ui', 'Layout Files Check', () => {
    try {
        const mainLayout = fs.existsSync('./frontend/src/layouts/MainLayout.tsx');
        return mainLayout;
    } catch (error) {
        return false;
    }
});

// Test 20: TypeScript Types Check
runTest('ui', 'TypeScript Types Check', () => {
    try {
        const typesFile = fs.existsSync('./frontend/src/types/index.ts');
        return typesFile;
    } catch (error) {
        return false;
    }
});

// Performance Tests
console.log('\n⚡ PERFORMANCE TESTS');
console.log('-'.repeat(30));

// Test 21: API Response Time
runTest('integration', 'API Response Time Check', () => {
    try {
        const startTime = Date.now();
        const response = axios.get(`${API_BASE_URL}/songs`, { timeout: 10000 });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        return responseTime < 5000; // Should respond within 5 seconds
    } catch (error) {
        return false;
    }
});

// Test 22: Search Performance
runTest('integration', 'Search Performance Check', () => {
    try {
        const startTime = Date.now();
        const response = axios.get(`${API_BASE_URL}/songs/search?q=test`, { timeout: 10000 });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        return responseTime < 3000; // Search should be fast
    } catch (error) {
        return false;
    }
});

// Final Results
console.log('\n📊 COMPREHENSIVE TEST RESULTS');
console.log('=' .repeat(50));

Object.keys(testResults).forEach(category => {
    const { passed, failed, tests } = testResults[category];
    const total = passed + failed;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    console.log(`\n${category.toUpperCase()}: ${passed}/${total} passed (${percentage}%)`);
    tests.forEach(test => console.log(`  ${test}`));
});

const totalPassed = Object.values(testResults).reduce((sum, cat) => sum + cat.passed, 0);
const totalFailed = Object.values(testResults).reduce((sum, cat) => sum + cat.failed, 0);
const totalTests = totalPassed + totalFailed;
const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

console.log(`\n🎯 OVERALL RESULTS: ${totalPassed}/${totalTests} passed (${overallPercentage}%)`);

if (allTestsPassed && overallPercentage >= 95) {
    console.log('\n✅ ALL TESTS PASSED! App is 100% working and ready for deployment!');
    console.log('🚀 Ready to push changes!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please fix issues before deploying.');
    console.log(`📈 Success rate: ${overallPercentage}%`);
    process.exit(1);
}
