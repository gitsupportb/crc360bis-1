/**
 * BCP Securities Services - Comprehensive Data Integration Manager
 *
 * This module integrates all data sources to provide real-time, synchronized
 * reporting analytics across the entire dashboard system.
 *
 * Data Sources Integrated:
 * - Upload logs (upload-logs.js)
 * - File structure (file-manager.js)
 * - Checkbox completion states
 * - Centralized reporting definitions from ALL_REPORTINGS.json (68 total: 26+23+19)
 * - Real files in UPLOADED_REPORTINGS folder
 */

class DataIntegrationManager {
  constructor() {
    this.reportingDefinitions = null; // Will be loaded from centralized source
    this.completionStatus = null; // Will be initialized after loading definitions
    this.realTimeData = {
      lastUpdate: null,
      fileStructure: {},
      uploadLogs: [],
      checkboxStates: {},
      realFiles: {},
      statistics: {}
    };

    // Initialize integration
    this.initialize();
  }

  /**
   * Initialize the data integration system
   */
  async initialize() {
    console.log('🚀 Initializing Data Integration Manager...');

    try {
      // Load centralized reporting definitions first
      await this.loadCentralizedReportingDefinitions();

      // Initialize completion status after definitions are loaded
      this.completionStatus = this.initializeCompletionStatus();

      // Load all data sources
      await this.loadAllDataSources();

      // Set up real-time synchronization
      this.setupRealTimeSync();

      // Calculate initial statistics
      this.calculateComprehensiveStatistics();

      console.log('✅ Data Integration Manager initialized successfully');
      console.log('📊 Total reportings tracked:', this.getTotalReportingsCount());

    } catch (error) {
      console.error('❌ Error initializing Data Integration Manager:', error);
    }
  }

