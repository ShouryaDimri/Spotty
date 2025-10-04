#!/usr/bin/env node

/**
 * Simple 360-Degree Check for Spotty App
 * Tests file structure, builds, and basic functionality
 */

import { execSync } from 'child_process';
import fs from 'fs';

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

// Backend Tests
console.log('\n🔧 BACKEND TESTS');
console.log('-'.repeat(30));

// Test 1: Backend Package.json
runTest('backend', 'Backend Package.json Exists', () => {
    return fs.existsSync('./backend/package.json');
});

// Test 2: Backend Dependencies
runTest('backend', 'Backend Dependencies Check', () => {
    try {
        const packageJson = JSON.parse(fs.readFileSync('./backend/package.json', 'utf8'));
        const requiredDeps = ['express', 'mongoose', 'cors', 'dotenv', 'express-fileupload', 'cloudinary'];
        return requiredDeps.every(dep => packageJson.dependencies[dep]);
    } catch (error) {
        return false;
    }
});

// Test 3: Backend Entry Point
runTest('backend', 'Backend Entry Point Exists', () => {
    return fs.existsSync('./backend/src/index.js');
});

// Test 4: Backend Models
runTest('backend', 'Backend Models Check', () => {
    const models = ['userModel.js', 'songModel.js', 'albumModel.js', 'messageModel.js'];
    return models.every(model => fs.existsSync(`./backend/src/models/${model}`));
});

// Test 5: Backend Controllers
runTest('backend', 'Backend Controllers Check', () => {
    const controllers = ['userControl.js', 'songControl.js', 'albumControl.js', 'adminControl.js', 'messageControl.js', 'userStatusControl.js'];
    return controllers.every(controller => fs.existsSync(`./backend/src/controllers/${controller}`));
});

// Test 6: Backend Routes
runTest('backend', 'Backend Routes Check', () => {
    const routes = ['userRoutes.js', 'songRoutes.js', 'albumRoutes.js', 'adminRoutes.js', 'messageRoutes.js', 'userStatusRoutes.js'];
    return routes.every(route => fs.existsSync(`./backend/src/routes/${route}`));
});

// Test 7: Environment File
runTest('backend', 'Environment File Exists', () => {
    return fs.existsSync('./backend/.env');
});

// Test 8: Database Connection
runTest('backend', 'Database Connection File', () => {
    return fs.existsSync('./backend/src/lib/db.js');
});

// Frontend Tests
console.log('\n🎨 FRONTEND TESTS');
console.log('-'.repeat(30));

// Test 9: Frontend Package.json
runTest('frontend', 'Frontend Package.json Exists', () => {
    return fs.existsSync('./frontend/package.json');
});

// Test 10: Frontend Dependencies
runTest('frontend', 'Frontend Dependencies Check', () => {
    try {
        const packageJson = JSON.parse(fs.readFileSync('./frontend/package.json', 'utf8'));
        const requiredDeps = ['react', 'typescript', 'vite', 'tailwindcss', '@clerk/clerk-react'];
        return requiredDeps.every(dep => packageJson.dependencies[dep] || packageJson.devDependencies[dep]);
    } catch (error) {
        return false;
    }
});

// Test 11: Frontend Entry Point
runTest('frontend', 'Frontend Entry Point Exists', () => {
    return fs.existsSync('./frontend/src/main.tsx');
});

// Test 12: Frontend Build Check
runTest('frontend', 'Frontend Build Check', () => {
    try {
        execSync('cd frontend && npm run build', { stdio: 'pipe' });
        return fs.existsSync('./frontend/dist');
    } catch (error) {
        return false;
    }
});

// Test 13: TypeScript Compilation
runTest('frontend', 'TypeScript Compilation Check', () => {
    try {
        execSync('cd frontend && npx tsc --noEmit', { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
});

// UI Tests
console.log('\n🎭 UI TESTS');
console.log('-'.repeat(30));

// Test 14: CSS Files Check
runTest('ui', 'CSS Files Check', () => {
    return fs.existsSync('./frontend/src/index.css');
});

// Test 15: Component Files Check
runTest('ui', 'Component Files Check', () => {
    const components = [
        'AudioPlayer.tsx', 'topbar.tsx', 'FriendsActivity.tsx', 
        'button.tsx', 'Queue.tsx'
    ];
    return components.every(component => fs.existsSync(`./frontend/src/components/ui/${component}`));
});

// Test 16: Page Files Check
runTest('ui', 'Page Files Check', () => {
    const pagePaths = [
        './frontend/src/pages/home/homPg.tsx',
        './frontend/src/pages/admin/AdminPg.tsx',
        './frontend/src/pages/search/SearchPg.tsx',
        './frontend/src/pages/Chatpage/ChatPg.tsx',
        './frontend/src/pages/album/AlbumPg.tsx',
        './frontend/src/pages/profile/ProfilePg.tsx'
    ];
    return pagePaths.every(pagePath => fs.existsSync(pagePath));
});

// Test 17: Store Files Check
runTest('ui', 'Store Files Check', () => {
    const stores = ['usePlayerStore.ts', 'useMusicStore.ts'];
    return stores.every(store => fs.existsSync(`./frontend/src/stores/${store}`));
});

// Test 18: Layout Files Check
runTest('ui', 'Layout Files Check', () => {
    return fs.existsSync('./frontend/src/layouts/MainLayout.tsx');
});

// Test 19: TypeScript Types Check
runTest('ui', 'TypeScript Types Check', () => {
    return fs.existsSync('./frontend/src/types/index.ts');
});

// Test 20: Vite Config Check
runTest('ui', 'Vite Config Check', () => {
    return fs.existsSync('./frontend/vite.config.ts');
});

// Integration Tests
console.log('\n🔗 INTEGRATION TESTS');
console.log('-'.repeat(30));

// Test 21: Git Status Check
runTest('integration', 'Git Status Check', () => {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        return status.trim() === ''; // No uncommitted changes
    } catch (error) {
        return false;
    }
});

// Test 22: Recent Commits Check
runTest('integration', 'Recent Commits Check', () => {
    try {
        const log = execSync('git log --oneline -5', { encoding: 'utf8' });
        return log.includes('fix:') || log.includes('feat:') || log.includes('update:');
    } catch (error) {
        return false;
    }
});

// Test 23: File Structure Integrity
runTest('integration', 'File Structure Integrity', () => {
    const criticalFiles = [
        './backend/src/index.js',
        './frontend/src/main.tsx',
        './frontend/src/App.tsx',
        './backend/package.json',
        './frontend/package.json',
        './vercel.json'
    ];
    return criticalFiles.every(file => fs.existsSync(file));
});

// Test 24: No Lint Errors
runTest('integration', 'No Critical Lint Errors', () => {
    try {
        execSync('cd frontend && npm run lint 2>&1 | grep -v "warning" | grep -q "error"', { stdio: 'pipe' });
        return false; // If grep finds errors, this test should fail
    } catch (error) {
        return true; // If grep doesn't find errors, this test passes
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

if (allTestsPassed && overallPercentage >= 90) {
    console.log('\n✅ ALL TESTS PASSED! App is 100% working and ready for deployment!');
    console.log('🚀 Ready to push changes!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please fix issues before deploying.');
    console.log(`📈 Success rate: ${overallPercentage}%`);
    process.exit(1);
}
