/**
 * Export/Backup Service - Sprint 6
 * Data export and backup functionality
 */

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = 'json' | 'csv' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeSettings: boolean;
  includeTasks: boolean;
  includeCompletedTasks: boolean;
  includeAchievements: boolean;
  includeInsights: boolean;
  includeNotes: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportResult {
  success: boolean;
  data?: string;
  filename?: string;
  mimeType?: string;
  error?: string;
  exportedAt: Date;
  itemCounts: {
    tasks: number;
    completedTasks: number;
    achievements: number;
    notes: number;
  };
}

export interface BackupData {
  version: string;
  exportedAt: string;
  settings?: Record<string, unknown>;
  tasks?: Array<Record<string, unknown>>;
  completedTasks?: Array<Record<string, unknown>>;
  achievements?: Array<Record<string, unknown>>;
  insights?: Record<string, unknown>;
  notes?: Array<Record<string, unknown>>;
  streaks?: Record<string, unknown>;
}

export interface ImportResult {
  success: boolean;
  error?: string;
  importedAt: Date;
  itemCounts: {
    tasks: number;
    settings: number;
    achievements: number;
    notes: number;
  };
  warnings: string[];
}

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'json',
  includeSettings: true,
  includeTasks: true,
  includeCompletedTasks: true,
  includeAchievements: true,
  includeInsights: true,
  includeNotes: true,
};

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export class ExportService {
  private version = '1.0.0';

  /**
   * Export all data
   */
  async exportData(
    data: {
      settings?: Record<string, unknown>;
      tasks?: Array<Record<string, unknown>>;
      completedTasks?: Array<Record<string, unknown>>;
      achievements?: Array<Record<string, unknown>>;
      insights?: Record<string, unknown>;
      notes?: Array<Record<string, unknown>>;
      streaks?: Record<string, unknown>;
    },
    options: ExportOptions = DEFAULT_EXPORT_OPTIONS
  ): Promise<ExportResult> {
    const exportedAt = new Date();

    try {
      // Build export data based on options
      const exportData: BackupData = {
        version: this.version,
        exportedAt: exportedAt.toISOString(),
      };

      let taskCount = 0;
      let completedTaskCount = 0;
      let achievementCount = 0;
      let noteCount = 0;

      if (options.includeSettings && data.settings) {
        exportData.settings = data.settings;
      }

      if (options.includeTasks && data.tasks) {
        const filteredTasks = this.filterByDateRange(
          data.tasks,
          options.dateRange
        );
        exportData.tasks = filteredTasks;
        taskCount = filteredTasks.length;
      }

      if (options.includeCompletedTasks && data.completedTasks) {
        const filteredCompleted = this.filterByDateRange(
          data.completedTasks,
          options.dateRange
        );
        exportData.completedTasks = filteredCompleted;
        completedTaskCount = filteredCompleted.length;
      }

      if (options.includeAchievements && data.achievements) {
        exportData.achievements = data.achievements;
        achievementCount = data.achievements.length;
      }

      if (options.includeInsights && data.insights) {
        exportData.insights = data.insights;
      }

      if (options.includeNotes && data.notes) {
        exportData.notes = data.notes;
        noteCount = data.notes.length;
      }

      if (data.streaks) {
        exportData.streaks = data.streaks;
      }

      // Convert to requested format
      let outputData: string;
      let mimeType: string;
      let fileExtension: string;

      switch (options.format) {
        case 'csv':
          outputData = this.convertToCSV(exportData);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'pdf':
          // PDF generation would require a library
          // For now, return JSON with a note
          outputData = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        case 'json':
        default:
          outputData = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
      }

      const filename = `procrastinact-backup-${exportedAt.toISOString().split('T')[0]}.${fileExtension}`;

      return {
        success: true,
        data: outputData,
        filename,
        mimeType,
        exportedAt,
        itemCounts: {
          tasks: taskCount,
          completedTasks: completedTaskCount,
          achievements: achievementCount,
          notes: noteCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
        exportedAt,
        itemCounts: {
          tasks: 0,
          completedTasks: 0,
          achievements: 0,
          notes: 0,
        },
      };
    }
  }

  /**
   * Import backup data
   */
  async importData(jsonData: string): Promise<ImportResult> {
    const importedAt = new Date();
    const warnings: string[] = [];

    try {
      const data = JSON.parse(jsonData) as BackupData;

      // Validate version
      if (!data.version) {
        warnings.push('Backup version not found, importing with best effort');
      }

      let taskCount = 0;
      let settingsCount = 0;
      let achievementCount = 0;
      let noteCount = 0;

      if (data.settings) {
        settingsCount = Object.keys(data.settings).length;
      }

      if (data.tasks) {
        taskCount = data.tasks.length;
      }

      if (data.completedTasks) {
        taskCount += data.completedTasks.length;
      }

      if (data.achievements) {
        achievementCount = data.achievements.length;
      }

      if (data.notes) {
        noteCount = data.notes.length;
      }

      return {
        success: true,
        importedAt,
        itemCounts: {
          tasks: taskCount,
          settings: settingsCount,
          achievements: achievementCount,
          notes: noteCount,
        },
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Import failed - invalid JSON',
        importedAt,
        itemCounts: {
          tasks: 0,
          settings: 0,
          achievements: 0,
          notes: 0,
        },
        warnings,
      };
    }
  }

  /**
   * Validate backup file
   */
  validateBackup(jsonData: string): {
    valid: boolean;
    version?: string;
    exportedAt?: Date;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      const data = JSON.parse(jsonData) as BackupData;

      if (!data.version) {
        errors.push('Missing version field');
      }

      if (!data.exportedAt) {
        errors.push('Missing exportedAt field');
      }

      return {
        valid: errors.length === 0,
        version: data.version,
        exportedAt: data.exportedAt ? new Date(data.exportedAt) : undefined,
        errors,
      };
    } catch {
      return {
        valid: false,
        errors: ['Invalid JSON format'],
      };
    }
  }

  /**
   * Generate export summary
   */
  generateExportSummary(result: ExportResult): string {
    if (!result.success) {
      return `Export failed: ${result.error}`;
    }

    const lines = [
      'Export completed successfully!',
      `Exported at: ${result.exportedAt.toLocaleString()}`,
      '',
      'Contents:',
    ];

    if (result.itemCounts.tasks > 0) {
      lines.push(`  - ${result.itemCounts.tasks} active tasks`);
    }
    if (result.itemCounts.completedTasks > 0) {
      lines.push(`  - ${result.itemCounts.completedTasks} completed tasks`);
    }
    if (result.itemCounts.achievements > 0) {
      lines.push(`  - ${result.itemCounts.achievements} achievements`);
    }
    if (result.itemCounts.notes > 0) {
      lines.push(`  - ${result.itemCounts.notes} notes`);
    }

    return lines.join('\n');
  }

  // Private methods

  private filterByDateRange(
    items: Array<Record<string, unknown>>,
    dateRange?: { start: Date; end: Date }
  ): Array<Record<string, unknown>> {
    if (!dateRange) return items;

    return items.filter((item) => {
      const itemDate = item.createdAt || item.completedAt || item.date;
      if (!itemDate) return true;

      const date = new Date(itemDate as string);
      return date >= dateRange.start && date <= dateRange.end;
    });
  }

  private convertToCSV(data: BackupData): string {
    const lines: string[] = [];

    // Header
    lines.push('# ProcrastinAct Export');
    lines.push(`# Version: ${data.version}`);
    lines.push(`# Exported: ${data.exportedAt}`);
    lines.push('');

    // Tasks
    if (data.tasks && data.tasks.length > 0) {
      lines.push('## Tasks');
      lines.push('id,title,status,createdAt');
      data.tasks.forEach((task) => {
        lines.push(
          `${task.id || ''},${this.escapeCSV(String(task.title || ''))},${task.status || ''},${task.createdAt || ''}`
        );
      });
      lines.push('');
    }

    // Completed Tasks
    if (data.completedTasks && data.completedTasks.length > 0) {
      lines.push('## Completed Tasks');
      lines.push('id,title,completedAt');
      data.completedTasks.forEach((task) => {
        lines.push(
          `${task.id || ''},${this.escapeCSV(String(task.title || ''))},${task.completedAt || ''}`
        );
      });
      lines.push('');
    }

    // Achievements
    if (data.achievements && data.achievements.length > 0) {
      lines.push('## Achievements');
      lines.push('id,name,unlockedAt');
      data.achievements.forEach((achievement) => {
        lines.push(
          `${achievement.id || ''},${this.escapeCSV(String(achievement.name || ''))},${achievement.unlockedAt || ''}`
        );
      });
    }

    return lines.join('\n');
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let exportInstance: ExportService | null = null;

export function getExportService(): ExportService {
  if (!exportInstance) {
    exportInstance = new ExportService();
  }
  return exportInstance;
}
