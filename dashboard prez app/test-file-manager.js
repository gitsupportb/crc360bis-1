// Simple test file to check if JavaScript files can load
console.log('🧪 test-file-manager.js loading...');

try {
  console.log('🔧 Testing basic JavaScript execution in test file...');
  window.testFileManagerFlag = true;
  console.log('✅ Test file JavaScript execution working');
} catch (error) {
  console.error('❌ Test file JavaScript execution failed:', error);
}

// Simple test class
class TestFileManager {
  constructor() {
    console.log('🧪 TestFileManager constructor called');
    this.testProperty = 'working';
  }
  
  testMethod() {
    return 'test method working';
  }
}

// Make it globally available
window.TestFileManager = TestFileManager;

console.log('✅ test-file-manager.js loaded successfully');
