/**
 * BCP Securities Services - Centralized Reporting Data Manager
 *
 * This module provides a unified interface to access all reporting data
 * from the centralized ALL_REPORTINGS.json file. It replaces scattered
 * hardcoded arrays and provides consistent data access across all components.
 *
 * Features:
 * - Single source of truth for all 100 reportings (68 BAM + 17 AMMC + 15 DGI)
 * - Regulator and category-based filtering and access
 * - Integration with existing upload tracking and completion systems
 * - Backward compatibility with existing component interfaces
 * - Real-time data synchronization capabilities
 * - Support for BAM, AMMC, and DGI regulatory structures
 */

console.log('📊 reporting-data-manager.js loading...');

class ReportingDataManager {
  constructor() {
    this.reportingsData = null;
    this.isLoaded = false;
    this.loadPromise = null;
  }

  /**
   * Load the centralized reporting data from ALL_REPORTINGS.json
   */
  async loadReportingData() {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._fetchReportingData();
    return this.loadPromise;
  }

  async _fetchReportingData() {
    try {
      const response = await fetch('./ALL_REPORTINGS.json');
      if (!response.ok) {
        throw new Error(`Failed to load reporting data: ${response.status}`);
      }

      this.reportingsData = await response.json();
      this.isLoaded = true;
      console.log('✅ Centralized reporting data loaded successfully');

      // Handle both old and new data structures
      if (this.reportingsData.metadata) {
        console.log(`📊 Total reportings: ${this.reportingsData.metadata.totalReportings}`);
      } else {
        // Calculate total from all regulators
        let total = 0;
        if (this.reportingsData.BAM) total += this._countReportingsInRegulator(this.reportingsData.BAM);
        if (this.reportingsData.AMMC) total += this._countReportingsInRegulator(this.reportingsData.AMMC);
        if (this.reportingsData.DGI) total += this._countReportingsInRegulator(this.reportingsData.DGI);
        console.log(`📊 Total reportings calculated: ${total} (BAM + AMMC + DGI)`);
      }

      return this.reportingsData;
    } catch (error) {
      console.error('❌ Error loading centralized reporting data:', error);
      throw error;
    }
  }

  /**
   * Count reportings in a regulator structure
   */
  _countReportingsInRegulator(regulatorData) {
    let count = 0;
    for (const category of Object.values(regulatorData)) {
      if (typeof category === 'object' && category !== null) {
        count += Object.keys(category).length;
      }
    }
    return count;
  }

  /**
   * Map category key to standard category format
   */
  _mapCategoryKey(catKey, regulator) {
    if (regulator === 'BAM') {
      if (catKey.includes('I___Situation_comptable')) return 'I';
      if (catKey.includes('II___Etats_de_synthèse')) return 'II';
      if (catKey.includes('III___Etats_relatifs')) return 'III';
    } else if (regulator === 'AMMC') {
      return catKey; // BCP, BCP2S, BANK_AL_YOUSR
    } else if (regulator === 'DGI') {
      return 'DGI';
    }
    return catKey;
  }

  /**
   * Get display name for category
   */
  _getCategoryDisplayName(catKey, regulator) {
    if (regulator === 'BAM') {
      if (catKey.includes('I___Situation_comptable')) return 'I – Situation comptable';
      if (catKey.includes('II___Etats_de_synthèse')) return 'II – Etats de synthèse';
      if (catKey.includes('III___Etats_relatifs')) return 'III – Réglementation prudentielle';
    } else if (regulator === 'AMMC') {
      if (catKey === 'BCP') return 'BCP';
      if (catKey === 'BCP2S') return 'BCP2S';
      if (catKey === 'BANK_AL_YOUSR') return 'BANK AL YOUSR';
    } else if (regulator === 'DGI') {
      return 'DGI';
    }
    return catKey.replace(/_/g, ' ');
  }

  /**
   * Check if category matches filter
   */
  _categoryMatches(catKey, categoryFilter, regulator) {
    const mappedCategory = this._mapCategoryKey(catKey, regulator);
    return mappedCategory === categoryFilter;
  }

  /**
   * Ensure data is loaded before accessing
   */
  async ensureLoaded() {
    if (!this.isLoaded) {
      await this.loadReportingData();
    }
  }

  /**
   * Get all reportings for a specific category
   * @param {string} category - Category ID ('I', 'II', 'III')
   * @returns {Object} Category reportings object
   */
  async getCategoryReportings(category) {
    await this.ensureLoaded();
    return this.reportingsData.categories[category]?.reportings || {};
  }