  /**
   * Load centralized reporting definitions from ALL_REPORTINGS.json
   */
  async loadCentralizedReportingDefinitions() {
    console.log('📊 Loading centralized reporting definitions...');

    try {
      // Use the reporting data manager to load centralized data
      if (!window.reportingDataManager) {
        // Load the reporting data manager if not already available
        const script = document.createElement('script');
        script.src = './reporting-data-manager.js';
        document.head.appendChild(script);

        // Wait for script to load
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Load the centralized data
      await window.reportingDataManager.loadReportingData();

      // Convert to the format expected by this class
      this.reportingDefinitions = await this.convertToLegacyFormat();

      console.log('✅ Centralized reporting definitions loaded successfully');
      console.log('📊 Categories loaded:', Object.keys(this.reportingDefinitions).length);

    } catch (error) {
      console.error('❌ Error loading centralized reporting definitions:', error);
      // Fallback to hardcoded definitions if centralized loading fails
      this.reportingDefinitions = this.getFallbackDefinitions();
    }
  }

  /**
   * Convert centralized data format to legacy format for backward compatibility
   */
  async convertToLegacyFormat() {
    const legacyFormat = {};

    // Get all categories from centralized data
    const categories = ['I', 'II', 'III'];

    for (const categoryId of categories) {
      const categoryData = await window.reportingDataManager.getCategoryMetadata(categoryId);
      const reportings = await window.reportingDataManager.getCategoryReportings(categoryId);

      if (categoryData && reportings) {
        legacyFormat[categoryData.folderName] = {};

        // Convert each reporting to legacy format
        Object.values(reportings).forEach(reporting => {
          legacyFormat[categoryData.folderName][reporting.folderName] = {
            deadline: this.convertFrequencyToDeadline(reporting.frequency),
            priority: reporting.priority,
            frequency: this.convertFrequencyToLegacy(reporting.frequency),
            code: reporting.code || reporting.id,
            transmissionMethod: reporting.transmissionMethod,
            deadlineRule: reporting.deadlineRule,
            originalData: reporting // Keep reference to original data
          };
        });
      }
    }

    return legacyFormat;
  }

  /**
   * Convert frequency from centralized format to legacy deadline format
   */
  convertFrequencyToDeadline(frequency) {
    const frequencyMap = {
      'Mensuelle': 'Monthly',
      'Trimestrielle': 'Quarterly',
      'Semestrielle': 'Semi-Annual',
      'Annuelle': 'Annual',
      'Annuelle ou changement': 'Annual'
    };
    return frequencyMap[frequency] || 'Monthly';
  }

  /**
   * Convert frequency from centralized format to legacy format
   */
  convertFrequencyToLegacy(frequency) {
    const frequencyMap = {
      'Mensuelle': 'Monthly',
      'Trimestrielle': 'Quarterly',
      'Semestrielle': 'Semi-Annual',
      'Annuelle': 'Annual',
      'Annuelle ou changement': 'Annual'
    };
    return frequencyMap[frequency] || 'Monthly';
  }

  /**
   * Fallback hardcoded definitions (reduced set for emergency use)
   */
  getFallbackDefinitions() {
    console.warn('⚠️ Using fallback hardcoded definitions');
    return {
      // Category I - Essential reportings only
      "I___Situation_comptable_et_états_annexes": {
        "Situation_Comptable_provisoire": { deadline: "Monthly", priority: "High", frequency: "Monthly" },
        "Situation_Comptable_définitive": { deadline: "Quarterly", priority: "High", frequency: "Quarterly" }
      },
      // Category II - Essential reportings only
      "II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires": {
        "Bilan": { deadline: "Semi-Annual", priority: "High", frequency: "Semi-Annual" },
        "Compte_de_produits_et_charges": { deadline: "Semi-Annual", priority: "High", frequency: "Semi-Annual" }
      },
      // Category III - Essential reportings only
      "III___Etats_relatifs_à_la_réglementation_prudentielle": {
        "Etat_LCR": { deadline: "Monthly", priority: "High", frequency: "Monthly" },
        "Reporting_COREP_individuel_et_Etats_des_fonds_propres": { deadline: "Semi-Annual", priority: "High", frequency: "Semi-Annual" }
      }
    };
  }

  /**
   * Initialize completion status tracking for all reportings
   */
  initializeCompletionStatus() {
    const status = {};

    for (const [category, reports] of Object.entries(this.reportingDefinitions)) {
      status[category] = {};
      for (const [reportName, reportInfo] of Object.entries(reports)) {
        status[category][reportName] = {
          // Track completion by month for the current year
          1: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false },
          2: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false },
          3: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false },
          4: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false },
          5: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false },
          6: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false },
          7: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false },
          8: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false },
          9: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false },
          10: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false },
          11: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false },
          12: { completed: false, uploadDate: null, checkboxChecked: false, hasRealFile: false }
        };
      }
    }

    return status;
  }

  /**
   * Load all data sources and synchronize them
   */
  async loadAllDataSources() {
    console.log('📊 Loading all data sources...');

    // Load upload logs
    if (window.uploadLogsManager) {
      this.realTimeData.uploadLogs = window.uploadLogsManager.getLogs();
      console.log('✅ Upload logs loaded:', this.realTimeData.uploadLogs.length, 'entries');
    }

    // Load file structure
    if (window.fileManager) {
      await window.fileManager.refresh();
      this.realTimeData.fileStructure = window.fileManager.fileStructure;
      console.log('✅ File structure loaded');
    }

    // Load checkbox states from localStorage
    this.loadCheckboxStates();

    // Detect real files
    this.detectRealFiles();

    // Synchronize all data sources
    this.synchronizeDataSources();
  }

  /**
   * Set up real-time synchronization
   */
  setupRealTimeSync() {
    // Listen for upload events
    document.addEventListener('reportUploaded', (event) => {
      this.handleUploadEvent(event.detail);
    });

    // Listen for checkbox changes
    document.addEventListener('checkboxChanged', (event) => {
      this.handleCheckboxChange(event.detail);
    });

    // Periodic refresh every 30 seconds
    setInterval(() => {
      this.refreshData();
    }, 30000);
  }

  /**
   * Get total number of reportings across all categories
   */
  getTotalReportingsCount() {
    let total = 0;
    for (const [category, reports] of Object.entries(this.reportingDefinitions)) {
      total += Object.keys(reports).length;
    }
    return total;
  }

  /**
   * Get category counts
   */
  getCategoryCounts() {
    return {
      categoryI: Object.keys(this.reportingDefinitions["I___Situation_comptable_et_états_annexes"]).length,
      categoryII: Object.keys(this.reportingDefinitions["II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires"]).length,
      categoryIII: Object.keys(this.reportingDefinitions["III___Etats_relatifs_à_la_réglementation_prudentielle"]).length
    };
  }

  /**
   * Load checkbox states from localStorage
   */
  loadCheckboxStates() {
    try {
      const savedStates = localStorage.getItem('bcp_checkbox_states');
      if (savedStates) {
        this.realTimeData.checkboxStates = JSON.parse(savedStates);
        console.log('✅ Checkbox states loaded from localStorage');
      }
    } catch (error) {
      console.warn('⚠️ Could not load checkbox states:', error);
      this.realTimeData.checkboxStates = {};
    }
  }

  /**
   * Save checkbox states to localStorage
   */
  saveCheckboxStates() {
    try {
      localStorage.setItem('bcp_checkbox_states', JSON.stringify(this.realTimeData.checkboxStates));
    } catch (error) {
      console.warn('⚠️ Could not save checkbox states:', error);
    }
  }

  /**
   * Detect real files in the folder structure
   */
  detectRealFiles() {
    console.log('🔍 Detecting real files...');
    this.realTimeData.realFiles = {};

    for (const [category, reports] of Object.entries(this.realTimeData.fileStructure)) {
      this.realTimeData.realFiles[category] = {};

      for (const [reportName, years] of Object.entries(reports)) {
        this.realTimeData.realFiles[category][reportName] = {};

        for (const [year, months] of Object.entries(years)) {
          this.realTimeData.realFiles[category][reportName][year] = {};

          for (const [month, files] of Object.entries(months)) {
            // Filter out README files and count real files
            const realFiles = files.filter(file =>
              !file.toLowerCase().includes('readme') &&
              file.toLowerCase().includes('.xlsx')
            );

            this.realTimeData.realFiles[category][reportName][year][month] = realFiles;

            // Update completion status based on real files
            if (realFiles.length > 0 && this.completionStatus[category] && this.completionStatus[category][reportName]) {
              if (this.completionStatus[category][reportName][parseInt(month)]) {
                this.completionStatus[category][reportName][parseInt(month)].hasRealFile = true;
              }
            }
          }
        }
      }
    }

    console.log('✅ Real files detected and completion status updated');
  }

  /**
   * Synchronize all data sources to create unified completion status
   */
  synchronizeDataSources() {
    console.log('🔄 Synchronizing all data sources...');

    // Process upload logs
    this.realTimeData.uploadLogs.forEach(log => {
      const category = this.getCategoryFromLog(log);
      const reportName = this.getReportNameFromLog(log);
      const month = log.month || new Date(log.timestamp).getMonth() + 1;

      if (this.completionStatus[category] && this.completionStatus[category][reportName]) {
        if (this.completionStatus[category][reportName][month]) {
          this.completionStatus[category][reportName][month].uploadDate = log.timestamp;
          this.completionStatus[category][reportName][month].completed = true;
        }
      }
    });

    // Process checkbox states
    for (const [key, checked] of Object.entries(this.realTimeData.checkboxStates)) {
      const { category, reportName, month } = this.parseCheckboxKey(key);

      if (this.completionStatus[category] && this.completionStatus[category][reportName]) {
        if (this.completionStatus[category][reportName][month]) {
          this.completionStatus[category][reportName][month].checkboxChecked = checked;
          if (checked) {
            this.completionStatus[category][reportName][month].completed = true;
          }
        }
      }
    });

    // Final completion determination: completed if ANY of the following is true:
    // 1. Has real file uploaded
    // 2. Has upload log entry
    // 3. Checkbox is checked
    for (const [category, reports] of Object.entries(this.completionStatus)) {
      for (const [reportName, months] of Object.entries(reports)) {
        for (const [month, status] of Object.entries(months)) {
          status.completed = status.hasRealFile || status.uploadDate || status.checkboxChecked;
        }
      }
    }

    console.log('✅ Data sources synchronized');
  }

  /**
   * Calculate comprehensive statistics
   */
  calculateComprehensiveStatistics() {
    console.log('📊 Calculating comprehensive statistics...');

    const stats = {
      total: this.getTotalReportingsCount(),
      byCategory: this.getCategoryCounts(),
      completion: {
        total: 0,
        byCategory: { categoryI: 0, categoryII: 0, categoryIII: 0 },
        byMonth: {},
        byPriority: { high: 0, medium: 0, low: 0 },
        byFrequency: { monthly: 0, quarterly: 0, semiAnnual: 0, annual: 0 }
      },
      uploads: {
        total: this.realTimeData.uploadLogs.length,
        thisMonth: 0,
        thisWeek: 0,
        today: 0,
        byCategory: { categoryI: 0, categoryII: 0, categoryIII: 0 }
      },
      realFiles: {
        total: 0,
        byCategory: { categoryI: 0, categoryII: 0, categoryIII: 0 }
      },
      compliance: {
        onTime: 0,
        overdue: 0,
        upcoming: 0
      },
      trends: {
        completionRate: 0,
        uploadFrequency: 0,
        averageCompletionTime: 0
      }
    };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Calculate completion statistics
    for (const [categoryKey, reports] of Object.entries(this.completionStatus)) {
      const categoryName = this.getCategoryDisplayName(categoryKey);

      for (const [reportName, months] of Object.entries(reports)) {
        const reportInfo = this.reportingDefinitions[categoryKey][reportName];

        for (const [month, status] of Object.entries(months)) {
          if (status.completed) {
            stats.completion.total++;
            stats.completion.byCategory[categoryName]++;

            // Count by priority
            if (reportInfo.priority === 'High') stats.completion.byPriority.high++;
            else if (reportInfo.priority === 'Medium') stats.completion.byPriority.medium++;
            else stats.completion.byPriority.low++;

            // Count by frequency
            if (reportInfo.frequency === 'Monthly') stats.completion.byFrequency.monthly++;
            else if (reportInfo.frequency === 'Quarterly') stats.completion.byFrequency.quarterly++;
            else if (reportInfo.frequency === 'Semi-Annual') stats.completion.byFrequency.semiAnnual++;
            else stats.completion.byFrequency.annual++;
          }
        }
      }
    }

    // Calculate upload statistics
    this.realTimeData.uploadLogs.forEach(log => {
      const uploadDate = new Date(log.timestamp);
      const category = this.getCategoryDisplayNameFromLog(log);

      stats.uploads.byCategory[category]++;

      // Time-based counts
      if (uploadDate.toDateString() === currentDate.toDateString()) {
        stats.uploads.today++;
      }

      const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (uploadDate >= weekAgo) {
        stats.uploads.thisWeek++;
      }

      if (uploadDate.getMonth() === currentDate.getMonth() && uploadDate.getFullYear() === currentYear) {
        stats.uploads.thisMonth++;
      }
    });

    // Calculate real files statistics
    for (const [category, reports] of Object.entries(this.realTimeData.realFiles)) {
      const categoryName = this.getCategoryDisplayName(category);

      for (const [reportName, years] of Object.entries(reports)) {
        for (const [year, months] of Object.entries(years)) {
          for (const [month, files] of Object.entries(months)) {
            const realFileCount = files.length;
            stats.realFiles.total += realFileCount;
            stats.realFiles.byCategory[categoryName] += realFileCount;
          }
        }
      }
    }

    // Calculate trends
    stats.trends.completionRate = (stats.completion.total / (stats.total * 12)) * 100; // Assuming monthly tracking
    stats.trends.uploadFrequency = stats.uploads.thisMonth;

    this.realTimeData.statistics = stats;
    this.realTimeData.lastUpdate = new Date().toISOString();

    console.log('✅ Statistics calculated:', stats);
    return stats;
  }

  /**
   * Handle upload events
   */
  handleUploadEvent(uploadData) {
    console.log('📤 Handling upload event:', uploadData);

    // Add to upload logs
    if (window.uploadLogsManager) {
      window.uploadLogsManager.logUpload(
        uploadData.reportName,
        uploadData.fileName,
        uploadData.category,
        uploadData
      );
    }

    // Update completion status
    const category = uploadData.category;
    const reportName = uploadData.reportName;
    const month = uploadData.month || new Date().getMonth() + 1;

    if (this.completionStatus[category] && this.completionStatus[category][reportName]) {
      if (this.completionStatus[category][reportName][month]) {
        this.completionStatus[category][reportName][month].uploadDate = new Date().toISOString();
        this.completionStatus[category][reportName][month].completed = true;
      }
    }

    // Refresh data and recalculate statistics
    this.refreshData();

    // Trigger dashboard updates
    this.triggerDashboardUpdate();
  }

  /**
   * Handle checkbox changes
   */
  handleCheckboxChange(checkboxData) {
    console.log('☑️ Handling checkbox change:', checkboxData);

    const { key, checked, category, reportName, month } = checkboxData;

    // Update checkbox states
    this.realTimeData.checkboxStates[key] = checked;
    this.saveCheckboxStates();

    // Update completion status
    if (this.completionStatus[category] && this.completionStatus[category][reportName]) {
      if (this.completionStatus[category][reportName][month]) {
        this.completionStatus[category][reportName][month].checkboxChecked = checked;
        this.completionStatus[category][reportName][month].completed =
          checked || this.completionStatus[category][reportName][month].hasRealFile ||
          this.completionStatus[category][reportName][month].uploadDate;
      }
    }

    // Recalculate statistics
    this.calculateComprehensiveStatistics();

    // Trigger dashboard updates
    this.triggerDashboardUpdate();
  }

  /**
   * Refresh all data sources
   */
  async refreshData() {
    try {
      await this.loadAllDataSources();
      this.calculateComprehensiveStatistics();
      console.log('🔄 Data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    }
  }

  /**
   * Trigger dashboard updates
   */
  triggerDashboardUpdate() {
    // Trigger custom events for dashboard components to update
    document.dispatchEvent(new CustomEvent('dataIntegrationUpdate', {
      detail: {
        statistics: this.realTimeData.statistics,
        completionStatus: this.completionStatus,
        lastUpdate: this.realTimeData.lastUpdate
      }
    }));
  }

  /**
   * Utility methods for data parsing and conversion
   */
  getCategoryFromLog(log) {
    if (log.category) {
      if (log.category.includes('I') || log.category.includes('Situation')) {
        return "I___Situation_comptable_et_états_annexes";
      } else if (log.category.includes('II') || log.category.includes('synthèse')) {
        return "II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires";
      } else if (log.category.includes('III') || log.category.includes('prudentielle')) {
        return "III___Etats_relatifs_à_la_réglementation_prudentielle";
      }
    }
    return "I___Situation_comptable_et_états_annexes"; // Default
  }

  getReportNameFromLog(log) {
    return log.reportName || log.report_name || 'Unknown_Report';
  }

  getCategoryDisplayName(categoryKey) {
    if (categoryKey.includes('I___')) return 'categoryI';
    if (categoryKey.includes('II___')) return 'categoryII';
    if (categoryKey.includes('III___')) return 'categoryIII';
    return 'categoryI';
  }

  getCategoryDisplayNameFromLog(log) {
    const category = this.getCategoryFromLog(log);
    return this.getCategoryDisplayName(category);
  }

  parseCheckboxKey(key) {
    // Expected format: "category_reportName_month" or similar
    const parts = key.split('_');
    if (parts.length >= 3) {
      const month = parseInt(parts[parts.length - 1]);
      const category = parts[0];
      const reportName = parts.slice(1, -1).join('_');

      return {
        category: this.mapCategoryKeyFromShort(category),
        reportName: reportName,
        month: month
      };
    }

    return { category: null, reportName: null, month: null };
  }

  mapCategoryKeyFromShort(shortKey) {
    if (shortKey === 'cat1' || shortKey === 'I') {
      return "I___Situation_comptable_et_états_annexes";
    } else if (shortKey === 'cat2' || shortKey === 'II') {
      return "II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires";
    } else if (shortKey === 'cat3' || shortKey === 'III') {
      return "III___Etats_relatifs_à_la_réglementation_prudentielle";
    }
    return "I___Situation_comptable_et_états_annexes";
  }

  /**
   * Get completion status for a specific report
   */
  getReportCompletionStatus(category, reportName, month = null) {
    if (!this.completionStatus[category] || !this.completionStatus[category][reportName]) {
      return null;
    }

    if (month) {
      return this.completionStatus[category][reportName][month];
    }

    return this.completionStatus[category][reportName];
  }

  /**
   * Get all completed reports for a specific month
   */
  getCompletedReportsForMonth(month) {
    const completed = [];

    for (const [category, reports] of Object.entries(this.completionStatus)) {
      for (const [reportName, months] of Object.entries(reports)) {
        if (months[month] && months[month].completed) {
          completed.push({
            category: category,
            reportName: reportName,
            month: month,
            status: months[month]
          });
        }
      }
    }

    return completed;
  }

  /**
   * Get overdue reports
   */
  getOverdueReports() {
    const overdue = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;

    for (const [category, reports] of Object.entries(this.completionStatus)) {
      for (const [reportName, months] of Object.entries(reports)) {
        const reportInfo = this.reportingDefinitions[category][reportName];

        // Check if report should be completed by now based on frequency
        for (let month = 1; month <= currentMonth; month++) {
          if (this.shouldBeCompletedByNow(reportInfo, month, currentMonth)) {
            if (!months[month] || !months[month].completed) {
              overdue.push({
                category: category,
                reportName: reportName,
                month: month,
                priority: reportInfo.priority,
                frequency: reportInfo.frequency
              });
            }
          }
        }
      }
    }

    return overdue;
  }

  shouldBeCompletedByNow(reportInfo, reportMonth, currentMonth) {
    if (reportInfo.frequency === 'Monthly') {
      return reportMonth <= currentMonth;
    } else if (reportInfo.frequency === 'Quarterly') {
      return reportMonth <= Math.floor((currentMonth - 1) / 3) * 3 + 3;
    } else if (reportInfo.frequency === 'Semi-Annual') {
      return reportMonth <= (currentMonth <= 6 ? 6 : 12);
    } else if (reportInfo.frequency === 'Annual') {
      return currentMonth >= 12;
    }

    return false;
  }

  /**
   * Export comprehensive data for external analysis
   */
  exportComprehensiveData() {
    return {
      reportingDefinitions: this.reportingDefinitions,
      completionStatus: this.completionStatus,
      realTimeData: this.realTimeData,
      statistics: this.realTimeData.statistics,
      metadata: {
        totalReportings: this.getTotalReportingsCount(),
        categoryCounts: this.getCategoryCounts(),
        lastUpdate: this.realTimeData.lastUpdate,
        exportTimestamp: new Date().toISOString()
      }
    };
  }
}

// Initialize the global data integration manager
window.dataIntegrationManager = new DataIntegrationManager();
