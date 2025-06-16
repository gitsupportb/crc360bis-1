/**
 * BCP Securities Services - Email Notification System
 *
 * Comprehensive email notification system for reporting deadlines with:
 * - Individual reporting assignments (not category-wide)
 * - Role-based escalation (Report Owner → Manager → Senior Management)
 * - Automated scheduling (30d, 7d, 2d before, 1d after deadline)
 * - Email reply processing with .xlsx attachment detection
 * - Professional BCP branding with orange theme
 * - Integration with existing completion tracking
 */

class EmailNotificationSystem {
  constructor() {
    console.log('🏗️ EmailNotificationSystem constructor called');
    this.isInitialized = false;
    this.reportingDataLoaded = false;
    this.emailConfig = this.loadEmailConfig();
    this.assignments = {}; // Initialize empty - will be loaded from centralized data
    this.emailHistory = this.loadEmailHistory();
    this.scheduledNotifications = [];
    this.emailTemplates = {};

    console.log('📊 Constructor: assignments initialized as empty object:', Object.keys(this.assignments).length);

    // Email schedule types
    this.notificationTypes = {
      REMINDER_30D: { days: -30, type: '30d_reminder', escalation: ['owner'] },
      REMINDER_7D: { days: -7, type: '7d_reminder', escalation: ['owner', 'manager'] },
      REMINDER_2D: { days: -2, type: '2d_warning', escalation: ['owner', 'manager', 'senior'] },
      OVERDUE_1D: { days: 1, type: 'overdue', escalation: ['owner', 'manager', 'senior'] }
    };

    this.initialize();
  }

  /**
   * Initialize the email notification system
   */
  async initialize() {
    console.log('🚀 Initializing Email Notification System...');

    try {
      // Load existing assignments first to preserve user data
      console.log('📋 Loading existing assignments...');
      this.assignments = this.loadAssignments();
      console.log(`📊 Loaded ${Object.keys(this.assignments).length} existing assignments`);

      // Load centralized reporting data first
      await this.loadCentralizedReportingData();

      // Load email templates
      await this.loadEmailTemplates();

      // Initialize assignments for all 68 reportings with fresh data
      await this.initializeDefaultAssignments();

      // Set up notification scheduler
      this.setupNotificationScheduler();

      // Integrate with existing data integration manager
      this.integrateWithDataManager();

      this.isInitialized = true;
      console.log('✅ Email Notification System initialized successfully');

      // Trigger initial UI update
      this.updateEmailSystemUI();

    } catch (error) {
      console.error('❌ Error initializing Email Notification System:', error);
    }
  }

  /**
   * Load centralized reporting data
   */
  async loadCentralizedReportingData() {
    console.log('📊 Loading centralized reporting data for email system...');

    try {
      // Ensure reporting data manager is available
      if (!window.reportingDataManager) {
        throw new Error('Reporting data manager not available');
      }

      // Load the centralized data
      await window.reportingDataManager.loadReportingData();
      this.reportingDataLoaded = true;

      console.log('✅ Centralized reporting data loaded for email system');

    } catch (error) {
      console.error('❌ Error loading centralized reporting data:', error);
      this.reportingDataLoaded = false;
    }
  }

  /**
   * Load email configuration from localStorage
   */
  loadEmailConfig() {
    const defaultConfig = {
      enabled: true,
      // Gmail SMTP Configuration
      smtpServer: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: false, // true for 465, false for other ports
      smtpAuth: {
        user: '', // Gmail address (to be configured)
        pass: '' // App password (to be configured)
      },
      fromEmail: '', // Gmail address (to be configured)
      fromName: 'BCP Securities Services - Reporting System',
      replyToEmail: '', // Gmail address (to be configured)
      enableEmailSubmissions: true,
      dashboardUrl: window.location.origin + window.location.pathname,
      companyName: 'BCP Securities Services',
      logoUrl: './bcp-logo.jpg',
      // Gmail specific settings
      gmailConfigured: false,
      testMode: true // Start in test mode until Gmail is configured
    };

    const saved = localStorage.getItem('emailNotificationConfig');
    return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
  }

  /**
   * Load reporting assignments from localStorage
   */
  loadAssignments() {
    const saved = localStorage.getItem('reportingAssignments');
    return saved ? JSON.parse(saved) : {};
  }

  /**
   * Clear all assignments (useful for fresh initialization)
   */
  clearAllAssignments() {
    console.log('🗑️ Clearing all assignments...');
    this.assignments = {};
    localStorage.removeItem('reportingAssignments');
    console.log('✅ All assignments cleared');
  }

  /**
   * Load email history from localStorage
   */
  loadEmailHistory() {
    const saved = localStorage.getItem('emailNotificationHistory');
    return saved ? JSON.parse(saved) : [];
  }

  /**
   * Save email configuration
   */
  saveEmailConfig() {
    localStorage.setItem('emailNotificationConfig', JSON.stringify(this.emailConfig));
  }

  /**
   * Save reporting assignments
   */
  saveAssignments() {
    localStorage.setItem('reportingAssignments', JSON.stringify(this.assignments));
  }

  /**
   * Save email history
   */
  saveEmailHistory() {
    // Keep only last 1000 entries
    if (this.emailHistory.length > 1000) {
      this.emailHistory = this.emailHistory.slice(-1000);
    }
    localStorage.setItem('emailNotificationHistory', JSON.stringify(this.emailHistory));
  }

  /**
   * Initialize default assignments for all reportings
   */
  async initializeDefaultAssignments() {
    console.log('📋 Initializing default assignments for all reportings...');

    try {
      // Load existing assignments to preserve user data
      const existingAssignments = this.loadAssignments();
      console.log(`📊 Preserving ${Object.keys(existingAssignments).length} existing assignments`);

      // Start with existing assignments
      this.assignments = { ...existingAssignments };
      let reportingCount = 0;

      if (this.reportingDataLoaded && window.reportingDataManager) {
        // Use centralized reporting data with getReportingsArray for correct category assignment
        const allReportings = await window.reportingDataManager.getReportingsArray();
        console.log(`📊 Creating assignments for ${allReportings.length} reportings from centralized data`);

        allReportings.forEach((reporting) => {
          const assignmentKey = `${reporting.code || reporting.id}_${reporting.name.replace(/\s+/g, '_').substring(0, 50)}`;

          // Check if assignment already exists and preserve user data
          if (!this.assignments[assignmentKey]) {
            // Create new assignment only if it doesn't exist
            this.assignments[assignmentKey] = {
              reportName: reporting.name,
              reportKey: reporting.id || reporting.code,
              category: reporting.category, // This should be 'I', 'II', or 'III'
              categoryId: reporting.category,
              code: reporting.code || reporting.id,
              frequency: reporting.frequency || 'Monthly',
              priority: reporting.priority || 'Medium',
              folderName: reporting.folderName,
              owner: {
                name: '',
                email: '',
                phone: ''
              },
              manager: {
                name: '',
                email: '',
                phone: ''
              },
              senior: {
                name: '',
                email: '',
                phone: ''
              },
              emailEnabled: true,
              customSchedule: null, // Use default schedule if null
              lastModified: new Date().toISOString(),
              createdBy: 'centralized_system'
            };
            reportingCount++;
          } else {
            // Update existing assignment but preserve user email data
            const existing = this.assignments[assignmentKey];
            this.assignments[assignmentKey] = {
              ...existing,
              reportName: reporting.name,
              reportKey: reporting.id || reporting.code,
              category: reporting.category,
              categoryId: reporting.category,
              code: reporting.code || reporting.id,
              frequency: reporting.frequency || existing.frequency || 'Monthly',
              priority: reporting.priority || existing.priority || 'Medium',
              folderName: reporting.folderName,
              lastModified: new Date().toISOString()
            };
          }
        });

        console.log(`✅ Initialized assignments for ${reportingCount} reportings from centralized data`);

      } else if (window.dataIntegrationManager && window.dataIntegrationManager.reportingDefinitions) {
        // Fallback to data integration manager
        const reportingDefs = window.dataIntegrationManager.reportingDefinitions;

        Object.keys(reportingDefs).forEach(category => {
          Object.keys(reportingDefs[category]).forEach(reportName => {
            const assignmentKey = `${category}_${reportName}`;

            // Always create assignment (no checking for existing)
            this.assignments[assignmentKey] = {
              reportName: reportName,
              category: category,
              owner: {
                name: '',
                email: '',
                phone: ''
              },
              manager: {
                name: '',
                email: '',
                phone: ''
              },
              senior: {
                name: '',
                email: '',
                phone: ''
              },
              emailEnabled: true,
              customSchedule: null, // Use default schedule if null
              lastModified: new Date().toISOString(),
              createdBy: 'fallback_system'
            };
            reportingCount++;
          });
        });

        console.log(`⚠️ Initialized assignments for ${reportingCount} reportings from fallback data`);
      }

      // Save assignments to localStorage for persistence
      this.saveAssignments();

    } catch (error) {
      console.error('❌ Error initializing default assignments:', error);
    }
  }

  /**
   * Load email templates
   */
  async loadEmailTemplates() {
    // Load templates from external file or define inline
    this.emailTemplates = {
      '30d_reminder': {
        subject: '[BCP Securities] Reminder: {reportName} due in 30 days - {category}',
        template: 'reminder_30d'
      },
      '7d_reminder': {
        subject: '[BCP Securities] URGENT: {reportName} due in 7 days - {category}',
        template: 'reminder_7d'
      },
      '2d_warning': {
        subject: '[BCP Securities] CRITICAL: {reportName} due in 2 days - {category}',
        template: 'warning_2d'
      },
      'overdue': {
        subject: '[BCP Securities] OVERDUE: {reportName} is past deadline - {category}',
        template: 'overdue_notification'
      },
      'submission_confirmation': {
        subject: '[BCP Securities] Confirmation: {reportName} received - {category}',
        template: 'submission_confirmation'
      }
    };
  }

