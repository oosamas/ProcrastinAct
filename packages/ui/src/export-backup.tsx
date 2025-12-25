'use client';

/**
 * Export/Backup UI - Sprint 6
 * UI for data export and backup
 */

import type { CSSProperties } from 'react';
import { useState, useRef } from 'react';
import type {
  ExportOptions,
  ExportResult,
  ImportResult,
} from '@procrastinact/core';
import { DEFAULT_EXPORT_OPTIONS } from '@procrastinact/core';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  animation,
} from './tokens';

// ============================================================================
// EXPORT OPTIONS PANEL
// ============================================================================

interface ExportOptionsPanelProps {
  options: ExportOptions;
  onChange: (options: ExportOptions) => void;
  darkMode?: boolean;
}

export function ExportOptionsPanel({
  options,
  onChange,
  darkMode = false,
}: ExportOptionsPanelProps) {
  const updateOption = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  const styles: Record<string, CSSProperties> = {
    container: {
      padding: spacing[4],
      backgroundColor: darkMode
        ? colors.surfaceElevated.dark
        : colors.neutral[50],
      borderRadius: borderRadius.lg,
    },
    title: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      marginBottom: spacing[4],
    },
    optionRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `${spacing[2]}px 0`,
      borderBottom: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    },
    optionLabel: {
      fontSize: typography.fontSize.sm,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    checkbox: {
      width: 20,
      height: 20,
      accentColor: colors.primary[500],
    },
    formatSelect: {
      padding: `${spacing[1]}px ${spacing[3]}px`,
      borderRadius: borderRadius.md,
      border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      fontSize: typography.fontSize.sm,
    },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Export Options</h3>

      <div style={styles.optionRow}>
        <span style={styles.optionLabel}>Format</span>
        <select
          style={styles.formatSelect}
          value={options.format}
          onChange={(e) =>
            updateOption('format', e.target.value as ExportOptions['format'])
          }
        >
          <option value="json">JSON (Full backup)</option>
          <option value="csv">CSV (Spreadsheet)</option>
        </select>
      </div>

      <div style={styles.optionRow}>
        <span style={styles.optionLabel}>Include Settings</span>
        <input
          type="checkbox"
          style={styles.checkbox}
          checked={options.includeSettings}
          onChange={(e) => updateOption('includeSettings', e.target.checked)}
        />
      </div>

      <div style={styles.optionRow}>
        <span style={styles.optionLabel}>Include Active Tasks</span>
        <input
          type="checkbox"
          style={styles.checkbox}
          checked={options.includeTasks}
          onChange={(e) => updateOption('includeTasks', e.target.checked)}
        />
      </div>

      <div style={styles.optionRow}>
        <span style={styles.optionLabel}>Include Completed Tasks</span>
        <input
          type="checkbox"
          style={styles.checkbox}
          checked={options.includeCompletedTasks}
          onChange={(e) =>
            updateOption('includeCompletedTasks', e.target.checked)
          }
        />
      </div>

      <div style={styles.optionRow}>
        <span style={styles.optionLabel}>Include Achievements</span>
        <input
          type="checkbox"
          style={styles.checkbox}
          checked={options.includeAchievements}
          onChange={(e) =>
            updateOption('includeAchievements', e.target.checked)
          }
        />
      </div>

      <div style={styles.optionRow}>
        <span style={styles.optionLabel}>Include Insights</span>
        <input
          type="checkbox"
          style={styles.checkbox}
          checked={options.includeInsights}
          onChange={(e) => updateOption('includeInsights', e.target.checked)}
        />
      </div>

      <div style={{ ...styles.optionRow, borderBottom: 'none' }}>
        <span style={styles.optionLabel}>Include Notes</span>
        <input
          type="checkbox"
          style={styles.checkbox}
          checked={options.includeNotes}
          onChange={(e) => updateOption('includeNotes', e.target.checked)}
        />
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT RESULT CARD
// ============================================================================

interface ExportResultCardProps {
  result: ExportResult;
  onDownload: () => void;
  darkMode?: boolean;
}

export function ExportResultCard({
  result,
  onDownload,
  darkMode = false,
}: ExportResultCardProps) {
  const styles: Record<string, CSSProperties> = {
    card: {
      padding: spacing[6],
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.md,
      textAlign: 'center' as const,
    },
    icon: {
      fontSize: typography.fontSize['4xl'],
      marginBottom: spacing[3],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: result.success ? colors.success : colors.danger,
      marginBottom: spacing[2],
    },
    message: {
      fontSize: typography.fontSize.sm,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      marginBottom: spacing[4],
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: spacing[2],
      marginBottom: spacing[4],
      padding: spacing[3],
      backgroundColor: darkMode
        ? colors.surfaceElevated.dark
        : colors.neutral[50],
      borderRadius: borderRadius.md,
    },
    stat: {
      textAlign: 'center' as const,
    },
    statValue: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    statLabel: {
      fontSize: typography.fontSize.xs,
      color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    },
    downloadButton: {
      padding: `${spacing[3]}px ${spacing[6]}px`,
      backgroundColor: colors.primary[500],
      color: 'white',
      border: 'none',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      cursor: 'pointer',
    },
  };

  if (!result.success) {
    return (
      <div style={styles.card}>
        <div style={styles.icon}>❌</div>
        <div style={styles.title}>Export Failed</div>
        <div style={styles.message}>{result.error}</div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.icon}>✅</div>
      <div style={styles.title}>Export Complete!</div>
      <div style={styles.message}>
        Exported on {result.exportedAt.toLocaleDateString()}
      </div>
      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statValue}>{result.itemCounts.tasks}</div>
          <div style={styles.statLabel}>Tasks</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>{result.itemCounts.completedTasks}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>{result.itemCounts.achievements}</div>
          <div style={styles.statLabel}>Achievements</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>{result.itemCounts.notes}</div>
          <div style={styles.statLabel}>Notes</div>
        </div>
      </div>
      <button style={styles.downloadButton} onClick={onDownload}>
        Download {result.filename}
      </button>
    </div>
  );
}

