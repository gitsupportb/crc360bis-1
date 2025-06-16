/**
 * BCP Securities Services - Migration Verification Script
 * 
 * This script verifies that the migration to centralized reporting data
 * has been completed successfully and all components are working correctly.
 */

class MigrationVerifier {
  constructor() {
    this.results = [];
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Run complete migration verification
   */
  async runVerification() {
    console.log('🔍 Starting Migration Verification...');
    console.log('=' .repeat(50));

    try {
      // Test 1: Verify centralized data loading
      await this.testCentralizedDataLoading();

      // Test 2: Verify data integrity
      await this.testDataIntegrity();

      // Test 3: Verify component integration
      await this.testComponentIntegration();

      // Test 4: Verify backward compatibility
      await this.testBackwardCompatibility();

      // Test 5: Verify file structure
      await this.testFileStructure();

      // Test 6: Verify email system
      await this.testEmailSystem();

      // Generate final report
      this.generateReport();

    } catch (error) {
      console.error('❌ Verification failed:', error);
      this.errors.push(`Verification failed: ${error.message}`);
      this.generateReport();
    }
  }

  /**
   * Test centralized data loading
   */
  async testCentralizedDataLoading() {
    console.log('📊 Testing centralized data loading...');

    try {
      // Check if reporting data manager exists
      if (!window.reportingDataManager) {
        throw new Error('Reporting data manager not found');
      }

      // Load data
      await window.reportingDataManager.loadReportingData();
      
      // Get statistics
      const stats = await window.reportingDataManager.getStatistics();
      
      if (stats.total === 68) {
        this.addResult('✅ Centralized data loading', 'SUCCESS', `Loaded ${stats.total} reportings`);
      } else {
        this.addResult('❌ Centralized data loading', 'FAILED', `Expected 68 reportings, got ${stats.total}`);
      }

      // Verify category counts
      if (stats.byCategory.I.count === 26 && stats.byCategory.II.count === 23 && stats.byCategory.III.count === 19) {
        this.addResult('✅ Category counts', 'SUCCESS', 'All category counts correct');
      } else {
        this.addResult('❌ Category counts', 'FAILED', `Incorrect counts: I(${stats.byCategory.I.count}), II(${stats.byCategory.II.count}), III(${stats.byCategory.III.count})`);
      }

    } catch (error) {
      this.addResult('❌ Centralized data loading', 'ERROR', error.message);
    }
  }

  /**
   * Test data integrity
   */
  async testDataIntegrity() {
    console.log('🔍 Testing data integrity...');

    try {
      const validation = await window.reportingDataManager.validateData();
      
      if (validation.isValid) {
        this.addResult('✅ Data integrity', 'SUCCESS', 'All validation checks passed');
      } else {
        this.addResult('⚠️ Data integrity', 'WARNING', `${validation.errors.length} errors, ${validation.warnings.length} warnings`);
        validation.errors.forEach(error => this.errors.push(error));
        validation.warnings.forEach(warning => this.warnings.push(warning));
      }

    } catch (error) {
      this.addResult('❌ Data integrity', 'ERROR', error.message);
    }
  }

  /**
   * Test component integration
   */
  async testComponentIntegration() {
    console.log('🔗 Testing component integration...');

    // Test data integration manager
    if (window.dataIntegrationManager) {
      this.addResult('✅ Data Integration Manager', 'SUCCESS', 'Component available');
    } else {
      this.addResult('❌ Data Integration Manager', 'FAILED', 'Component not found');
    }

    // Test file manager
    if (window.fileManager) {
      this.addResult('✅ File Manager', 'SUCCESS', 'Component available');
    } else {
      this.addResult('⚠️ File Manager', 'WARNING', 'Component not found (may not be initialized)');
    }

    // Test email notification system
    if (window.emailNotificationSystem) {
      this.addResult('✅ Email Notification System', 'SUCCESS', 'Component available');
    } else {
      this.addResult('⚠️ Email Notification System', 'WARNING', 'Component not found (may not be initialized)');
    }
  }

  /**
   * Test backward compatibility
   */
  async testBackwardCompatibility() {
    console.log('🔄 Testing backward compatibility...');

    try {
      // Test legacy format conversion
      const legacyI = await window.reportingDataManager.getLegacyFormat('I');
      const legacyII = await window.reportingDataManager.getLegacyFormat('II');
      const legacyIII = await window.reportingDataManager.getLegacyFormat('III');

      if (legacyI.length === 26 && legacyII.length === 23 && legacyIII.length === 19) {
        this.addResult('✅ Legacy format conversion', 'SUCCESS', 'All legacy formats working');
      } else {
        this.addResult('❌ Legacy format conversion', 'FAILED', `Incorrect legacy counts: I(${legacyI.length}), II(${legacyII.length}), III(${legacyIII.length})`);
      }

      // Test search functionality
      const searchResults = await window.reportingDataManager.searchReportings('LCR');
      if (searchResults.length > 0) {
        this.addResult('✅ Search functionality', 'SUCCESS', `Found ${searchResults.length} results for 'LCR'`);
      } else {
        this.addResult('⚠️ Search functionality', 'WARNING', 'No search results found for LCR');
      }

    } catch (error) {
      this.addResult('❌ Backward compatibility', 'ERROR', error.message);
    }
  }

  /**
   * Test file structure
   */
  async testFileStructure() {
    console.log('📁 Testing file structure...');

    try {
      // Test folder name generation
      const folderName = await window.reportingDataManager.getFolderName('331');
      if (folderName) {
        this.addResult('✅ Folder name generation', 'SUCCESS', `LCR folder: ${folderName}`);
      } else {
        this.addResult('⚠️ Folder name generation', 'WARNING', 'Could not find folder name for LCR (ID: 331)');
      }

      // Test category metadata
      const categoryMetadata = await window.reportingDataManager.getCategoryMetadata('III');
      if (categoryMetadata && categoryMetadata.name) {
        this.addResult('✅ Category metadata', 'SUCCESS', `Category III: ${categoryMetadata.name}`);
      } else {
        this.addResult('❌ Category metadata', 'FAILED', 'Could not retrieve category metadata');
      }

    } catch (error) {
      this.addResult('❌ File structure', 'ERROR', error.message);
    }
  }

  /**
   * Test email system
   */
  async testEmailSystem() {
    console.log('📧 Testing email system...');

    try {
      // Check if email system can access centralized data
      if (window.emailNotificationSystem && window.emailNotificationSystem.reportingDataLoaded) {
        this.addResult('✅ Email system data access', 'SUCCESS', 'Email system has access to centralized data');
      } else {
        this.addResult('⚠️ Email system data access', 'WARNING', 'Email system may not have centralized data access');
      }

    } catch (error) {
      this.addResult('❌ Email system', 'ERROR', error.message);
    }
  }

  /**
   * Add result to verification
   */
  addResult(test, status, message) {
    this.results.push({ test, status, message, timestamp: new Date() });
    console.log(`${status === 'SUCCESS' ? '✅' : status === 'WARNING' ? '⚠️' : '❌'} ${test}: ${message}`);
  }

  /**
   * Generate final verification report
   */
  generateReport() {
    console.log('\n' + '=' .repeat(50));
    console.log('📋 MIGRATION VERIFICATION REPORT');
    console.log('=' .repeat(50));

    const successCount = this.results.filter(r => r.status === 'SUCCESS').length;
    const warningCount = this.results.filter(r => r.status === 'WARNING').length;
    const errorCount = this.results.filter(r => r.status === 'ERROR' || r.status === 'FAILED').length;

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successful tests: ${successCount}`);
    console.log(`⚠️ Warnings: ${warningCount}`);
    console.log(`❌ Errors/Failures: ${errorCount}`);
    console.log(`📝 Total tests: ${this.results.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 MIGRATION VERIFICATION: PASSED');
      console.log('✅ All critical tests successful');
    } else {
      console.log('\n⚠️ MIGRATION VERIFICATION: ISSUES FOUND');
      console.log('❌ Some tests failed - review errors above');
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n' + '=' .repeat(50));

    // Store results for later access
    window.migrationVerificationResults = {
      summary: { successCount, warningCount, errorCount, total: this.results.length },
      results: this.results,
      warnings: this.warnings,
      errors: this.errors,
      timestamp: new Date(),
      passed: errorCount === 0
    };
  }
}

// Auto-run verification if this script is loaded directly
if (typeof window !== 'undefined') {
  window.MigrationVerifier = MigrationVerifier;
  
  // Auto-run after a short delay to ensure other components are loaded
  setTimeout(async () => {
    if (window.reportingDataManager) {
      const verifier = new MigrationVerifier();
      await verifier.runVerification();
    } else {
      console.log('⚠️ Reporting data manager not available - verification skipped');
    }
  }, 2000);
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MigrationVerifier;
}
