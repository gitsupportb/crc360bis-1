/**
 * Upload Logs Management System
 * Provides advanced functionality for tracking and analyzing upload events
 * Integrates with the BCP Securities Services Reporting Dashboard
 */

class UploadLogsManager {
  constructor() {
    this.storageKey = 'uploadLogs';
    this.maxLogs = 1000;
  }

  /**
   * Log a new upload event
   */
  logUpload(reportName, fileName, category, additionalData = {}) {
    const uploadLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      reportName: reportName,
      fileName: fileName,
      category: category,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
      dayOfWeek: new Date().getDay(),
      user: additionalData.user || 'Current User',
      fileSize: additionalData.fileSize || null,
      fileType: this.getFileExtension(fileName),
      uploadDuration: additionalData.uploadDuration || null,
      success: additionalData.success !== false, // Default to true
      errorMessage: additionalData.errorMessage || null,
      metadata: additionalData.metadata || {}
    };

    this.saveLogs([...this.getLogs(), uploadLog]);
    return uploadLog;
  }

  /**
   * Get all upload logs with optional filtering
   */
  getLogs(filters = {}) {
    const logs = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    
    if (Object.keys(filters).length === 0) return logs;

    return logs.filter(log => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        const logValue = log[key];

        if (key === 'dateRange' && filterValue.start && filterValue.end) {
          const logDate = new Date(log.timestamp);
          return logDate >= new Date(filterValue.start) && logDate <= new Date(filterValue.end);
        }

        if (Array.isArray(filterValue)) {
          return filterValue.includes(logValue);
        }

        return logValue === filterValue;
      });
    });
  }

  /**
   * Get comprehensive upload statistics
   */
  getStatistics(period = 'all', filters = {}) {
    const logs = this.getLogs(filters);
    const now = new Date();

    const stats = {
      total: logs.length,
      successful: logs.filter(log => log.success).length,
      failed: logs.filter(log => !log.success).length,
      byCategory: { I: 0, II: 0, III: 0 },
      byFileType: {},
      byTimeOfDay: Array(24).fill(0),
      byDayOfWeek: Array(7).fill(0),
      byMonth: Array(12).fill(0),
      recentActivity: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        thisYear: 0
      },
      trends: {
        daily: this.calculateDailyTrends(logs),
        weekly: this.calculateWeeklyTrends(logs),
        monthly: this.calculateMonthlyTrends(logs)
      },
      topReports: this.getTopReports(logs),
      averageFileSize: this.calculateAverageFileSize(logs),
      peakHours: this.calculatePeakHours(logs)
    };

    // Calculate category breakdown
    logs.forEach(log => {
      const categoryKey = this.getCategoryKey(log.category);
      if (stats.byCategory.hasOwnProperty(categoryKey)) {
        stats.byCategory[categoryKey]++;
      }

      // File type breakdown
      if (log.fileType) {
        stats.byFileType[log.fileType] = (stats.byFileType[log.fileType] || 0) + 1;
      }

      // Time analysis
      const logDate = new Date(log.timestamp);
      const hour = logDate.getHours();
      const dayOfWeek = logDate.getDay();
      const month = logDate.getMonth();

      stats.byTimeOfDay[hour]++;
      stats.byDayOfWeek[dayOfWeek]++;
      stats.byMonth[month]++;

      // Recent activity
      const daysDiff = Math.floor((now - logDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === 0) stats.recentActivity.today++;
      if (daysDiff <= 7) stats.recentActivity.thisWeek++;
      if (logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()) {
        stats.recentActivity.thisMonth++;
      }
      if (logDate.getFullYear() === now.getFullYear()) {
        stats.recentActivity.thisYear++;
      }
    });

    return stats;
  }

  /**
   * Export logs to various formats
   */
  exportLogs(format = 'json', filters = {}) {
    const logs = this.getLogs(filters);
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportToCSV(logs, timestamp);
      case 'json':
        return this.exportToJSON(logs, timestamp);
      case 'excel':
        return this.exportToExcel(logs, timestamp);
      default:
        throw new Error('Unsupported export format');
    }
  }

  /**
   * Clean up old logs based on retention policy
   */
  cleanupLogs(retentionDays = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const logs = this.getLogs();
    const filteredLogs = logs.filter(log => new Date(log.timestamp) >= cutoffDate);
    
    this.saveLogs(filteredLogs);
    return logs.length - filteredLogs.length; // Return number of deleted logs
  }

  /**
   * Get upload activity heatmap data
   */
  getHeatmapData(year = new Date().getFullYear()) {
    const logs = this.getLogs({ year });
    const heatmapData = {};

    logs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    return heatmapData;
  }

  // Private helper methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getFileExtension(fileName) {
    return fileName.split('.').pop().toLowerCase();
  }

  getCategoryKey(category) {
    if (category.includes('I –')) return 'I';
    if (category.includes('II –')) return 'II';
    if (category.includes('III –')) return 'III';
    return 'Unknown';
  }

  saveLogs(logs) {
    // Keep only the most recent logs to prevent storage overflow
    const trimmedLogs = logs.slice(-this.maxLogs);
    localStorage.setItem(this.storageKey, JSON.stringify(trimmedLogs));
  }

  calculateDailyTrends(logs) {
    const trends = {};
    logs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + 1;
    });
    return trends;
  }

  calculateWeeklyTrends(logs) {
    const trends = {};
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      trends[weekKey] = (trends[weekKey] || 0) + 1;
    });
    return trends;
  }

  calculateMonthlyTrends(logs) {
    const trends = {};
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      trends[monthKey] = (trends[monthKey] || 0) + 1;
    });
    return trends;
  }

  getTopReports(logs) {
    const reportCounts = {};
    logs.forEach(log => {
      reportCounts[log.reportName] = (reportCounts[log.reportName] || 0) + 1;
    });

    return Object.entries(reportCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }

  calculateAverageFileSize(logs) {
    const sizeLogs = logs.filter(log => log.fileSize);
    if (sizeLogs.length === 0) return null;
    
    const totalSize = sizeLogs.reduce((sum, log) => sum + log.fileSize, 0);
    return Math.round(totalSize / sizeLogs.length);
  }

  calculatePeakHours(logs) {
    const hourCounts = Array(24).fill(0);
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts);
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count === maxCount)
      .map(({ hour }) => hour);

    return peakHours;
  }

  exportToCSV(logs, timestamp) {
    const headers = ['Timestamp', 'Report Name', 'File Name', 'Category', 'User', 'File Type', 'Success', 'Error Message'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        `"${log.reportName}"`,
        `"${log.fileName}"`,
        log.category,
        log.user,
        log.fileType || '',
        log.success,
        `"${log.errorMessage || ''}"`
      ].join(','))
    ].join('\n');

    return {
      content: csvContent,
      filename: `upload-logs-${timestamp}.csv`,
      mimeType: 'text/csv'
    };
  }

  exportToJSON(logs, timestamp) {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalRecords: logs.length,
        version: '1.0'
      },
      logs: logs
    };

    return {
      content: JSON.stringify(exportData, null, 2),
      filename: `upload-logs-${timestamp}.json`,
      mimeType: 'application/json'
    };
  }

  exportToExcel(logs, timestamp) {
    // For Excel export, we'll create a detailed CSV that can be opened in Excel
    const headers = [
      'ID', 'Timestamp', 'Date', 'Time', 'Report Name', 'File Name', 'Category', 
      'User', 'File Type', 'File Size', 'Success', 'Error Message', 'Upload Duration'
    ];
    
    const csvContent = [
      headers.join(','),
      ...logs.map(log => {
        const date = new Date(log.timestamp);
        return [
          log.id,
          log.timestamp,
          date.toISOString().split('T')[0],
          date.toTimeString().split(' ')[0],
          `"${log.reportName}"`,
          `"${log.fileName}"`,
          `"${log.category}"`,
          log.user,
          log.fileType || '',
          log.fileSize || '',
          log.success,
          `"${log.errorMessage || ''}"`,
          log.uploadDuration || ''
        ].join(',');
      })
    ].join('\n');

    return {
      content: csvContent,
      filename: `upload-logs-detailed-${timestamp}.csv`,
      mimeType: 'text/csv'
    };
  }
}

// Create global instance
window.uploadLogsManager = new UploadLogsManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UploadLogsManager;
}