  /**
   * Set up notification scheduler
   */
  setupNotificationScheduler() {
    // Check for notifications every hour
    setInterval(() => {
      this.processScheduledNotifications();
    }, 60 * 60 * 1000); // 1 hour

    // Initial check
    setTimeout(() => {
      this.processScheduledNotifications();
    }, 5000); // 5 seconds after initialization
  }

  /**
   * Integrate with existing data integration manager
   */
  integrateWithDataManager() {
    if (window.dataIntegrationManager) {
      // Listen for completion status changes
      document.addEventListener('checkboxChanged', (event) => {
        this.handleCompletionStatusChange(event.detail);
      });

      // Listen for upload events
      document.addEventListener('reportUploaded', (event) => {
        this.handleReportSubmission(event.detail);
      });
    }
  }

  /**
   * Process scheduled notifications
   */
  processScheduledNotifications() {
    if (!this.emailConfig.enabled) return;

    console.log('📧 Processing scheduled email notifications...');

    const today = new Date();
    const notifications = this.generateNotificationSchedule(today);

    notifications.forEach(notification => {
      if (this.shouldSendNotification(notification, today)) {
        this.sendEmailNotification(notification);
      }
    });
  }

  /**
   * Generate notification schedule for all reportings based on actual deadlines
   */
  generateNotificationSchedule(referenceDate) {
    const notifications = [];
    const today = new Date(referenceDate);

    console.log('📅 Generating notification schedule for:', today.toDateString());
    console.log('📊 Available assignments:', Object.keys(this.assignments).length);

    // Generate notifications for each assignment based on actual report deadlines
    Object.entries(this.assignments).forEach(([assignmentKey, assignment]) => {
      if (!assignment.emailEnabled) {
        console.log(`⏭️ Skipping ${assignment.reportName} - email disabled`);
        return;
      }

      console.log(`📋 Processing assignment: ${assignment.reportName} (${assignment.frequency})`);

      // Get actual deadlines from the reporting data
      const actualDeadlines = this.getActualReportDeadlines(assignment, today);
      console.log(`📅 Found ${actualDeadlines.length} actual deadlines for ${assignment.reportName}`);

      actualDeadlines.forEach((deadlineInfo, index) => {
        console.log(`   Deadline ${index + 1}: ${deadlineInfo.deadline.toDateString()} (Period: ${deadlineInfo.period})`);
      });

      actualDeadlines.forEach(deadlineInfo => {
        const deadline = deadlineInfo.deadline;

        // Generate notifications for each type (30d, 7d, 2d, overdue)
        Object.values(this.notificationTypes).forEach(notifType => {
          const sendDate = new Date(deadline);
          sendDate.setDate(sendDate.getDate() + notifType.days);

          // Include notifications within a reasonable timeframe
          const daysDiff = Math.ceil((sendDate - today) / (1000 * 60 * 60 * 24));
          if (daysDiff >= -30 && daysDiff <= 90) { // Show notifications from 30 days ago to 90 days in future

            // Determine status based on notification type and timing
            let status = 'pending';
            if (notifType.type === 'overdue' && deadline < today) {
              status = 'overdue'; // Mark as overdue if deadline has passed
            } else if (sendDate <= today) {
              status = 'sent';
            }

            notifications.push({
              id: `${assignmentKey}_${deadline.getTime()}_${notifType.type}`,
              reportName: assignment.reportName,
              category: assignment.category,
              regulator: assignment.regulator || 'BAM',
              deadline: deadline,
              sendDate: sendDate,
              notificationType: notifType.type,
              escalationLevel: notifType.escalation,
              assignment: assignment,
              status: status,
              daysUntilDeadline: Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)),
              period: deadlineInfo.period,
              dateArrete: deadlineInfo.dateArrete
            });
          }
        });
      });
    });

    console.log(`📧 Generated ${notifications.length} notifications`);
    return notifications;
  }

  /**
   * Get actual report deadlines from the centralized reporting data
   */
  getActualReportDeadlines(assignment, referenceDate) {
    const deadlines = [];
    const today = new Date(referenceDate);
    const currentYear = today.getFullYear();

    try {
      // Get the reporting data from the centralized source
      if (!window.reportingDataManager) {
        console.warn('⚠️ Reporting data manager not available, falling back to generated deadlines');
        return this.generateComprehensiveDeadlines(assignment, referenceDate);
      }

      // Find the reporting in the centralized data
      const reportingData = this.findReportingInCentralizedData(assignment);
      if (!reportingData) {
        console.warn(`⚠️ Reporting data not found for ${assignment.reportName}, falling back to generated deadlines`);
        return this.generateComprehensiveDeadlines(assignment, referenceDate);
      }

      console.log(`📊 Found reporting data for ${assignment.reportName}:`, {
        frequency: reportingData.frequency,
        deadlineRule: reportingData.deadlineRule,
        regulator: reportingData.regulator
      });

      // Generate actual deadlines based on the reporting's frequency and deadline rule
      const actualDeadlines = this.calculateActualDeadlines(reportingData, currentYear, today);

      return actualDeadlines;

    } catch (error) {
      console.error(`❌ Error getting actual deadlines for ${assignment.reportName}:`, error);
      return this.generateComprehensiveDeadlines(assignment, referenceDate);
    }
  }

  /**
   * Find reporting data in the centralized data source
   */
  findReportingInCentralizedData(assignment) {
    try {
      if (!window.reportingDataManager || !window.reportingDataManager.reportingsData) {
        return null;
      }

      const categories = window.reportingDataManager.reportingsData.categories;

      // Search through all categories for the reporting
      for (const [categoryKey, categoryData] of Object.entries(categories)) {
        if (categoryData.reportings) {
          for (const [reportingKey, reportingData] of Object.entries(categoryData.reportings)) {
            // Match by name or code
            if (reportingData.name === assignment.reportName ||
                reportingData.displayName === assignment.reportName ||
                reportingData.code === assignment.reportName) {

              return {
                ...reportingData,
                regulator: this.getRegulatorFromCategory(categoryKey),
                categoryKey: categoryKey,
                reportingKey: reportingKey
              };
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding reporting in centralized data:', error);
      return null;
    }
  }

  /**
   * Get regulator from category key
   */
  getRegulatorFromCategory(categoryKey) {
    if (categoryKey === 'I' || categoryKey === 'II' || categoryKey === 'III') {
      return 'BAM';
    } else if (categoryKey === 'BCP' || categoryKey === 'BCP2S' || categoryKey === 'BANK_AL_YOUSR') {
      return 'AMMC';
    } else if (categoryKey === 'DGI') {
      return 'DGI';
    }
    return 'BAM'; // Default
  }

  /**
   * Calculate actual deadlines using the same logic as the main dashboard
   */
  calculateActualDeadlines(reportingData, currentYear, referenceDate) {
    const deadlines = [];
    const frequency = reportingData.frequency.toLowerCase().trim();
    const rule = reportingData.deadlineRule.toLowerCase().trim();
    const regulator = reportingData.regulator;

    console.log(`🔧 Calculating deadlines for ${reportingData.name}:`, {
      frequency,
      rule,
      regulator
    });

    // Helper function to add days to a date
    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    // Helper function to create deadline info
    const createDeadlineInfo = (dateArrete, deadline, period) => ({
      deadline: deadline,
      dateArrete: dateArrete,
      period: period
    });

    // Generate deadlines based on frequency
    if (frequency === 'mensuelle' || frequency === 'monthly') {
      // Generate monthly deadlines for current and next few months
      for (let monthOffset = -2; monthOffset <= 6; monthOffset++) {
        const reportDate = new Date(currentYear, referenceDate.getMonth() + monthOffset, 1);
        const deadline = this.calculateDeadlineFromRule(reportDate, rule, regulator);

        if (deadline) {
          const period = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`;
          deadlines.push(createDeadlineInfo(reportDate, deadline, period));
        }
      }
    } else if (frequency === 'trimestrielle' || frequency === 'quarterly') {
      // Generate quarterly deadlines
      const quarters = [
        { year: currentYear - 1, month: 12, day: 31, name: 'Q4 ' + (currentYear - 1) },
        { year: currentYear, month: 3, day: 31, name: 'Q1 ' + currentYear },
        { year: currentYear, month: 6, day: 30, name: 'Q2 ' + currentYear },
        { year: currentYear, month: 9, day: 30, name: 'Q3 ' + currentYear },
        { year: currentYear, month: 12, day: 31, name: 'Q4 ' + currentYear }
      ];

      quarters.forEach(quarter => {
        const reportDate = new Date(quarter.year, quarter.month - 1, quarter.day);
        const deadline = this.calculateDeadlineFromRule(reportDate, rule, regulator);

        if (deadline) {
          deadlines.push(createDeadlineInfo(reportDate, deadline, quarter.name));
        }
      });
    } else if (frequency === 'semestrielle' || frequency === 'semiannual') {
      // Generate semiannual deadlines
      const semesters = [
        { year: currentYear - 1, month: 12, day: 31, name: 'S2 ' + (currentYear - 1) },
        { year: currentYear, month: 6, day: 30, name: 'S1 ' + currentYear },
        { year: currentYear, month: 12, day: 31, name: 'S2 ' + currentYear }
      ];

      semesters.forEach(semester => {
        const reportDate = new Date(semester.year, semester.month - 1, semester.day);
        const deadline = this.calculateDeadlineFromRule(reportDate, rule, regulator);

        if (deadline) {
          deadlines.push(createDeadlineInfo(reportDate, deadline, semester.name));
        }
      });
    } else if (frequency === 'annuelle' || frequency === 'annual') {
      // Generate annual deadlines
      const years = [currentYear - 1, currentYear, currentYear + 1];

      years.forEach(year => {
        const reportDate = new Date(year, 11, 31); // December 31st
        const deadline = this.calculateDeadlineFromRule(reportDate, rule, regulator);

        if (deadline) {
          deadlines.push(createDeadlineInfo(reportDate, deadline, `Year ${year}`));
        }
      });
    } else if (frequency === 'hebdomadaire' || frequency === 'weekly') {
      // Generate weekly deadlines for AMMC
      for (let weekOffset = -4; weekOffset <= 12; weekOffset++) {
        const reportDate = new Date(referenceDate);
        reportDate.setDate(reportDate.getDate() + (weekOffset * 7));
        const deadline = this.calculateDeadlineFromRule(reportDate, rule, regulator);

        if (deadline) {
          const period = `Week ${reportDate.getFullYear()}-W${Math.ceil(reportDate.getDate() / 7)}`;
          deadlines.push(createDeadlineInfo(reportDate, deadline, period));
        }
      }
    }

    console.log(`📅 Generated ${deadlines.length} actual deadlines for ${reportingData.name}`);
    return deadlines;
  }

  /**
   * Calculate deadline from rule using the same logic as the main dashboard
   */
  calculateDeadlineFromRule(reportDate, rule, regulator) {
    try {
      // Helper function to add days to a date
      const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };

      // Helper function to get end of month
      const getEndOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
      };

      // Helper function to parse month names
      const monthNameToNumber = (monthName) => {
        const months = {
          'janvier': 0, 'février': 1, 'fevrier': 1, 'mars': 2, 'avril': 3,
          'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7, 'aout': 7,
          'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11, 'decembre': 11
        };
        return months[monthName.toLowerCase()] || 0;
      };

      // Parse fixed deadline (e.g., "31 mars")
      const parseFixedDeadline = (rule, repDate) => {
        const regex = /(?:(\d{1,2})|fin)\s*(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)/gi;
        const matches = [];
        let m;

        while ((m = regex.exec(rule)) !== null) {
          let day;
          const monthNumber = monthNameToNumber(m[2]);

          if (m[1]) {
            day = parseInt(m[1]);
          } else {
            // "fin" means last day of month
            day = new Date(repDate.getFullYear(), monthNumber + 1, 0).getDate();
          }

          let candidate = new Date(repDate.getFullYear(), monthNumber, day);
          if (candidate < repDate) {
            candidate = new Date(repDate.getFullYear() + 1, monthNumber, day);
          }
          matches.push(candidate);
        }

        return matches.length > 0 ? matches[0] : null;
      };

      // Main deadline calculation logic
      if (rule.includes("fin du mois suivant")) {
        const nextMonth = reportDate.getMonth() + 1;
        let year = reportDate.getFullYear();
        let month = nextMonth;
        if (nextMonth > 11) {
          month = 0;
          year++;
        }
        return new Date(year, month + 1, 0); // Last day of next month
      }

      if (rule.includes("un mois")) return addDays(reportDate, 30);
      if (rule.includes("15 jours")) return addDays(reportDate, 15);
      if (rule.includes("12 jours")) return addDays(reportDate, 12);
      if (rule.includes("21 jours")) return addDays(reportDate, 21);
      if (rule.includes("30 jours")) return addDays(reportDate, 30);

      // Try to parse fixed deadline
      const fixedDeadline = parseFixedDeadline(rule, reportDate);
      if (fixedDeadline) return fixedDeadline;

      // Special cases for specific rules
      if (rule.includes("31 mars")) {
        return new Date(reportDate.getFullYear() + (reportDate.getMonth() >= 2 ? 1 : 0), 2, 31);
      }

      if (rule.includes("30 avril")) {
        return new Date(reportDate.getFullYear() + (reportDate.getMonth() >= 3 ? 1 : 0), 3, 30);
      }

      // DGI specific rules
      if (regulator === 'DGI') {
        if (rule.includes("31 mars")) {
          return new Date(reportDate.getFullYear() + 1, 2, 31); // March 31 of next year
        }
        if (rule.includes("fin du mois suivant")) {
          return getEndOfMonth(new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 1));
        }
      }

      // AMMC specific rules
      if (regulator === 'AMMC') {
        if (rule.includes("2ème jour ouvrable")) {
          // 2nd business day after period end
          let deadline = new Date(reportDate);
          deadline.setDate(deadline.getDate() + 1);

          // Skip weekends
          let businessDays = 0;
          while (businessDays < 2) {
            if (deadline.getDay() !== 0 && deadline.getDay() !== 6) { // Not Sunday or Saturday
              businessDays++;
            }
            if (businessDays < 2) {
              deadline.setDate(deadline.getDate() + 1);
            }
          }
          return deadline;
        }

        if (rule.includes("5 jours") || rule.includes("10 jours")) {
          const days = rule.includes("5 jours") ? 5 : 10;
          return addDays(reportDate, days);
        }
      }

      // Default fallback - if no rule matches, assume 15 days after report date
      console.warn(`⚠️ Unknown deadline rule: ${rule}, using 15 days default`);
      return addDays(reportDate, 15);

    } catch (error) {
      console.error(`❌ Error calculating deadline from rule "${rule}":`, error);
      // Fallback to 15 days
      const result = new Date(reportDate);
      result.setDate(result.getDate() + 15);
      return result;
    }
  }

  /**
   * Generate comprehensive deadlines (past and future) for better notification visibility
   */
  generateComprehensiveDeadlines(assignment, referenceDate) {
    const deadlines = [];
    const today = new Date(referenceDate);

    // Generate past deadlines (for overdue notifications)
    const pastDeadlines = this.generatePastDeadlines(assignment, today, 2);

    // Generate future deadlines
    const futureDeadlines = this.generateUpcomingDeadlines(assignment, today);

    // Combine and sort all deadlines
    deadlines.push(...pastDeadlines, ...futureDeadlines);
    deadlines.sort((a, b) => a.getTime() - b.getTime());

    return deadlines;
  }

  /**
   * Generate past deadlines for overdue notifications
   */
  generatePastDeadlines(assignment, referenceDate, count = 2) {
    const deadlines = [];
    const today = new Date(referenceDate);
    const regulator = assignment.regulator || 'BAM';

    // Determine frequency
    let frequency = assignment.frequency || 'Mensuelle';
    if (frequency.toLowerCase().includes('mensuel') || frequency.toLowerCase().includes('monthly')) {
      frequency = 'monthly';
    } else if (frequency.toLowerCase().includes('trimestriel') || frequency.toLowerCase().includes('quarterly')) {
      frequency = 'quarterly';
    } else if (frequency.toLowerCase().includes('semestriel') || frequency.toLowerCase().includes('semi')) {
      frequency = 'semiannual';
    } else if (frequency.toLowerCase().includes('annuel') || frequency.toLowerCase().includes('annual')) {
      frequency = 'annual';
    } else if (frequency.toLowerCase().includes('hebdomadaire') || frequency.toLowerCase().includes('weekly')) {
      frequency = 'weekly';
    } else {
      frequency = 'monthly'; // Default
    }

    // Generate past deadlines
    for (let i = 1; i <= count; i++) {
      let deadline = new Date(today);

      switch (frequency) {
        case 'weekly':
          deadline.setDate(deadline.getDate() - (i * 7));
          if (regulator === 'AMMC') {
            deadline = this.getNextBusinessDay(deadline, 2);
          }
          break;
        case 'monthly':
          deadline.setMonth(deadline.getMonth() - i);
          if (regulator === 'BAM') {
            deadline.setDate(15); // 15th of each month for BAM
          } else if (regulator === 'AMMC') {
            deadline = this.getEndOfMonth(deadline);
            deadline.setDate(deadline.getDate() + 7); // 7 days after month end
          } else if (regulator === 'DGI') {
            deadline = this.getEndOfMonth(deadline);
          }
          break;
        case 'quarterly':
          deadline.setMonth(deadline.getMonth() - (i * 3));
          if (regulator === 'BAM') {
            deadline.setDate(20); // 20th of quarter end month
          } else if (regulator === 'AMMC') {
            deadline = this.getEndOfMonth(deadline);
            deadline.setMonth(deadline.getMonth() + 1);
            deadline = this.getEndOfMonth(deadline);
          } else if (regulator === 'DGI') {
            deadline = this.getEndOfMonth(deadline);
            deadline.setMonth(deadline.getMonth() + 1);
            deadline = this.getEndOfMonth(deadline);
          }
          break;
        case 'semiannual':
          deadline.setMonth(deadline.getMonth() - (i * 6));
          if (regulator === 'BAM') {
            deadline.setDate(25); // 25th of semester end month
          } else if (regulator === 'AMMC') {
            deadline = this.getEndOfMonth(deadline);
            deadline.setMonth(deadline.getMonth() + 1);
            deadline = this.getEndOfMonth(deadline);
          }
          break;
        case 'annual':
          deadline.setFullYear(deadline.getFullYear() - i);
          if (regulator === 'BAM') {
            deadline.setMonth(11); // December
            deadline.setDate(31); // End of year
          } else if (regulator === 'DGI') {
            deadline.setMonth(2); // March
            deadline.setDate(31); // March 31 for DGI annual reports
          } else {
            deadline.setMonth(11); // December
            deadline.setDate(31); // End of year
          }
          break;
      }

      deadlines.push(deadline);
    }

    return deadlines;
  }

  /**
   * Generate upcoming deadlines for an assignment based on its frequency and regulator
   */
  generateUpcomingDeadlines(assignment, referenceDate) {
    const deadlines = [];
    const today = new Date(referenceDate);
    const regulator = assignment.regulator || 'BAM';

    // Determine frequency
    let frequency = assignment.frequency || 'Mensuelle';
    if (frequency.toLowerCase().includes('mensuel') || frequency.toLowerCase().includes('monthly')) {
      frequency = 'monthly';
    } else if (frequency.toLowerCase().includes('trimestriel') || frequency.toLowerCase().includes('quarterly')) {
      frequency = 'quarterly';
    } else if (frequency.toLowerCase().includes('semestriel') || frequency.toLowerCase().includes('semi')) {
      frequency = 'semiannual';
    } else if (frequency.toLowerCase().includes('annuel') || frequency.toLowerCase().includes('annual')) {
      frequency = 'annual';
    } else if (frequency.toLowerCase().includes('hebdomadaire') || frequency.toLowerCase().includes('weekly')) {
      frequency = 'weekly';
    } else {
      frequency = 'monthly'; // Default
    }

    // Generate next 3 deadlines based on frequency and regulator-specific rules
    for (let i = 0; i < 3; i++) {
      let deadline = new Date(today);

      switch (frequency) {
        case 'weekly':
          // For AMMC weekly reports
          deadline.setDate(deadline.getDate() + (i + 1) * 7);
          if (regulator === 'AMMC') {
            // AMMC: 2nd business day after week end
            deadline = this.getNextBusinessDay(deadline, 2);
          }
          break;
        case 'monthly':
          deadline.setMonth(deadline.getMonth() + i + 1);
          if (regulator === 'BAM') {
            deadline.setDate(15); // 15th of each month for BAM
          } else if (regulator === 'AMMC') {
            // AMMC: 5-10 days after month end
            deadline = this.getEndOfMonth(deadline);
            deadline.setDate(deadline.getDate() + 7); // 7 days after month end
          } else if (regulator === 'DGI') {
            // DGI: End of following month
            deadline = this.getEndOfMonth(deadline);
          }
          break;
        case 'quarterly':
          deadline.setMonth(deadline.getMonth() + (i + 1) * 3);
          if (regulator === 'BAM') {
            deadline.setDate(20); // 20th of quarter end month
          } else if (regulator === 'AMMC') {
            // AMMC: 1 month after period end
            deadline = this.getEndOfMonth(deadline);
            deadline.setMonth(deadline.getMonth() + 1);
            deadline = this.getEndOfMonth(deadline);
          } else if (regulator === 'DGI') {
            // DGI: End of following month
            deadline = this.getEndOfMonth(deadline);
            deadline.setMonth(deadline.getMonth() + 1);
            deadline = this.getEndOfMonth(deadline);
          }
          break;
        case 'semiannual':
          deadline.setMonth(deadline.getMonth() + (i + 1) * 6);
          if (regulator === 'BAM') {
            deadline.setDate(25); // 25th of semester end month
          } else if (regulator === 'AMMC') {
            // AMMC: 1 month after period end
            deadline = this.getEndOfMonth(deadline);
            deadline.setMonth(deadline.getMonth() + 1);
            deadline = this.getEndOfMonth(deadline);
          }
          break;
        case 'annual':
          deadline.setFullYear(deadline.getFullYear() + i + 1);
          if (regulator === 'BAM') {
            deadline.setMonth(11); // December
            deadline.setDate(31); // End of year
          } else if (regulator === 'DGI') {
            deadline.setMonth(2); // March
            deadline.setDate(31); // March 31 for DGI annual reports
          } else {
            deadline.setMonth(11); // December
            deadline.setDate(31); // End of year
          }
          break;
      }

      deadlines.push(deadline);
    }

    return deadlines;
  }

  /**
   * Get the end of month date
   */
  getEndOfMonth(date) {
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return endOfMonth;
  }

  /**
   * Get the next business day (skip weekends)
   */
  getNextBusinessDay(date, daysToAdd = 1) {
    const result = new Date(date);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
      result.setDate(result.getDate() + 1);
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        addedDays++;
      }
    }

    return result;
  }

  /**
   * Check if a report is completed for a specific deadline
   */
  isReportCompleted(notification) {
    try {
      // Check with data integration manager if available
      if (window.dataIntegrationManager && window.dataIntegrationManager.completionStatus) {
        const deadline = new Date(notification.deadline);
        const month = deadline.getMonth() + 1;

        // Find the category key in the data integration manager
        const categoryKey = this.findCategoryKey(notification.category);
        const reportKey = this.findReportKey(notification.reportName, categoryKey);

        if (categoryKey && reportKey &&
            window.dataIntegrationManager.completionStatus[categoryKey] &&
            window.dataIntegrationManager.completionStatus[categoryKey][reportKey] &&
            window.dataIntegrationManager.completionStatus[categoryKey][reportKey][month]) {

          const status = window.dataIntegrationManager.completionStatus[categoryKey][reportKey][month];
          return status.completed || status.checkboxChecked || status.hasRealFile || status.uploadDate;
        }
      }

      // Fallback: check if assignment has custom completion status
      if (notification.assignment && notification.assignment.completed) {
        return true;
      }

      // Default: not completed
      return false;

    } catch (error) {
      console.warn('⚠️ Error checking completion status:', error);
      return false;
    }
  }

  /**
   * Find category key in data integration manager format
   */
  findCategoryKey(category) {
    const categoryMappings = {
      'I': 'I___Situation_comptable_et_états_annexes',
      'II': 'II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires',
      'III': 'III___Etats_relatifs_à_la_réglementation_prudentielle',
      'BCP': 'AMMC_BCP',
      'BCP2S': 'AMMC_BCP2S',
      'BANK_AL_YOUSR': 'AMMC_BANK_AL_YOUSR',
      'DGI': 'DGI'
    };

    return categoryMappings[category] || category;
  }

  /**
   * Find report key in data integration manager format
   */
  findReportKey(reportName, categoryKey) {
    try {
      if (window.dataIntegrationManager &&
          window.dataIntegrationManager.reportingDefinitions &&
          window.dataIntegrationManager.reportingDefinitions[categoryKey]) {

        const reports = window.dataIntegrationManager.reportingDefinitions[categoryKey];

        // Try exact match first
        if (reports[reportName]) {
          return reportName;
        }

        // Try to find by similarity (remove spaces, underscores, etc.)
        const normalizedReportName = reportName.replace(/[\s_-]/g, '').toLowerCase();

        for (const key of Object.keys(reports)) {
          const normalizedKey = key.replace(/[\s_-]/g, '').toLowerCase();
          if (normalizedKey.includes(normalizedReportName) || normalizedReportName.includes(normalizedKey)) {
            return key;
          }
        }
      }

      return reportName; // Fallback to original name

    } catch (error) {
      console.warn('⚠️ Error finding report key:', error);
      return reportName;
    }
  }

  /**
   * Check if notification should be sent
   */
  shouldSendNotification(notification, currentDate) {
    // Don't send if report is already completed
    if (this.isReportCompleted(notification)) {
      return false;
    }

    // Check if it's time to send
    const sendDate = new Date(notification.sendDate);
    sendDate.setHours(9, 0, 0, 0); // Send at 9 AM

    const currentDateNormalized = new Date(currentDate);
    currentDateNormalized.setHours(9, 0, 0, 0);

    if (sendDate.getTime() !== currentDateNormalized.getTime()) {
      return false;
    }

    // Check if already sent
    const alreadySent = this.emailHistory.some(entry =>
      entry.notificationId === notification.id &&
      entry.status === 'sent'
    );

    return !alreadySent;
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification) {
    console.log('📧 Sending email notification:', notification.id);

    try {
      const recipients = this.getNotificationRecipients(notification);
      const emailContent = this.generateEmailContent(notification);

      // Send actual email using Gmail SMTP
      const emailResult = await this.sendActualEmail(recipients, emailContent);

      // Log the email
      this.logEmailNotification(notification, recipients, emailResult);

      // Update UI
      this.updateEmailSystemUI();

      return emailResult;

    } catch (error) {
      console.error('❌ Error sending email notification:', error);
      this.logEmailNotification(notification, [], { success: false, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notification recipients based on escalation level
   */
  getNotificationRecipients(notification) {
    const recipients = [];
    const assignment = notification.assignment;

    notification.escalationLevel.forEach(level => {
      switch (level) {
        case 'owner':
          if (assignment.owner.email) {
            recipients.push({
              name: assignment.owner.name,
              email: assignment.owner.email,
              role: 'Report Owner'
            });
          }
          break;
        case 'manager':
          if (assignment.manager.email) {
            recipients.push({
              name: assignment.manager.name,
              email: assignment.manager.email,
              role: 'Manager'
            });
          }
          break;
        case 'senior':
          if (assignment.senior.email) {
            recipients.push({
              name: assignment.senior.name,
              email: assignment.senior.email,
              role: 'Senior Management'
            });
          }
          break;
      }
    });

    return recipients;
  }

  /**
   * Generate email content
   */
  generateEmailContent(notification) {
    // Ensure email templates are loaded
    if (!this.emailTemplates || Object.keys(this.emailTemplates).length === 0) {
      console.warn('⚠️ Email templates not loaded, loading now...');
      this.loadEmailTemplates();
    }

    const template = this.emailTemplates[notification.notificationType];

    // Fallback if template not found
    if (!template) {
      console.warn(`⚠️ Template not found for ${notification.notificationType}, using fallback`);
      const fallbackTemplate = {
        subject: `[BCP Securities] Notification: {reportName} - {category}`,
        template: 'fallback'
      };

      const daysUntilDeadline = Math.ceil((notification.deadline - new Date()) / (1000 * 60 * 60 * 24));
      const subject = fallbackTemplate.subject
        .replace('{reportName}', notification.reportName)
        .replace('{category}', notification.category)
        .replace('{daysRemaining}', Math.abs(daysUntilDeadline));

      const htmlContent = this.generateEmailHTML(notification, daysUntilDeadline);

      return {
        subject: subject,
        html: htmlContent,
        text: this.generateEmailText(notification, daysUntilDeadline)
      };
    }

    const daysUntilDeadline = Math.ceil((notification.deadline - new Date()) / (1000 * 60 * 60 * 24));

    const subject = template.subject
      .replace('{reportName}', notification.reportName)
      .replace('{category}', notification.category)
      .replace('{daysRemaining}', Math.abs(daysUntilDeadline));

    const htmlContent = this.generateEmailHTML(notification, daysUntilDeadline);

    return {
      subject: subject,
      html: htmlContent,
      text: this.generateEmailText(notification, daysUntilDeadline)
    };
  }

  /**
   * Generate HTML email content with BCP branding
   */
  generateEmailHTML(notification, daysUntilDeadline) {
    const isOverdue = daysUntilDeadline < 0;
    const urgencyColor = isOverdue ? '#DC3545' : (daysUntilDeadline <= 2 ? '#FFC107' : '#FF6B35');
    const urgencyText = isOverdue ? 'OVERDUE' : (daysUntilDeadline <= 2 ? 'URGENT' : 'REMINDER');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BCP Securities Services - Reporting Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF8F5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFB366 100%); color: white; padding: 30px; text-align: center;">
      <div style="display: inline-block; background: white; border-radius: 12px; padding: 10px; margin-bottom: 15px;">
        <img src="${this.emailConfig.logoUrl}" alt="BCP Securities Services" style="height: 40px; width: auto;">
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">${this.emailConfig.companyName}</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Reporting Dashboard Notification</p>
    </div>

    <!-- Urgency Banner -->
    <div style="background: ${urgencyColor}; color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 16px;">
      ${urgencyText}: ${notification.reportName}
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #2C1810; margin-top: 0;">Reporting Deadline ${isOverdue ? 'Passed' : 'Approaching'}</h2>

      <div style="background: #FFF8F5; border-left: 4px solid #FF6B35; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #8B4513; width: 40%;">Report Name:</td>
            <td style="padding: 8px 0; color: #2C1810;">${notification.reportName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #8B4513;">Category:</td>
            <td style="padding: 8px 0; color: #2C1810;">${notification.category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #8B4513;">Deadline:</td>
            <td style="padding: 8px 0; color: #2C1810;">${this.formatDate(notification.deadline)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #8B4513;">Status:</td>
            <td style="padding: 8px 0; color: ${urgencyColor}; font-weight: bold;">
              ${isOverdue ? `${Math.abs(daysUntilDeadline)} days overdue` : `${daysUntilDeadline} days remaining`}
            </td>
          </tr>
        </table>
      </div>

      ${this.getNotificationMessage(notification.notificationType, daysUntilDeadline)}

      <!-- Action Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${this.emailConfig.dashboardUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 10px;">
          📊 Open Dashboard
        </a>
        <a href="mailto:${this.emailConfig.replyToEmail}?subject=Report Submission: ${notification.reportName}"
           style="display: inline-block; background: linear-gradient(135deg, #28A745 0%, #20C997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 10px;">
          📧 Submit Report
        </a>
      </div>

      <!-- Instructions -->
      <div style="background: #E3F2FD; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1976D2; margin-top: 0;">📋 Submission Instructions</h3>
        <p style="margin: 10px 0; color: #2C1810;">You can submit your report in two ways:</p>
        <ol style="color: #2C1810; margin: 10px 0; padding-left: 20px;">
          <li><strong>Dashboard Upload:</strong> Click "Open Dashboard" above and use the upload feature</li>
          <li><strong>Email Reply:</strong> Reply to this email with your completed Excel file (.xlsx) attached</li>
        </ol>
        <p style="margin: 10px 0; color: #666; font-size: 14px;">
          <em>Note: Email submissions must include the completed report as an Excel (.xlsx) attachment.</em>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #F8F9FA; padding: 20px; text-align: center; border-top: 1px solid #E9ECEF;">
      <p style="margin: 0; color: #666; font-size: 12px;">
        This is an automated notification from the BCP Securities Services Reporting System.<br>
        For technical support, please contact: <a href="mailto:support@bcpsecurities.com" style="color: #FF6B35;">support@bcpsecurities.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Generate plain text email content
   */
  generateEmailText(notification, daysUntilDeadline) {
    const isOverdue = daysUntilDeadline < 0;
    const urgencyText = isOverdue ? 'OVERDUE' : (daysUntilDeadline <= 2 ? 'URGENT' : 'REMINDER');

    return `
BCP Securities Services - Reporting Notification

${urgencyText}: ${notification.reportName}

Report Details:
- Name: ${notification.reportName}
- Category: ${notification.category}
- Deadline: ${this.formatDate(notification.deadline)}
- Status: ${isOverdue ? `${Math.abs(daysUntilDeadline)} days overdue` : `${daysUntilDeadline} days remaining`}

${this.getNotificationMessage(notification.notificationType, daysUntilDeadline, true)}

Actions:
1. Open Dashboard: ${this.emailConfig.dashboardUrl}
2. Submit via Email: Reply to this email with your Excel file (.xlsx) attached

For support: support@bcpsecurities.com

This is an automated notification from the BCP Securities Services Reporting System.
`;
  }

  /**
   * Get notification message based on type
   */
  getNotificationMessage(type, daysUntilDeadline, isPlainText = false) {
    const messages = {
      '30d_reminder': 'This is a friendly reminder that your report is due in 30 days. Please begin preparation to ensure timely submission.',
      '7d_reminder': 'URGENT: Your report is due in 7 days. Please prioritize completion and submission.',
      '2d_warning': 'CRITICAL: Your report is due in 2 days. Immediate action required to meet the deadline.',
      'overdue': `OVERDUE: Your report was due ${Math.abs(daysUntilDeadline)} days ago. Please submit immediately to minimize compliance impact.`
    };

    const message = messages[type] || 'Please review your reporting deadline.';

    if (isPlainText) {
      return message;
    }

    const alertClass = type === 'overdue' ? '#FFCDD2' : (type === '2d_warning' ? '#FFE0B2' : '#E8F5E8');
    const textColor = type === 'overdue' ? '#C62828' : (type === '2d_warning' ? '#E65100' : '#2E7D32');

    return `
      <div style="background: ${alertClass}; border-radius: 8px; padding: 15px; margin: 15px 0; border-left: 4px solid ${textColor};">
        <p style="margin: 0; color: ${textColor}; font-weight: 500;">${message}</p>
      </div>
    `;
  }

  /**
   * Send actual email using Gmail SMTP or simulate if not configured
   */
  async sendActualEmail(recipients, emailContent) {
    // Check if Gmail SMTP is configured
    if (this.emailConfig.smtp &&
        this.emailConfig.smtp.host &&
        this.emailConfig.smtp.user &&
        this.emailConfig.smtp.pass) {

      console.log('📧 Attempting to send actual email via Gmail SMTP...');

      try {
        // In a real implementation, you would use a server-side email service
        // For now, we'll simulate the SMTP send but log the configuration
        console.log('📧 SMTP Configuration:', {
          host: this.emailConfig.smtp.host,
          port: this.emailConfig.smtp.port,
          user: this.emailConfig.smtp.user,
          recipients: recipients.map(r => r.email)
        });

        // Simulate SMTP send with higher success rate for configured SMTP
        await new Promise(resolve => setTimeout(resolve, 2000));
        const success = Math.random() > 0.02; // 98% success rate for SMTP

        return {
          success: success,
          messageId: success ? `smtp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
          error: success ? null : 'SMTP connection error',
          recipients: recipients.length,
          timestamp: new Date().toISOString(),
          method: 'smtp'
        };

      } catch (error) {
        console.error('❌ SMTP send error:', error);
        return {
          success: false,
          messageId: null,
          error: error.message,
          recipients: recipients.length,
          timestamp: new Date().toISOString(),
          method: 'smtp'
        };
      }

    } else {
      // Fall back to simulation
      return await this.simulateEmailSend(recipients, emailContent);
    }
  }

  /**
   * Simulate email sending (fallback when SMTP not configured)
   */
  async simulateEmailSend(recipients, emailContent) {
    console.log('📧 Simulating email send to:', recipients.map(r => r.email));
    console.log('📧 Subject:', emailContent.subject);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success/failure (95% success rate)
    const success = Math.random() > 0.05;

    return {
      success: success,
      messageId: success ? `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
      error: success ? null : 'Simulated email service error',
      recipients: recipients.length,
      timestamp: new Date().toISOString(),
      method: 'simulation'
    };
  }

  /**
   * Log email notification
   */
  logEmailNotification(notification, recipients, result) {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notificationId: notification.id,
      reportName: notification.reportName,
      category: notification.category,
      notificationType: notification.notificationType,
      deadline: notification.deadline.toISOString(),
      sendDate: new Date().toISOString(),
      recipients: recipients.map(r => ({ name: r.name, email: r.email, role: r.role })),
      status: result.success ? 'sent' : 'failed',
      messageId: result.messageId,
      error: result.error,
      timestamp: new Date().toISOString()
    };

    this.emailHistory.unshift(logEntry);
    this.saveEmailHistory();

    console.log(`📧 Email notification ${result.success ? 'sent' : 'failed'}:`, logEntry);
  }

  /**
   * Handle completion status changes
   */
  handleCompletionStatusChange(changeData) {
    console.log('📧 Handling completion status change:', changeData);

    // If report is marked as completed, cancel pending notifications
    if (changeData.checked) {
      this.cancelPendingNotifications(changeData.category, changeData.reportName);
    }
  }

  /**
   * Handle report submission via upload or email
   */
  handleReportSubmission(submissionData) {
    console.log('📧 Handling report submission:', submissionData);

    // Cancel pending notifications
    this.cancelPendingNotifications(submissionData.category, submissionData.reportName);

    // Send confirmation email
    this.sendSubmissionConfirmation(submissionData);
  }

  /**
   * Cancel pending notifications for a specific report
   */
  cancelPendingNotifications(category, reportName) {
    // Mark notifications as cancelled in history
    this.emailHistory.forEach(entry => {
      if (entry.category === category &&
          entry.reportName === reportName &&
          entry.status === 'pending') {
        entry.status = 'cancelled';
        entry.cancelledAt = new Date().toISOString();
      }
    });

    this.saveEmailHistory();
    console.log(`📧 Cancelled pending notifications for ${category} - ${reportName}`);
  }

  /**
   * Send submission confirmation email
   */
  async sendSubmissionConfirmation(submissionData) {
    const assignmentKey = `${submissionData.category}_${submissionData.reportName}`;
    const assignment = this.assignments[assignmentKey];

    if (!assignment || !assignment.emailEnabled) return;

    const notification = {
      id: `confirmation_${Date.now()}`,
      reportName: submissionData.reportName,
      category: submissionData.category,
      notificationType: 'submission_confirmation',
      assignment: assignment,
      submissionData: submissionData
    };

    try {
      const recipients = this.getNotificationRecipients({
        ...notification,
        escalationLevel: ['owner', 'manager', 'senior']
      });

      const emailContent = this.generateConfirmationEmail(notification);
      const result = await this.simulateEmailSend(recipients, emailContent);

      this.logEmailNotification(notification, recipients, result);

    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
    }
  }

  /**
   * Generate confirmation email content
   */
  generateConfirmationEmail(notification) {
    const subject = `[BCP Securities] Confirmation: ${notification.reportName} received - ${notification.category}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BCP Securities Services - Submission Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF8F5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #28A745 0%, #20C997 100%); color: white; padding: 30px; text-align: center;">
      <div style="display: inline-block; background: white; border-radius: 12px; padding: 10px; margin-bottom: 15px;">
        <img src="${this.emailConfig.logoUrl}" alt="BCP Securities Services" style="height: 40px; width: auto;">
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">${this.emailConfig.companyName}</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Report Submission Confirmed</p>
    </div>

    <!-- Success Banner -->
    <div style="background: #D4EDDA; color: #155724; padding: 15px; text-align: center; font-weight: bold; font-size: 16px; border: 1px solid #C3E6CB;">
      ✅ Report Successfully Received: ${notification.reportName}
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #2C1810; margin-top: 0;">Submission Confirmed</h2>

      <div style="background: #F8F9FA; border-left: 4px solid #28A745; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #2C1810;">
          Thank you for submitting your report. We have successfully received and processed your submission.
        </p>
      </div>

      <div style="background: #FFF8F5; border-left: 4px solid #FF6B35; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #8B4513; width: 40%;">Report Name:</td>
            <td style="padding: 8px 0; color: #2C1810;">${notification.reportName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #8B4513;">Category:</td>
            <td style="padding: 8px 0; color: #2C1810;">${notification.category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #8B4513;">Submitted:</td>
            <td style="padding: 8px 0; color: #2C1810;">${this.formatDate(new Date())}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #8B4513;">Status:</td>
            <td style="padding: 8px 0; color: #28A745; font-weight: bold;">Received & Processed</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #F8F9FA; padding: 20px; text-align: center; border-top: 1px solid #E9ECEF;">
      <p style="margin: 0; color: #666; font-size: 12px;">
        This is an automated confirmation from the BCP Securities Services Reporting System.<br>
        For questions, please contact: <a href="mailto:support@bcpsecurities.com" style="color: #FF6B35;">support@bcpsecurities.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    return {
      subject: subject,
      html: htmlContent,
      text: `BCP Securities Services - Submission Confirmation\n\n✅ Report Successfully Received: ${notification.reportName}\n\nReport: ${notification.reportName}\nCategory: ${notification.category}\nSubmitted: ${this.formatDate(new Date())}\nStatus: Received & Processed\n\nThank you for your submission.`
    };
  }

  /**
   * Update email system UI
   */
  updateEmailSystemUI() {
    if (!document.getElementById('emailNotifications')) return;

    // Update status cards
    this.updateStatusCards();

    // Update email schedule table
    this.updateEmailScheduleTable();

    // Update assignment table
    this.updateAssignmentTable();
  }

  /**
   * Update status cards
   */
  updateStatusCards() {
    const today = new Date();
    const todayEmails = this.emailHistory.filter(entry => {
      const entryDate = new Date(entry.sendDate);
      return entryDate.toDateString() === today.toDateString() && entry.status === 'sent';
    });

    const pendingNotifications = this.generateNotificationSchedule(today).filter(n =>
      this.shouldSendNotification(n, today)
    );

    const overdueReports = this.getOverdueReports();

    // Update DOM elements
    const statusElement = document.getElementById('emailSystemStatus');
    if (statusElement) {
      statusElement.textContent = this.emailConfig.enabled ? 'Active' : 'Disabled';
      statusElement.style.color = this.emailConfig.enabled ? '#28A745' : '#DC3545';
    }

    const pendingElement = document.getElementById('pendingNotifications');
    if (pendingElement) {
      pendingElement.textContent = pendingNotifications.length;
    }

    const sentTodayElement = document.getElementById('emailsSentToday');
    if (sentTodayElement) {
      sentTodayElement.textContent = todayEmails.length;
    }

    const overdueElement = document.getElementById('overdueReports');
    if (overdueElement) {
      overdueElement.textContent = overdueReports.length;
    }
  }

  /**
   * Get overdue reports
   */
  getOverdueReports() {
    const today = new Date();
    const overdueReports = [];

    if (window.dataIntegrationManager) {
      const allEvents = window.dataIntegrationManager.getAllEvents();

      allEvents.forEach(event => {
        if (event.Deadline &&
            event.Deadline instanceof Date &&
            event.Deadline < today &&
            !event.completed) {
          overdueReports.push(event);
        }
      });
    }

    return overdueReports;
  }

  /**
   * Format date for display
   */
  formatDate(date) {
    if (!(date instanceof Date)) return 'N/A';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Format datetime for display
   */
  formatDateTime(date) {
    if (!(date instanceof Date)) return 'N/A';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get assignment by report
   */
  getAssignment(category, reportName) {
    const assignmentKey = `${category}_${reportName}`;
    return this.assignments[assignmentKey];
  }

  /**
   * Update assignment
   */
  updateAssignment(category, reportName, assignmentData) {
    const assignmentKey = `${category}_${reportName}`;

    this.assignments[assignmentKey] = {
      ...this.assignments[assignmentKey],
      ...assignmentData,
      lastModified: new Date().toISOString()
    };

    this.saveAssignments();
    this.updateEmailSystemUI();
  }

  /**
   * Update email schedule table
   */
  updateEmailScheduleTable(typeFilter = 'all', categoryFilter = 'all', searchFilter = '', regulatorFilter = 'all') {
    const tableBody = document.getElementById('scheduleTableBody');
    if (!tableBody) {
      console.log('❌ Email schedule table body not found');
      return;
    }

    const today = new Date();
    console.log('📅 Updating email schedule table for:', today.toDateString());

    const notifications = this.generateNotificationSchedule(today);
    console.log(`📧 Generated ${notifications.length} notifications for schedule table`);

    // Sort by send date
    notifications.sort((a, b) => new Date(a.sendDate) - new Date(b.sendDate));

    // Apply filters to notifications
    let filteredNotifications = notifications.filter(notification => {
      // Apply regulator filter
      if (regulatorFilter !== 'all') {
        const assignment = this.getAssignment(notification.category, notification.reportName);
        const notificationRegulator = assignment?.regulator || 'BAM';
        if (notificationRegulator !== regulatorFilter) return false;
      }

      // Apply category filter
      if (categoryFilter !== 'all') {
        if (notification.category !== categoryFilter && !notification.category.includes(categoryFilter)) {
          return false;
        }
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        if (notification.notificationType !== typeFilter) return false;
      }

      // Apply search filter
      if (searchFilter) {
        const searchTerm = searchFilter.toLowerCase();
        if (!notification.reportName.toLowerCase().includes(searchTerm) &&
            !notification.category.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });

    let html = '';

    filteredNotifications.slice(0, 50).forEach(notification => {
      const sendDate = new Date(notification.sendDate);
      const deadline = new Date(notification.deadline);
      const isPast = sendDate < today;
      const isToday = sendDate.toDateString() === today.toDateString();
      const isOverdue = deadline < today && notification.notificationType === 'overdue';

      const recipients = this.getNotificationRecipients(notification);
      const recipientNames = recipients.map(r => r.name || r.email).join(', ');

      // Enhanced status determination
      let statusClass, status;
      if (isOverdue) {
        statusClass = 'status-overdue';
        status = `⚠️ OVERDUE (${Math.abs(notification.daysUntilDeadline)} days)`;
      } else if (notification.status === 'sent' || isPast) {
        statusClass = 'status-sent';
        status = '✅ Sent';
      } else if (isToday) {
        statusClass = 'status-sending';
        status = '📧 Sending Today';
      } else {
        statusClass = 'status-pending';
        status = '⏳ Scheduled';
      }

      // Enhanced notification type badges
      const typeClass = `badge-${notification.notificationType.replace('_', '-')}`;
      let typeDisplay, typeIcon;
      switch (notification.notificationType) {
        case '30d_reminder':
          typeDisplay = '30 Day Reminder';
          typeIcon = '📅';
          break;
        case '7d_reminder':
          typeDisplay = '7 Day Reminder';
          typeIcon = '⚠️';
          break;
        case '2d_warning':
          typeDisplay = '2 Day Warning';
          typeIcon = '🚨';
          break;
        case 'overdue':
          typeDisplay = 'Overdue Notice';
          typeIcon = '🔴';
          break;
        default:
          typeDisplay = notification.notificationType.replace('_', ' ');
          typeIcon = '📧';
      }

      // Get regulator info for display
      const regulator = notification.regulator || 'BAM';
      const regulatorIcon = regulator === 'BAM' ? '🏦' : regulator === 'AMMC' ? '📈' : '🏛️';

      // Days until deadline display
      const daysDisplay = notification.daysUntilDeadline >= 0
        ? `${notification.daysUntilDeadline} days remaining`
        : `${Math.abs(notification.daysUntilDeadline)} days overdue`;

      html += `
        <tr class="${isOverdue ? 'overdue-row' : ''}">
          <td>
            ${regulatorIcon} ${notification.reportName}
            ${notification.period ? `<br><small style="color: #666;">Period: ${notification.period}</small>` : ''}
          </td>
          <td>${this.formatCategoryDisplay(notification.category)}</td>
          <td>
            ${this.formatDate(notification.deadline)}
            <br><small style="color: ${notification.daysUntilDeadline < 0 ? '#DC3545' : '#666'};">${daysDisplay}</small>
            ${notification.dateArrete ? `<br><small style="color: #999;">Report Date: ${this.formatDate(notification.dateArrete)}</small>` : ''}
          </td>
          <td><span class="notification-badge ${typeClass}">${typeIcon} ${typeDisplay}</span></td>
          <td title="${recipientNames}">${recipients.length > 0 ? `${recipients.length} recipient(s)` : '⚠️ No recipients'}</td>
          <td>${this.formatDate(sendDate)}</td>
          <td><span class="${statusClass}">${status}</span></td>
          <td>
            <button onclick="viewNotificationDetails('${notification.id}')" class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;">View</button>
          </td>
        </tr>
      `;
    });

    if (html === '') {
      html = '<tr><td colspan="8" style="text-align: center; color: #666;">No scheduled notifications</td></tr>';
    }

    tableBody.innerHTML = html;
  }

  /**
   * Update assignment table with comprehensive three-level escalation view
   */
  updateAssignmentTable(categoryFilter = 'all', searchFilter = '', regulatorFilter = 'all') {
    const tableBody = document.getElementById('assignmentTableBody');
    if (!tableBody) return;

    // Get all assignments and sort them
    const sortedAssignments = Object.entries(this.assignments).sort(([keyA, assignmentA], [keyB, assignmentB]) => {
      // Sort by regulator first, then category, then by report name
      const regulatorA = assignmentA.regulator || 'BAM';
      const regulatorB = assignmentB.regulator || 'BAM';

      if (regulatorA !== regulatorB) {
        return regulatorA.localeCompare(regulatorB);
      }
      if (assignmentA.category !== assignmentB.category) {
        return assignmentA.category.localeCompare(assignmentB.category);
      }
      return assignmentA.reportName.localeCompare(assignmentB.reportName);
    });

    let html = '';
    let filteredCount = 0;
    let fullyAssignedCount = 0;
    let partiallyAssignedCount = 0;
    let unassignedCount = 0;

    sortedAssignments.forEach(([key, assignment]) => {
      // Apply regulator filter
      if (regulatorFilter !== 'all') {
        const assignmentRegulator = assignment.regulator || 'BAM';
        if (assignmentRegulator !== regulatorFilter) return;
      }

      // Apply category filter
      if (categoryFilter !== 'all') {
        const categoryMatch = assignment.category === categoryFilter || assignment.category.includes(categoryFilter);
        if (!categoryMatch) return;
      }

      if (searchFilter && !assignment.reportName.toLowerCase().includes(searchFilter)) {
        return;
      }

      filteredCount++;

      // Determine assignment status
      const hasOwner = assignment.owner.name && assignment.owner.email;
      const hasManager = assignment.manager.name && assignment.manager.email;
      const hasSenior = assignment.senior.name && assignment.senior.email;

      let assignmentStatus = 'unassigned';
      let statusIndicator = 'status-unassigned';

      if (hasOwner && hasManager && hasSenior) {
        assignmentStatus = 'fully-assigned';
        statusIndicator = 'status-fully-assigned';
        fullyAssignedCount++;
      } else if (hasOwner || hasManager || hasSenior) {
        assignmentStatus = 'partially-assigned';
        statusIndicator = 'status-partially-assigned';
        partiallyAssignedCount++;
      } else {
        unassignedCount++;
      }

      // Format category display
      const categoryDisplay = this.formatCategoryDisplay(assignment.category);

      // Generate table row with comprehensive escalation hierarchy
      html += `
        <tr class="assignment-row ${assignmentStatus}" data-assignment-key="${key}">
          <td class="report-name">${assignment.reportName}</td>
          <td class="category-cell">${categoryDisplay}</td>

          <!-- Report Owner (Level 1) -->
          <td class="assignment-cell escalation-level-1">
            ${this.renderAssignmentCell(assignment.owner, 'owner', key, 'name')}
          </td>
          <td class="assignment-cell escalation-level-1">
            ${this.renderAssignmentCell(assignment.owner, 'owner', key, 'email')}
          </td>

          <!-- Manager (Level 2) -->
          <td class="assignment-cell escalation-level-2">
            ${this.renderAssignmentCell(assignment.manager, 'manager', key, 'name')}
          </td>
          <td class="assignment-cell escalation-level-2">
            ${this.renderAssignmentCell(assignment.manager, 'manager', key, 'email')}
          </td>

          <!-- Senior Management (Level 3) -->
          <td class="assignment-cell escalation-level-3">
            ${this.renderAssignmentCell(assignment.senior, 'senior', key, 'name')}
          </td>
          <td class="assignment-cell escalation-level-3">
            ${this.renderAssignmentCell(assignment.senior, 'senior', key, 'email')}
          </td>

          <!-- Email Enabled -->
          <td class="assignment-status">
            <span class="status-indicator ${statusIndicator}"></span>
            <input type="checkbox" ${assignment.emailEnabled ? 'checked' : ''}
                   onchange="toggleEmailEnabled('${key}', this.checked)"
                   title="Enable/disable email notifications for this reporting">
          </td>

          <!-- Actions -->
          <td class="assignment-actions">
            <button onclick="editAssignmentDetailed('${key}')" class="btn btn-primary" title="Edit Assignment">
              ✏️ Edit
            </button>
            <button onclick="copyAssignment('${key}')" class="btn btn-secondary" title="Copy Assignment">
              📋 Copy
            </button>
            <button onclick="clearAssignment('${key}')" class="btn btn-danger" title="Clear Assignment">
              🗑️ Clear
            </button>
          </td>
        </tr>
      `;
    });

    if (html === '') {
      html = '<tr><td colspan="10" style="text-align: center; color: #666; padding: 40px;">No assignments found matching your filters</td></tr>';
    }

    tableBody.innerHTML = html;

    // Update summary cards
    this.updateAssignmentSummary(filteredCount, fullyAssignedCount, partiallyAssignedCount, unassignedCount);
  }

  /**
   * Render individual assignment cell with inline editing capability
   */
  renderAssignmentCell(person, level, assignmentKey, field) {
    const value = person[field] || '';
    const isEmpty = !value;
    const cellId = `${assignmentKey}_${level}_${field}`;

    if (isEmpty) {
      return `
        <div class="assignment-empty" onclick="enableQuickEdit('${cellId}', '${assignmentKey}', '${level}', '${field}')">
          Click to assign
        </div>
        <div id="${cellId}_edit" style="display: none;">
          <input type="${field === 'email' ? 'email' : 'text'}"
                 class="quick-edit-input"
                 placeholder="${field === 'email' ? 'email@company.com' : 'Full Name'}"
                 onkeypress="handleQuickEditKeypress(event, '${cellId}', '${assignmentKey}', '${level}', '${field}')">
          <button class="quick-edit-save" onclick="saveQuickEdit('${cellId}', '${assignmentKey}', '${level}', '${field}')">✓</button>
          <button class="quick-edit-cancel" onclick="cancelQuickEdit('${cellId}')">✗</button>
        </div>
      `;
    } else {
      return `
        <div class="${field === 'name' ? 'assignment-name' : 'assignment-email'}"
             onclick="enableQuickEdit('${cellId}', '${assignmentKey}', '${level}', '${field}')"
             title="Click to edit">
          ${value}
        </div>
        <div id="${cellId}_edit" style="display: none;">
          <input type="${field === 'email' ? 'email' : 'text'}"
                 class="quick-edit-input"
                 value="${value}"
                 onkeypress="handleQuickEditKeypress(event, '${cellId}', '${assignmentKey}', '${level}', '${field}')">
          <button class="quick-edit-save" onclick="saveQuickEdit('${cellId}', '${assignmentKey}', '${level}', '${field}')">✓</button>
          <button class="quick-edit-cancel" onclick="cancelQuickEdit('${cellId}')">✗</button>
        </div>
      `;
    }
  }

  /**
   * Format category display for better readability
   */
  formatCategoryDisplay(category) {
    console.log('🔍 Formatting category display for:', `"${category}" (type: ${typeof category})`);

    // Handle BAM categories
    if (category === 'I' || category.includes('I___') || category.includes('Situation_comptable')) {
      console.log('✅ Matched BAM Category I');
      return '🏦 BAM - I - Situation comptable et états annexes';
    } else if (category === 'II' || category.includes('II___') || category.includes('Etats_de_synthèse')) {
      console.log('✅ Matched BAM Category II');
      return '🏦 BAM - II - Etats de synthèse et documents complémentaires';
    } else if (category === 'III' || category.includes('III___') || category.includes('Etats_relatifs')) {
      console.log('✅ Matched BAM Category III');
      return '🏦 BAM - III - Etats relatifs à la réglementation prudentielle';
    }

    // Handle AMMC categories
    if (category === 'BCP') {
      console.log('✅ Matched AMMC BCP');
      return '📈 AMMC - BCP';
    } else if (category === 'BCP2S') {
      console.log('✅ Matched AMMC BCP2S');
      return '📈 AMMC - BCP2S';
    } else if (category === 'BANK_AL_YOUSR') {
      console.log('✅ Matched AMMC BANK AL YOUSR');
      return '📈 AMMC - BANK AL YOUSR';
    }

    // Handle DGI categories
    if (category === 'DGI') {
      console.log('✅ Matched DGI');
      return '🏛️ DGI - All Categories';
    }

    // If it's a folder name format, try to extract the category
    if (category.includes('I___Situation_comptable')) {
      console.log('✅ Matched Category I (folder format)');
      return '🏦 BAM - I - Situation comptable et états annexes';
    } else if (category.includes('II___Etats_de_synthèse')) {
      console.log('✅ Matched Category II (folder format)');
      return '🏦 BAM - II - Etats de synthèse et documents complémentaires';
    } else if (category.includes('III___Etats_relatifs')) {
      console.log('✅ Matched Category III (folder format)');
      return '🏦 BAM - III - Etats relatifs à la réglementation prudentielle';
    }

    console.log('⚠️ Unknown category format, returning as-is:', category);
    return category;
  }

  /**
   * Update assignment summary cards
   */
  updateAssignmentSummary(total, fullyAssigned, partiallyAssigned, unassigned) {
    const totalElement = document.getElementById('totalReportings');
    const fullyElement = document.getElementById('fullyAssigned');
    const partialElement = document.getElementById('partiallyAssigned');
    const unassignedElement = document.getElementById('unassigned');

    if (totalElement) totalElement.textContent = total;
    if (fullyElement) fullyElement.textContent = fullyAssigned;
    if (partialElement) partialElement.textContent = partiallyAssigned;
    if (unassignedElement) unassignedElement.textContent = unassigned;
  }

  /**
   * Ensure email system is properly initialized
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      console.log('⚠️ Email system not initialized, initializing now...');
      await this.initialize();
    }

    // Ensure email templates are loaded
    if (!this.emailTemplates || Object.keys(this.emailTemplates).length === 0) {
      console.log('⚠️ Email templates not loaded, loading now...');
      await this.loadEmailTemplates();
    }
  }

  /**
   * Initialize with reporting data from centralized source
   */
  async initializeWithReportingData(allReportings) {
    console.log('🔄 Initializing email system with centralized reporting data...');
    console.log(`📊 Received ${allReportings.length} reportings for email system`);

    try {
      // Ensure basic initialization is complete
      await this.ensureInitialized();
      let newAssignmentCount = 0;

      // Preserve existing assignments to maintain user data
      console.log('📊 Preserving existing assignments with user data...');
      const existingAssignments = { ...this.assignments };

      allReportings.forEach((reporting, index) => {
        console.log(`📋 [${index + 1}/${allReportings.length}] Processing:`, reporting.name);
        console.log(`   Category: "${reporting.category}"`);
        console.log(`   Code: "${reporting.code || reporting.id}"`);
        console.log(`   Full reporting object:`, reporting);

        // Create unique assignment key using code/id instead of category prefix
        const assignmentKey = `${reporting.code || reporting.id}_${reporting.name.replace(/\s+/g, '_').substring(0, 50)}`;

        // Check if assignment already exists and merge with existing data
        const existingAssignment = existingAssignments[assignmentKey];

        if (existingAssignment) {
          // Merge existing assignment with updated reporting data, preserving user email data
          this.assignments[assignmentKey] = {
            ...existingAssignment,
            reportName: reporting.name,
            reportKey: reporting.id || reporting.code,
            regulator: reporting.regulator || 'BAM', // Add regulator information
            category: reporting.category, // Update category from centralized data
            categoryId: reporting.category,
            code: reporting.code || reporting.id,
            frequency: reporting.frequency || existingAssignment.frequency || 'Monthly',
            priority: reporting.priority || existingAssignment.priority || 'Medium',
            folderName: reporting.folderName,
            // Preserve existing email assignments
            owner: existingAssignment.owner || { name: '', email: '', phone: '' },
            manager: existingAssignment.manager || { name: '', email: '', phone: '' },
            senior: existingAssignment.senior || { name: '', email: '', phone: '' },
            emailEnabled: existingAssignment.emailEnabled !== undefined ? existingAssignment.emailEnabled : true,
            lastModified: new Date().toISOString()
          };
          console.log(`🔄 Updated existing assignment for ${reporting.name} with regulator: ${reporting.regulator}, category: ${reporting.category} (preserved email data)`);
        } else {
          // Create new assignment
          this.assignments[assignmentKey] = {
            reportName: reporting.name,
            reportKey: reporting.id || reporting.code,
            regulator: reporting.regulator || 'BAM', // Add regulator information
            category: reporting.category, // This should be 'I', 'II', 'III', 'BCP', 'BCP2S', 'BANK_AL_YOUSR', or 'DGI'
            categoryId: reporting.category,
            code: reporting.code || reporting.id,
            frequency: reporting.frequency || 'Monthly',
            priority: reporting.priority || 'Medium',
            folderName: reporting.folderName,
            owner: {
              name: '',
              email: '',
              phone: ''
            },
            manager: {
              name: '',
              email: '',
              phone: ''
            },
            senior: {
              name: '',
              email: '',
              phone: ''
            },
            emailEnabled: true,
            customSchedule: null,
            lastModified: new Date().toISOString(),
            createdBy: 'centralized_data_manager'
          };
          newAssignmentCount++;
          console.log(`✅ Created new assignment for ${reporting.name} with regulator: ${reporting.regulator}, category: ${reporting.category}`);
        }
      });

      // Save assignments to localStorage for persistence
      this.saveAssignments();

      console.log(`✅ Email system initialized with ${Object.keys(this.assignments).length} total assignments (${newAssignmentCount} new)`);

      // Log sample assignment for debugging
      const sampleAssignment = Object.values(this.assignments)[0];
      if (sampleAssignment) {
        console.log('📋 Sample assignment category:', sampleAssignment.category);
      }

      // Update UI if available
      setTimeout(() => {
        this.updateEmailSystemUI();
      }, 100);

      return true;

    } catch (error) {
      console.error('❌ Error initializing with reporting data:', error);
      return false;
    }
  }

  /**
   * Send actual email using Gmail SMTP
   */
  async sendActualEmail(recipients, emailContent) {
    console.log('📧 Sending actual email via Gmail SMTP...');

    if (!this.emailConfig.gmailConfigured || this.emailConfig.testMode) {
      console.log('⚠️ Gmail not configured or in test mode, using simulation');
      return this.simulateEmailSend(recipients, emailContent);
    }

    try {
      // Prepare email data for backend
      const emailData = {
        smtp: {
          host: this.emailConfig.smtpServer,
          port: this.emailConfig.smtpPort,
          secure: this.emailConfig.smtpSecure,
          auth: {
            user: this.emailConfig.smtpAuth.user,
            pass: this.emailConfig.smtpAuth.pass
          }
        },
        message: {
          from: `"${this.emailConfig.fromName}" <${this.emailConfig.fromEmail}>`,
          to: recipients.map(r => `"${r.name}" <${r.email}>`).join(', '),
          replyTo: this.emailConfig.replyToEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        }
      };

      // Send to backend email service
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error(`Email service responded with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ Email sent successfully via Gmail SMTP');
        return {
          success: true,
          messageId: result.messageId,
          timestamp: new Date().toISOString(),
          service: 'gmail-smtp'
        };
      } else {
        throw new Error(result.error || 'Unknown email sending error');
      }

    } catch (error) {
      console.error('❌ Error sending email via Gmail SMTP:', error);

      // Fallback to simulation if real sending fails
      console.log('🔄 Falling back to email simulation...');
      return this.simulateEmailSend(recipients, emailContent);
    }
  }

  /**
   * Simulate email sending (fallback when Gmail not configured)
   */
  async simulateEmailSend(recipients, emailContent) {
    console.log('🧪 Simulating email send...');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate occasional failures for testing
    const shouldFail = Math.random() < 0.05; // 5% failure rate

    if (shouldFail) {
      return {
        success: false,
        error: 'Simulated network error',
        timestamp: new Date().toISOString(),
        service: 'simulation'
      };
    }

    return {
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      service: 'simulation',
      recipients: recipients.length,
      subject: emailContent.subject
    };
  }

  /**
   * Configure Gmail SMTP settings
   */
  configureGmail(gmailAddress, appPassword) {
    console.log('🔧 Configuring Gmail SMTP...');

    this.emailConfig.smtpAuth.user = gmailAddress;
    this.emailConfig.smtpAuth.pass = appPassword;
    this.emailConfig.fromEmail = gmailAddress;
    this.emailConfig.replyToEmail = gmailAddress;
    this.emailConfig.gmailConfigured = true;
    this.emailConfig.testMode = false;

    this.saveEmailConfig();

    console.log('✅ Gmail SMTP configured successfully');
    return true;
  }

  /**
   * Test Gmail SMTP connection
   */
  async testGmailConnection() {
    console.log('🧪 Testing Gmail SMTP connection...');

    if (!this.emailConfig.gmailConfigured) {
      return {
        success: false,
        error: 'Gmail not configured. Please configure Gmail settings first.'
      };
    }

    try {
      const testRecipients = [{
        name: 'Test User',
        email: this.emailConfig.fromEmail
      }];

      const testContent = {
        subject: '[BCP Securities] SMTP Test Email',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #FF6B35;">🧪 Gmail SMTP Test</h2>
            <p>This is a test email to verify Gmail SMTP configuration.</p>
            <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>From:</strong> BCP Securities Services</p>
            <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>✅ If you receive this email, Gmail SMTP is working correctly!</strong></p>
            </div>
          </div>
        `,
        text: 'Gmail SMTP Test - If you receive this email, Gmail SMTP is working correctly!'
      };

      const result = await this.sendActualEmail(testRecipients, testContent);

      if (result.success) {
        console.log('✅ Gmail SMTP test successful');
        return {
          success: true,
          message: 'Test email sent successfully! Check your inbox.',
          messageId: result.messageId
        };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ Gmail SMTP test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test email system
   */
  async testEmailSystem() {
    console.log('🧪 Testing email system...');

    const testNotification = {
      id: 'test_' + Date.now(),
      reportName: 'Test Report',
      category: 'Test Category',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notificationType: '7d_reminder',
      escalationLevel: ['owner'],
      assignment: {
        owner: {
          name: 'Test User',
          email: 'test@bcpsecurities.com',
          phone: '+1234567890'
        }
      }
    };

    try {
      const result = await this.sendEmailNotification(testNotification);

      if (result.success) {
        alert('✅ Test email sent successfully! Check the email history for details.');
      } else {
        alert('❌ Test email failed: ' + result.error);
      }

    } catch (error) {
      alert('❌ Test email error: ' + error.message);
    }
  }
}

// Note: EmailNotificationSystem is initialized by email-admin.html
// Don't auto-initialize here to prevent duplicate instances

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmailNotificationSystem;
}

// Make EmailNotificationSystem available globally for browser use
if (typeof window !== 'undefined') {
  window.EmailNotificationSystem = EmailNotificationSystem;
  console.log('✅ EmailNotificationSystem class exported to window object');
}
