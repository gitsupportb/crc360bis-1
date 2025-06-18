/**
 * BCP Securities Services - Email Submission Handler
 * 
 * Handles email replies with Excel attachments for report submissions.
 * Automatically processes .xlsx files and updates completion status.
 */

class EmailSubmissionHandler {
  constructor() {
    this.isInitialized = false;
    this.submissionQueue = [];
    this.processingInterval = null;
    this.allowedExtensions = ['.xlsx', '.xls'];
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    
    this.initialize();
  }

  /**
   * Initialize the email submission handler
   */
  async initialize() {
    console.log('🚀 Initializing Email Submission Handler...');
    
    try {
      // Set up email monitoring (in production, this would connect to email service)
      this.setupEmailMonitoring();
      
      // Set up file processing queue
      this.setupProcessingQueue();
      
      this.isInitialized = true;
      console.log('✅ Email Submission Handler initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing Email Submission Handler:', error);
    }
  }

  /**
   * Set up email monitoring
   * In production, this would integrate with email service webhooks or IMAP
   */
  setupEmailMonitoring() {
    // Simulate email monitoring
    console.log('📧 Setting up email monitoring for submissions...');
    
    // In production, you would:
    // 1. Set up IMAP connection to monitor the reply-to email
    // 2. Set up webhooks from email service (SendGrid, AWS SES, etc.)
    // 3. Parse incoming emails for attachments
    // 4. Validate sender and subject line
    
    // For demo purposes, we'll create a manual submission interface
    this.createManualSubmissionInterface();
  }

  /**
   * Create manual submission interface for demo
   */
  createManualSubmissionInterface() {
    // This simulates receiving emails with attachments
    window.simulateEmailSubmission = (reportName, category, fileName, fileContent) => {
      this.processEmailSubmission({
        from: 'user@bcpsecurities.com',
        subject: `Report Submission: ${reportName}`,
        reportName: reportName,
        category: category,
        attachments: [{
          filename: fileName,
          content: fileContent,
          size: fileContent ? fileContent.length : 1024
        }],
        receivedAt: new Date().toISOString()
      });
    };
  }