// ============================================================================
// IMPORT PANEL
// ============================================================================

interface ImportPanelProps {
  onImport: (data: string) => void;
  importResult?: ImportResult | null;
  darkMode?: boolean;
}

export function ImportPanel({
  onImport,
  importResult,
  darkMode = false,
}: ImportPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onImport(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const styles: Record<string, CSSProperties> = {
    container: {
      padding: spacing[6],
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.md,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      marginBottom: spacing[4],
    },
    dropZone: {
      padding: spacing[8],
      border: `2px dashed ${isDragging ? colors.primary[500] : darkMode ? colors.border.dark : colors.border.light}`,
      borderRadius: borderRadius.lg,
      textAlign: 'center' as const,
      cursor: 'pointer',
      backgroundColor: isDragging
        ? darkMode
          ? 'rgba(99, 102, 241, 0.1)'
          : 'rgba(99, 102, 241, 0.05)'
        : 'transparent',
      transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    },
    dropIcon: {
      fontSize: typography.fontSize['3xl'],
      marginBottom: spacing[2],
    },
    dropText: {
      fontSize: typography.fontSize.sm,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      marginBottom: spacing[2],
    },
    browseLink: {
      color: colors.primary[500],
      cursor: 'pointer',
      textDecoration: 'underline',
    },
    result: {
      marginTop: spacing[4],
      padding: spacing[4],
      borderRadius: borderRadius.md,
    },
    resultSuccess: {
      backgroundColor: darkMode
        ? 'rgba(34, 197, 94, 0.1)'
        : 'rgba(34, 197, 94, 0.05)',
      borderLeft: `4px solid ${colors.success}`,
    },
    resultError: {
      backgroundColor: darkMode
        ? 'rgba(239, 68, 68, 0.1)'
        : 'rgba(239, 68, 68, 0.05)',
      borderLeft: `4px solid ${colors.danger}`,
    },
    resultTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing[2],
    },
    resultMessage: {
      fontSize: typography.fontSize.sm,
    },
    warnings: {
      marginTop: spacing[2],
      fontSize: typography.fontSize.xs,
      color: colors.warning,
    },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Import Backup</h3>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div
        style={styles.dropZone}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={styles.dropIcon}>📁</div>
        <div style={styles.dropText}>
          Drag and drop your backup file here, or{' '}
          <span style={styles.browseLink}>browse</span>
        </div>
        <div style={styles.dropText}>Accepts .json files</div>
      </div>

      {importResult && (
        <div
          style={{
            ...styles.result,
            ...(importResult.success
              ? styles.resultSuccess
              : styles.resultError),
          }}
        >
          <div
            style={{
              ...styles.resultTitle,
              color: importResult.success ? colors.success : colors.danger,
            }}
          >
            {importResult.success ? 'Import Successful!' : 'Import Failed'}
          </div>
          {importResult.success ? (
            <div
              style={{
                ...styles.resultMessage,
                color: darkMode
                  ? colors.text.primary.dark
                  : colors.text.primary.light,
              }}
            >
              Imported {importResult.itemCounts.tasks} tasks,{' '}
              {importResult.itemCounts.achievements} achievements, and{' '}
              {importResult.itemCounts.settings} settings.
            </div>
          ) : (
            <div style={{ ...styles.resultMessage, color: colors.danger }}>
              {importResult.error}
            </div>
          )}
          {importResult.warnings.length > 0 && (
            <div style={styles.warnings}>
              {importResult.warnings.map((warning, i) => (
                <div key={i}>⚠️ {warning}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BACKUP SCREEN
// ============================================================================

interface BackupScreenProps {
  onExport: (options: ExportOptions) => Promise<ExportResult>;
  onImport: (data: string) => Promise<ImportResult>;
  onBack?: () => void;
  darkMode?: boolean;
}

export function BackupScreen({
  onExport,
  onImport,
  onBack,
  darkMode = false,
}: BackupScreenProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportOptions, setExportOptions] = useState<ExportOptions>(
    DEFAULT_EXPORT_OPTIONS
  );
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await onExport(exportOptions);
      setExportResult(result);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (data: string) => {
    setLoading(true);
    try {
      const result = await onImport(data);
      setImportResult(result);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (exportResult?.data && exportResult.filename) {
      const blob = new Blob([exportResult.data], {
        type: exportResult.mimeType,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportResult.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const styles: Record<string, CSSProperties> = {
    container: {
      minHeight: '100vh',
      backgroundColor: darkMode
        ? colors.background.dark
        : colors.background.light,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      padding: spacing[4],
      borderBottom: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    },
    backButton: {
      padding: spacing[2],
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: typography.fontSize.xl,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    tabs: {
      display: 'flex',
      padding: spacing[4],
      gap: spacing[2],
    },
    tab: {
      flex: 1,
      padding: spacing[3],
      backgroundColor: 'transparent',
      border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    },
    activeTab: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
      color: 'white',
    },
    inactiveTab: {
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    content: {
      padding: spacing[4],
    },
    exportButton: {
      width: '100%',
      padding: spacing[4],
      backgroundColor: colors.primary[500],
      color: 'white',
      border: 'none',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      marginTop: spacing[4],
    },
    note: {
      marginTop: spacing[4],
      padding: spacing[4],
      backgroundColor: darkMode
        ? 'rgba(59, 130, 246, 0.1)'
        : 'rgba(59, 130, 246, 0.05)',
      borderRadius: borderRadius.md,
      borderLeft: `4px solid ${colors.info}`,
    },
    noteTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.info,
      marginBottom: spacing[1],
    },
    noteText: {
      fontSize: typography.fontSize.xs,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      lineHeight: typography.lineHeight.relaxed,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {onBack && (
          <button style={styles.backButton} onClick={onBack}>
            ←
          </button>
        )}
        <h1 style={styles.title}>Backup & Restore</h1>
      </div>

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'export' ? styles.activeTab : styles.inactiveTab),
          }}
          onClick={() => setActiveTab('export')}
        >
          Export Data
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'import' ? styles.activeTab : styles.inactiveTab),
          }}
          onClick={() => setActiveTab('import')}
        >
          Import Backup
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'export' ? (
          <>
            <ExportOptionsPanel
              options={exportOptions}
              onChange={setExportOptions}
              darkMode={darkMode}
            />

            <button
              style={styles.exportButton}
              onClick={handleExport}
              disabled={loading}
            >
              {loading ? 'Exporting...' : 'Export Data'}
            </button>

            {exportResult && (
              <div style={{ marginTop: spacing[4] }}>
                <ExportResultCard
                  result={exportResult}
                  onDownload={handleDownload}
                  darkMode={darkMode}
                />
              </div>
            )}

            <div style={styles.note}>
              <div style={styles.noteTitle}>About Exports</div>
              <div style={styles.noteText}>
                Your exported data is saved locally to your device. We never
                upload your data to our servers. You can use this backup to
                restore your data on another device or keep as a personal
                backup.
              </div>
            </div>
          </>
        ) : (
          <>
            <ImportPanel
              onImport={handleImport}
              importResult={importResult}
              darkMode={darkMode}
            />

            <div style={styles.note}>
              <div style={styles.noteTitle}>About Imports</div>
              <div style={styles.noteText}>
                Importing a backup will merge data with your existing data.
                Settings will be overwritten. Tasks and achievements will be
                added if they don&apos;t already exist.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