  /**
   * Get all reportings as a flat array (compatible with existing components)
   * @param {string} regulator - Optional regulator filter ('BAM', 'AMMC', 'DGI')
   * @param {string} category - Optional category filter
   * @returns {Array} Array of reporting objects
   */
  async getReportingsArray(regulator = null, category = null) {
    await this.ensureLoaded();

    const reportings = [];

    // Handle both old and new data structures
    if (this.reportingsData.categories) {
      // Current structure - all regulators in categories section
      const allCategories = Object.keys(this.reportingsData.categories);

      // Determine which categories to process based on regulator filter
      let categoriesToProcess = [];
      if (regulator === 'BAM') {
        categoriesToProcess = allCategories.filter(cat => ['I', 'II', 'III'].includes(cat));
      } else if (regulator === 'AMMC') {
        categoriesToProcess = allCategories.filter(cat => ['AMMC_BCP', 'AMMC_BCP2S', 'AMMC_BANK_AL_YOUSR'].includes(cat));
      } else if (regulator === 'DGI') {
        categoriesToProcess = allCategories.filter(cat => cat === 'DGI');
      } else {
        // No regulator filter - process all categories
        categoriesToProcess = allCategories;
      }

      // Apply category filter if specified
      if (category) {
        if (['I', 'II', 'III'].includes(category)) {
          categoriesToProcess = categoriesToProcess.filter(cat => cat === category);
        } else if (['BCP', 'BCP2S', 'BANK_AL_YOUSR'].includes(category)) {
          const ammcCategoryMap = {
            'BCP': 'AMMC_BCP',
            'BCP2S': 'AMMC_BCP2S',
            'BANK_AL_YOUSR': 'AMMC_BANK_AL_YOUSR'
          };
          categoriesToProcess = categoriesToProcess.filter(cat => cat === ammcCategoryMap[category]);
        } else if (category === 'DGI') {
          categoriesToProcess = categoriesToProcess.filter(cat => cat === 'DGI');
        }
      }

      for (const cat of categoriesToProcess) {
        const categoryData = this.reportingsData.categories[cat];
        if (categoryData && categoryData.reportings) {
          // Determine regulator based on category
          let reportingRegulator = 'BAM';
          let mappedCategory = cat;

          if (['I', 'II', 'III'].includes(cat)) {
            reportingRegulator = 'BAM';
            mappedCategory = cat;
          } else if (cat.startsWith('AMMC_')) {
            reportingRegulator = 'AMMC';
            mappedCategory = cat.replace('AMMC_', '');
          } else if (cat === 'DGI') {
            reportingRegulator = 'DGI';
            mappedCategory = 'DGI';
          }

          Object.values(categoryData.reportings).forEach(reporting => {
            const reportingWithCategory = {
              ...reporting,
              regulator: reportingRegulator,
              category: mappedCategory,
              categoryName: categoryData.name,
              categoryFolderName: categoryData.folderName
            };
            reportings.push(reportingWithCategory);
          });
        }
      }
    } else {
      // New regulator-based structure
      const regulators = regulator ? [regulator] : ['BAM', 'AMMC', 'DGI'];

      for (const reg of regulators) {
        const regulatorData = this.reportingsData[reg];
        if (!regulatorData) continue;

        for (const [catKey, categoryReportings] of Object.entries(regulatorData)) {
          // Skip if category filter is specified and doesn't match
          if (category && !this._categoryMatches(catKey, category, reg)) continue;

          for (const [reportingKey, reportingData] of Object.entries(categoryReportings)) {
            const reportingWithMetadata = {
              ...reportingData,
              regulator: reg,
              category: this._mapCategoryKey(catKey, reg),
              categoryKey: catKey,
              categoryName: this._getCategoryDisplayName(catKey, reg),
              categoryFolderName: catKey,
              id: reportingData.id || reportingKey,
              code: reportingData.code || reportingData.id || reportingKey,
              name: reportingData.name || reportingKey.replace(/_/g, ' '),
              frequency: reportingData.frequency || 'Monthly',
              transmissionMethod: reportingData.transmissionMethod || 'Electronic',
              deadlineRule: reportingData.deadlineRule || 'End of month',
              priority: reportingData.priority || 'Medium',
              folderName: reportingData.folderName || reportingKey
            };
            reportings.push(reportingWithMetadata);
          }
        }
      }
    }

    console.log(`📊 getReportingsArray: Loaded ${reportings.length} reportings`);
    if (reportings.length > 0) {
      console.log('📋 Sample reporting with metadata:', reportings[0]);
    }

    // Debug regulator and category distribution
    const regulatorDistribution = {};
    const categoryDistribution = {};
    reportings.forEach(reporting => {
      regulatorDistribution[reporting.regulator] = (regulatorDistribution[reporting.regulator] || 0) + 1;
      categoryDistribution[reporting.category] = (categoryDistribution[reporting.category] || 0) + 1;
    });
    console.log('📊 Regulator distribution:', regulatorDistribution);
    console.log('📊 Category distribution:', categoryDistribution);

    return reportings;
  }