  /**
   * Set up processing queue
   */
  setupProcessingQueue() {
    // Process submissions every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processSubmissionQueue();
    }, 30000);
  }

  /**
   * Process email submission
   */
  async processEmailSubmission(emailData) {
    console.log('📧 Processing email submission:', emailData);
    
    try {
      // Validate email
      const validation = this.validateEmailSubmission(emailData);
      if (!validation.valid) {
        console.error('❌ Email validation failed:', validation.errors);
        await this.sendRejectionEmail(emailData, validation.errors);
        return;
      }

      // Extract report information
      const reportInfo = this.extractReportInfo(emailData);
      if (!reportInfo) {
        console.error('❌ Could not extract report information');
        await this.sendRejectionEmail(emailData, ['Could not identify report from email']);
        return;
      }

      // Process attachments
      const processedAttachments = await this.processAttachments(emailData.attachments, reportInfo);
      if (processedAttachments.length === 0) {
        console.error('❌ No valid attachments found');
        await this.sendRejectionEmail(emailData, ['No valid Excel attachments found']);
        return;
      }

      // Save files to appropriate folder structure
      const savedFiles = await this.saveSubmissionFiles(processedAttachments, reportInfo);
      
      // Update completion status
      this.updateCompletionStatus(reportInfo, savedFiles);
      
      // Log submission
      this.logEmailSubmission(emailData, reportInfo, savedFiles);
      
      // Send confirmation
      await this.sendConfirmationEmail(emailData, reportInfo, savedFiles);
      
      console.log('✅ Email submission processed successfully');
      
    } catch (error) {
      console.error('❌ Error processing email submission:', error);
      await this.sendErrorEmail(emailData, error.message);
    }
  }

  /**
   * Validate email submission
   */
  validateEmailSubmission(emailData) {
    const errors = [];
    
    // Check if email has attachments
    if (!emailData.attachments || emailData.attachments.length === 0) {
      errors.push('No attachments found in email');
    }
    
    // Check for valid Excel attachments
    const validAttachments = emailData.attachments.filter(att => 
      this.allowedExtensions.some(ext => att.filename.toLowerCase().endsWith(ext))
    );
    
    if (validAttachments.length === 0) {
      errors.push('No valid Excel files (.xlsx or .xls) found in attachments');
    }
    
    // Check file sizes
    const oversizedFiles = emailData.attachments.filter(att => att.size > this.maxFileSize);
    if (oversizedFiles.length > 0) {
      errors.push(`Files too large: ${oversizedFiles.map(f => f.filename).join(', ')} (max ${this.maxFileSize / 1024 / 1024}MB)`);
    }
    
    // Check sender authorization (in production, validate against user database)
    if (!emailData.from || !emailData.from.includes('@')) {
      errors.push('Invalid sender email address');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Extract report information from email
   */
  extractReportInfo(emailData) {
    // Try to extract from subject line
    let reportName = null;
    let category = null;
    
    // Look for "Report Submission: [Report Name]" pattern
    const subjectMatch = emailData.subject.match(/Report Submission:\s*(.+)/i);
    if (subjectMatch) {
      reportName = subjectMatch[1].trim();
    }
    
    // If provided in the simulation, use those values
    if (emailData.reportName) {
      reportName = emailData.reportName;
    }
    if (emailData.category) {
      category = emailData.category;
    }
    
    // Try to match against known reports
    if (reportName && window.dataIntegrationManager) {
      const reportingDefs = window.dataIntegrationManager.reportingDefinitions;
      
      // Search through all categories to find matching report
      for (const [catKey, reports] of Object.entries(reportingDefs)) {
        for (const [repName, repData] of Object.entries(reports)) {
          if (repName.toLowerCase().includes(reportName.toLowerCase()) ||
              reportName.toLowerCase().includes(repName.toLowerCase())) {
            return {
              reportName: repName,
              category: catKey,
              originalReportName: reportName,
              sender: emailData.from,
              receivedAt: emailData.receivedAt
            };
          }
        }
      }
    }
    
    // If no match found, return what we have
    if (reportName) {
      return {
        reportName: reportName,
        category: category || 'Unknown',
        originalReportName: reportName,
        sender: emailData.from,
        receivedAt: emailData.receivedAt
      };
    }
    
    return null;
  }

  /**
   * Process attachments
   */
  async processAttachments(attachments, reportInfo) {
    const processedAttachments = [];
    
    for (const attachment of attachments) {
      // Check if it's a valid Excel file
      const isValidExcel = this.allowedExtensions.some(ext => 
        attachment.filename.toLowerCase().endsWith(ext)
      );
      
      if (!isValidExcel) continue;
      
      // Check file size
      if (attachment.size > this.maxFileSize) {
        console.warn(`⚠️ File ${attachment.filename} is too large (${attachment.size} bytes)`);
        continue;
      }
      
      // Process the file
      const processedFile = {
        originalName: attachment.filename,
        sanitizedName: this.sanitizeFileName(attachment.filename),
        content: attachment.content,
        size: attachment.size,
        type: attachment.filename.toLowerCase().endsWith('.xlsx') ? 'xlsx' : 'xls',
        processedAt: new Date().toISOString()
      };
      
      processedAttachments.push(processedFile);
    }
    
    return processedAttachments;
  }

  /**
   * Sanitize file name
   */
  sanitizeFileName(fileName) {
    // Remove special characters and spaces
    const sanitized = fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '');
    
    // Ensure it has a proper extension
    if (!this.allowedExtensions.some(ext => sanitized.toLowerCase().endsWith(ext))) {
      return sanitized + '.xlsx';
    }
    
    return sanitized;
  }

  /**
   * Save submission files to folder structure
   */
  async saveSubmissionFiles(attachments, reportInfo) {
    const savedFiles = [];
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    for (const attachment of attachments) {
      // Generate file path following the existing structure
      const folderPath = `./UPLOADED_REPORTINGS/${reportInfo.category}/${reportInfo.reportName}/${year}/${month}`;
      const fileName = `${attachment.sanitizedName}`;
      const fullPath = `${folderPath}/${fileName}`;
      
      try {
        // In a real implementation, you would save the file to the file system
        // For demo purposes, we'll simulate this
        const fileInfo = {
          path: fullPath,
          folderPath: folderPath,
          fileName: fileName,
          originalName: attachment.originalName,
          size: attachment.size,
          type: attachment.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: reportInfo.sender,
          uploadMethod: 'email'
        };
        
        // Simulate file save
        console.log(`💾 Simulating file save: ${fullPath}`);
        
        // Log to upload logs
        if (window.uploadLogsManager) {
          window.uploadLogsManager.logUpload(
            reportInfo.reportName,
            fileName,
            reportInfo.category,
            {
              user: reportInfo.sender,
              fileSize: attachment.size,
              uploadMethod: 'email',
              success: true
            }
          );
        }
        
        savedFiles.push(fileInfo);
        
      } catch (error) {
        console.error(`❌ Error saving file ${attachment.originalName}:`, error);
      }
    }
    
    return savedFiles;
  }

  /**
   * Update completion status
   */
  updateCompletionStatus(reportInfo, savedFiles) {
    if (savedFiles.length === 0) return;
    
    // Update checkbox states and completion tracking
    if (window.dataIntegrationManager) {
      // Find the corresponding event and mark as completed
      const allEvents = window.dataIntegrationManager.getAllEvents();
      
      allEvents.forEach(event => {
        if (event.event === reportInfo.reportName && 
            event.categoryKey === reportInfo.category) {
          
          // Mark as completed
          event.completed = true;
          
          // Trigger checkbox update
          const checkboxData = {
            key: `${reportInfo.category}_${reportInfo.reportName}_${event.Deadline.getTime()}`,
            checked: true,
            category: reportInfo.category,
            reportName: reportInfo.reportName,
            method: 'email_submission'
          };
          
          window.dataIntegrationManager.handleCheckboxChange(checkboxData);
          
          // Trigger upload event
          const uploadData = {
            reportName: reportInfo.reportName,
            fileName: savedFiles[0].fileName,
            category: reportInfo.category,
            uploadMethod: 'email',
            user: reportInfo.sender
          };
          
          window.dataIntegrationManager.handleUploadEvent(uploadData);
        }
      });
    }
    
    // Update UI
    if (typeof updateAll === 'function') {
      updateAll();
    }
    
    console.log(`✅ Updated completion status for ${reportInfo.category} - ${reportInfo.reportName}`);
  }

  /**
   * Log email submission
   */
  logEmailSubmission(emailData, reportInfo, savedFiles) {
    const logEntry = {
      id: `email_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'email_submission',
      reportName: reportInfo.reportName,
      category: reportInfo.category,
      sender: reportInfo.sender,
      receivedAt: reportInfo.receivedAt,
      processedAt: new Date().toISOString(),
      filesCount: savedFiles.length,
      files: savedFiles.map(f => ({
        name: f.fileName,
        originalName: f.originalName,
        size: f.size,
        path: f.path
      })),
      status: 'processed'
    };
    
    // Save to email submission history
    const existingHistory = JSON.parse(localStorage.getItem('emailSubmissionHistory') || '[]');
    existingHistory.unshift(logEntry);
    
    // Keep only last 500 entries
    if (existingHistory.length > 500) {
      existingHistory.splice(500);
    }
    
    localStorage.setItem('emailSubmissionHistory', JSON.stringify(existingHistory));
    
    console.log('📧 Email submission logged:', logEntry);
  }

  /**
   * Send confirmation email
   */
  async sendConfirmationEmail(emailData, reportInfo, savedFiles) {
    if (window.emailNotificationSystem) {
      const submissionData = {
        reportName: reportInfo.reportName,
        category: reportInfo.category,
        fileName: savedFiles[0]?.fileName || 'Unknown',
        uploadMethod: 'email',
        user: reportInfo.sender,
        filesCount: savedFiles.length
      };
      
      await window.emailNotificationSystem.sendSubmissionConfirmation(submissionData);
    }
  }

  /**
   * Send rejection email
   */
  async sendRejectionEmail(emailData, errors) {
    console.log('📧 Sending rejection email for:', emailData.subject, 'Errors:', errors);
    // In production, send actual rejection email with error details
  }

  /**
   * Send error email
   */
  async sendErrorEmail(emailData, errorMessage) {
    console.log('📧 Sending error email for:', emailData.subject, 'Error:', errorMessage);
    // In production, send actual error email
  }

  /**
   * Process submission queue
   */
  processSubmissionQueue() {
    if (this.submissionQueue.length === 0) return;
    
    console.log(`📧 Processing ${this.submissionQueue.length} queued submissions...`);
    
    const submissions = this.submissionQueue.splice(0, 5); // Process up to 5 at a time
    
    submissions.forEach(submission => {
      this.processEmailSubmission(submission);
    });
  }

  /**
   * Add submission to queue
   */
  queueSubmission(emailData) {
    this.submissionQueue.push(emailData);
    console.log(`📧 Queued email submission. Queue length: ${this.submissionQueue.length}`);
  }

  /**
   * Get submission history
   */
  getSubmissionHistory() {
    return JSON.parse(localStorage.getItem('emailSubmissionHistory') || '[]');
  }

  /**
   * Clear submission history
   */
  clearSubmissionHistory() {
    localStorage.removeItem('emailSubmissionHistory');
    console.log('📧 Email submission history cleared');
  }
}

// Initialize email submission handler when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    window.emailSubmissionHandler = new EmailSubmissionHandler();
  }, 2500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmailSubmissionHandler;
}