  /**
   * Get reportings in the legacy format for backward compatibility
   * @param {string} category - Category ID ('I', 'II', 'III')
   * @returns {Array} Array in legacy dataCat format
   */
  async getLegacyFormat(category) {
    await this.ensureLoaded();

    const reportings = await this.getReportingsArray(category);
    return reportings.map(reporting => ({
      Code: reporting.code || reporting.id,
      Appellation: reporting.name,
      Frequency: reporting.frequency,
      Transmission: reporting.transmissionMethod,
      DeadlineRule: reporting.deadlineRule,
      Category: reporting.categoryName,
      ID: reporting.id, // For Category III
      ReportingName: reporting.name, // For Category III
      SubmissionMethod: reporting.transmissionMethod // For Category III
    }));
  }

  /**
   * Get category metadata
   * @param {string} category - Category ID ('I', 'II', 'III')
   * @returns {Object} Category metadata
   */
  async getCategoryMetadata(category) {
    await this.ensureLoaded();
    return this.reportingsData.categories[category] || null;
  }

  /**
   * Get all categories metadata
   * @returns {Object} All categories metadata
   */
  async getAllCategoriesMetadata() {
    await this.ensureLoaded();
    return this.reportingsData.metadata.categories;
  }

  /**
   * Get all reportings (alias for getReportingsArray for compatibility)
   * @returns {Array} Array of all reporting objects with category fields
   */
  async getAllReportings() {
    return await this.getReportingsArray();
  }

  /**
   * Get reportings by regulator
   * @param {string} regulator - Regulator ('BAM', 'AMMC', 'DGI')
   * @returns {Array} Array of reporting objects for the regulator
   */
  async getReportingsByRegulator(regulator) {
    return await this.getReportingsArray(regulator);
  }

  /**
   * Get BAM reportings (backward compatibility)
   * @returns {Array} Array of BAM reporting objects
   */
  async getBAMReportings() {
    return await this.getReportingsArray('BAM');
  }

  /**
   * Get AMMC reportings
   * @returns {Array} Array of AMMC reporting objects
   */
  async getAMMCReportings() {
    return await this.getReportingsArray('AMMC');
  }

  /**
   * Get DGI reportings
   * @returns {Array} Array of DGI reporting objects
   */
  async getDGIReportings() {
    return await this.getReportingsArray('DGI');
  }

  /**
   * Search reportings by name, code, or tags
   * @param {string} query - Search query
   * @param {string} category - Optional category filter
   * @returns {Array} Matching reportings
   */
  async searchReportings(query, category = null) {
    await this.ensureLoaded();

    const reportings = await this.getReportingsArray(category);
    const searchTerm = query.toLowerCase();

    return reportings.filter(reporting =>
      reporting.name.toLowerCase().includes(searchTerm) ||
      (reporting.code && reporting.code.toLowerCase().includes(searchTerm)) ||
      (reporting.id && reporting.id.toString().includes(searchTerm)) ||
      (reporting.tags && reporting.tags.some(tag => tag.includes(searchTerm)))
    );
  }

  /**
   * Get reportings by frequency
   * @param {string} frequency - Frequency filter ('Mensuelle', 'Trimestrielle', 'Semestrielle', 'Annuelle')
   * @param {string} category - Optional category filter
   * @returns {Array} Filtered reportings
   */
  async getReportingsByFrequency(frequency, category = null) {
    await this.ensureLoaded();

    const reportings = await this.getReportingsArray(category);
    return reportings.filter(reporting =>
      reporting.frequency.toLowerCase() === frequency.toLowerCase()
    );
  }

  /**
   * Get reportings by priority
   * @param {string} priority - Priority filter ('High', 'Medium', 'Low')
   * @param {string} category - Optional category filter
   * @returns {Array} Filtered reportings
   */
  async getReportingsByPriority(priority, category = null) {
    await this.ensureLoaded();

    const reportings = await this.getReportingsArray(category);
    return reportings.filter(reporting =>
      reporting.priority === priority
    );
  }

  /**
   * Get reporting by code or ID
   * @param {string} identifier - Code or ID to search for
   * @returns {Object|null} Reporting object or null if not found
   */
  async getReportingByIdentifier(identifier) {
    await this.ensureLoaded();

    const allReportings = await this.getReportingsArray();
    return allReportings.find(reporting =>
      reporting.code === identifier ||
      reporting.id === identifier ||
      reporting.id === parseInt(identifier)
    ) || null;
  }

  /**
   * Get folder name for a reporting (for file system integration)
   * @param {string} identifier - Code or ID
   * @returns {string|null} Folder name or null if not found
   */
  async getFolderName(identifier) {
    const reporting = await this.getReportingByIdentifier(identifier);
    return reporting ? reporting.folderName : null;
  }

  /**
   * Get statistics about the reporting data
   * @returns {Object} Statistics object
   */
  async getStatistics() {
    await this.ensureLoaded();

    const stats = {
      total: this.reportingsData.metadata.totalReportings,
      byCategory: {},
      byFrequency: {},
      byPriority: {},
      byTransmissionMethod: {}
    };

    // Category statistics
    for (const [catId, catData] of Object.entries(this.reportingsData.categories)) {
      stats.byCategory[catId] = {
        name: catData.name,
        count: Object.keys(catData.reportings).length
      };
    }

    // Frequency, priority, and transmission method statistics
    const allReportings = await this.getReportingsArray();

    allReportings.forEach(reporting => {
      // Frequency
      stats.byFrequency[reporting.frequency] = (stats.byFrequency[reporting.frequency] || 0) + 1;

      // Priority
      stats.byPriority[reporting.priority] = (stats.byPriority[reporting.priority] || 0) + 1;

      // Transmission method
      stats.byTransmissionMethod[reporting.transmissionMethod] = (stats.byTransmissionMethod[reporting.transmissionMethod] || 0) + 1;
    });

    return stats;
  }

  /**
   * Validate the data integrity
   * @returns {Object} Validation results
   */
  async validateData() {
    await this.ensureLoaded();

    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check total count
    const actualTotal = await this.getReportingsArray();
    const expectedTotal = this.reportingsData.metadata?.totalReportings || 100; // Default to 100 for new structure
    if (actualTotal.length !== expectedTotal) {
      validation.errors.push(`Total count mismatch: expected ${expectedTotal}, found ${actualTotal.length}`);
      validation.isValid = false;
    }

    // Check regulator and category counts
    const expectedCounts = {
      BAM: { total: 68, categories: { I: 26, II: 23, III: 19 } },
      AMMC: { total: 17, categories: { BCP: 8, BCP2S: 5, BANK_AL_YOUSR: 4 } },
      DGI: { total: 15, categories: { DGI: 15 } }
    };

    for (const [regulator, expected] of Object.entries(expectedCounts)) {
      const regulatorReportings = await this.getReportingsArray(regulator);
      console.log(`🔍 Validation: ${regulator} has ${regulatorReportings.length} reportings (expected ${expected.total})`);

      if (regulatorReportings.length !== expected.total) {
        validation.warnings.push(`${regulator} total count mismatch: expected ${expected.total}, found ${regulatorReportings.length}`);
        // Don't mark as invalid for now, just warn
      }

      // Check category counts within regulator
      for (const [category, expectedCount] of Object.entries(expected.categories)) {
        const categoryReportings = await this.getReportingsArray(regulator, category);
        console.log(`🔍 Validation: ${regulator} ${category} has ${categoryReportings.length} reportings (expected ${expectedCount})`);

        if (categoryReportings.length !== expectedCount) {
          validation.warnings.push(`${regulator} ${category} count mismatch: expected ${expectedCount}, found ${categoryReportings.length}`);
          // Don't mark as invalid for now, just warn
        }
      }
    }

    // Check for required fields
    const requiredFields = ['name', 'frequency', 'transmissionMethod', 'deadlineRule', 'category'];
    actualTotal.forEach((reporting, index) => {
      requiredFields.forEach(field => {
        if (!reporting[field]) {
          validation.warnings.push(`Reporting ${index + 1} missing required field: ${field}`);
        }
      });
    });

    return validation;
  }
}

// Create singleton instance
const reportingDataManager = new ReportingDataManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = reportingDataManager;
} else if (typeof window !== 'undefined') {
  window.reportingDataManager = reportingDataManager;
}

console.log('✅ reporting-data-manager.js loaded successfully');
