'use client';

/**
 * Settings Screen - Sprint 6
 * Comprehensive settings UI for the app
 */

import type { CSSProperties, ReactNode } from 'react';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type {
  AppSettings,
  SettingsSection,
  SettingItem,
} from '@procrastinact/core';
import {
  SETTINGS_SECTIONS,
  SETTING_ITEMS,
  DEFAULT_SETTINGS,
} from '@procrastinact/core';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  animation,
} from './tokens';

// ============================================================================
// CONTEXT
// ============================================================================

interface SettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => void;
  resetSection: (sectionId: string) => void;
  resetAll: () => void;
  darkMode: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
  settings: AppSettings;
  onSettingChange: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => void;
  onResetSection?: (sectionId: string) => void;
  onResetAll?: () => void;
  darkMode?: boolean;
}

export function SettingsProvider({
  children,
  settings,
  onSettingChange,
  onResetSection,
  onResetAll,
  darkMode = false,
}: SettingsProviderProps) {
  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      onSettingChange(key, value);
    },
    [onSettingChange]
  );

  const resetSection = useCallback(
    (sectionId: string) => {
      onResetSection?.(sectionId);
    },
    [onResetSection]
  );

  const resetAll = useCallback(() => {
    onResetAll?.();
  }, [onResetAll]);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSetting, resetSection, resetAll, darkMode }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

// ============================================================================
// TOGGLE SWITCH
// ============================================================================

interface ToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  darkMode?: boolean;
}

export function ToggleSwitch({
  value,
  onChange,
  disabled = false,
  darkMode = false,
}: ToggleSwitchProps) {
  const styles: Record<string, CSSProperties> = {
    track: {
      width: 52,
      height: 32,
      borderRadius: borderRadius.full,
      backgroundColor: value
        ? colors.primary[500]
        : darkMode
          ? colors.neutral[600]
          : colors.neutral[300],
      padding: 2,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: `background-color ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    },
    thumb: {
      width: 28,
      height: 28,
      borderRadius: borderRadius.full,
      backgroundColor: 'white',
      boxShadow: shadows.sm,
      transform: value ? 'translateX(20px)' : 'translateX(0)',
      transition: `transform ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    },
  };

  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => !disabled && onChange(!value)}
      style={styles.track}
      disabled={disabled}
    >
      <div style={styles.thumb} />
    </button>
  );
}

// ============================================================================
// SELECT DROPDOWN
// ============================================================================

interface SelectDropdownProps {
  value: string | number;
  options: Array<{ value: string | number; label: string }>;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  darkMode?: boolean;
}

export function SelectDropdown({
  value,
  options,
  onChange,
  disabled = false,
  darkMode = false,
}: SelectDropdownProps) {
  const styles: Record<string, CSSProperties> = {
    select: {
      padding: `${spacing[2]}px ${spacing[4]}px`,
      fontSize: typography.fontSize.sm,
      backgroundColor: darkMode
        ? colors.surfaceElevated.dark
        : colors.neutral[50],
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
      borderRadius: borderRadius.md,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      minWidth: 150,
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${darkMode ? '%23f1f5f9' : '%231f2937'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '16px',
      paddingRight: spacing[10],
    },
  };

  return (
    <select
      value={value}
      onChange={(e) => {
        const newValue = options.find(
          (o) => String(o.value) === e.target.value
        )?.value;
        if (newValue !== undefined) {
          onChange(newValue);
        }
      }}
      disabled={disabled}
      style={styles.select}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// ============================================================================
// TIME PICKER
// ============================================================================

interface TimePickerProps {
  value: string; // HH:mm format
  onChange: (value: string) => void;
  disabled?: boolean;
  darkMode?: boolean;
}

export function TimePicker({
  value,
  onChange,
  disabled = false,
  darkMode = false,
}: TimePickerProps) {
  const styles: Record<string, CSSProperties> = {
    input: {
      padding: `${spacing[2]}px ${spacing[4]}px`,
      fontSize: typography.fontSize.sm,
      backgroundColor: darkMode
        ? colors.surfaceElevated.dark
        : colors.neutral[50],
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
      borderRadius: borderRadius.md,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: typography.fontFamily.mono,
    },
  };

  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={styles.input}
    />
  );
}

// ============================================================================
// SETTING ROW
// ============================================================================

interface SettingRowProps {
  item: SettingItem;
  value: AppSettings[keyof AppSettings];
  onChange: (value: AppSettings[keyof AppSettings]) => void;
  darkMode?: boolean;
}

export function SettingRow({
  item,
  value,
  onChange,
  darkMode = false,
}: SettingRowProps) {
  const styles: Record<string, CSSProperties> = {
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `${spacing[4]}px 0`,
      borderBottom: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    },
    labelContainer: {
      flex: 1,
      paddingRight: spacing[4],
    },
    label: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      marginBottom: spacing[1],
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      lineHeight: typography.lineHeight.relaxed,
    },
    premium: {
      fontSize: typography.fontSize.xs,
      color: colors.secondary[500],
      marginLeft: spacing[2],
    },
  };

  const renderControl = () => {
    switch (item.type) {
      case 'toggle':
        return (
          <ToggleSwitch
            value={value as boolean}
            onChange={(v) => onChange(v)}
            darkMode={darkMode}
          />
        );
      case 'select':
        return (
          <SelectDropdown
            value={value as string | number}
            options={item.options || []}
            onChange={(v) => onChange(v)}
            darkMode={darkMode}
          />
        );
      case 'time':
        return (
          <TimePicker
            value={value as string}
            onChange={(v) => onChange(v)}
            darkMode={darkMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.row}>
      <div style={styles.labelContainer}>
        <div style={styles.label}>
          {item.label}
          {item.premium && <span style={styles.premium}>PRO</span>}
        </div>
        {item.description && (
          <div style={styles.description}>{item.description}</div>
        )}
      </div>
      {renderControl()}
    </div>
  );
}

// ============================================================================
// SETTINGS SECTION
// ============================================================================

interface SettingsSectionCardProps {
  section: SettingsSection;
  settings: AppSettings;
  onSettingChange: (
    key: keyof AppSettings,
    value: AppSettings[keyof AppSettings]
  ) => void;
  onReset?: () => void;
  darkMode?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export function SettingsSectionCard({
  section,
  settings,
  onSettingChange,
  onReset,
  darkMode = false,
  expanded = false,
  onToggle,
}: SettingsSectionCardProps) {
  const sectionItems = SETTING_ITEMS.filter(
    (item) => item.section === section.id
  );

  const styles: Record<string, CSSProperties> = {
    card: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      boxShadow: darkMode ? shadows.md : shadows.sm,
      overflow: 'hidden' as const,
      marginBottom: spacing[4],
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      cursor: 'pointer',
      backgroundColor: darkMode
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(0, 0, 0, 0.02)',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
    },
    icon: {
      fontSize: typography.fontSize['2xl'],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
    },
    chevron: {
      fontSize: typography.fontSize.lg,
      color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: `transform ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    },
    content: {
      padding: `0 ${spacing[4]}px ${spacing[4]}px`,
      display: expanded ? 'block' : 'none',
    },
    resetButton: {
      padding: `${spacing[2]}px ${spacing[4]}px`,
      backgroundColor: 'transparent',
      border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
      borderRadius: borderRadius.md,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      fontSize: typography.fontSize.sm,
      cursor: 'pointer',
      marginTop: spacing[4],
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.header} onClick={onToggle}>
        <div style={styles.headerLeft}>
          <span style={styles.icon}>{section.icon}</span>
          <div>
            <div style={styles.title}>{section.title}</div>
            <div style={styles.description}>{section.description}</div>
          </div>
        </div>
        <span style={styles.chevron}>▼</span>
      </div>
      <div style={styles.content}>
        {sectionItems.map((item) => (
          <SettingRow
            key={item.id}
            item={item}
            value={settings[item.id]}
            onChange={(value) => onSettingChange(item.id, value)}
            darkMode={darkMode}
          />
        ))}
        {onReset && (
          <button style={styles.resetButton} onClick={onReset}>
            Reset to Defaults
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SETTINGS NAV
// ============================================================================

interface SettingsNavProps {
  sections: SettingsSection[];
  activeSection?: string;
  onSectionSelect: (sectionId: string) => void;
  darkMode?: boolean;
}

export function SettingsNav({
  sections,
  activeSection,
  onSectionSelect,
  darkMode = false,
}: SettingsNavProps) {
  const styles: Record<string, CSSProperties> = {
    nav: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[1],
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      padding: `${spacing[3]}px ${spacing[4]}px`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: `background-color ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    },
    itemActive: {
      backgroundColor: darkMode
        ? 'rgba(99, 102, 241, 0.1)'
        : 'rgba(99, 102, 241, 0.05)',
    },
    icon: {
      fontSize: typography.fontSize.lg,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
  };

  return (
    <nav style={styles.nav}>
      {sections.map((section) => (
        <div
          key={section.id}
          style={{
            ...styles.item,
            ...(activeSection === section.id ? styles.itemActive : {}),
          }}
          onClick={() => onSectionSelect(section.id)}
        >
          <span style={styles.icon}>{section.icon}</span>
          <span style={styles.label}>{section.title}</span>
        </div>
      ))}
    </nav>
  );
}

// ============================================================================
// SETTINGS HEADER
// ============================================================================

interface SettingsHeaderProps {
  title?: string;
  onBack?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  darkMode?: boolean;
}

export function SettingsHeader({
  title = 'Settings',
  onBack,
  onExport,
  onImport,
  darkMode = false,
}: SettingsHeaderProps) {
  const styles: Record<string, CSSProperties> = {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      borderBottom: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    },
    left: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
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
    actions: {
      display: 'flex',
      gap: spacing[2],
    },
    actionButton: {
      padding: `${spacing[2]}px ${spacing[3]}px`,
      backgroundColor: 'transparent',
      border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
      borderRadius: borderRadius.md,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      fontSize: typography.fontSize.sm,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.header}>
      <div style={styles.left}>
        {onBack && (
          <button
            style={styles.backButton}
            onClick={onBack}
            aria-label="Go back"
          >
            ←
          </button>
        )}
        <h1 style={styles.title}>{title}</h1>
      </div>
      <div style={styles.actions}>
        {onExport && (
          <button style={styles.actionButton} onClick={onExport}>
            Export
          </button>
        )}
        {onImport && (
          <button style={styles.actionButton} onClick={onImport}>
            Import
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// FULL SETTINGS SCREEN
// ============================================================================

interface SettingsScreenProps {
  settings: AppSettings;
  onSettingChange: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => void;
  onResetSection?: (sectionId: string) => void;
  onResetAll?: () => void;
  onBack?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  darkMode?: boolean;
}

export function SettingsScreen({
  settings,
  onSettingChange,
  onResetSection,
  onResetAll,
  onBack,
  onExport,
  onImport,
  darkMode = false,
}: SettingsScreenProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['general'])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const styles: Record<string, CSSProperties> = {
    container: {
      minHeight: '100vh',
      backgroundColor: darkMode
        ? colors.background.dark
        : colors.background.light,
    },
    content: {
      padding: spacing[4],
      maxWidth: 800,
      margin: '0 auto',
    },
    footer: {
      padding: spacing[6],
      textAlign: 'center' as const,
    },
    resetAllButton: {
      padding: `${spacing[3]}px ${spacing[6]}px`,
      backgroundColor: 'transparent',
      border: `1px solid ${colors.danger}`,
      borderRadius: borderRadius.md,
      color: colors.danger,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      cursor: 'pointer',
    },
    version: {
      marginTop: spacing[4],
      fontSize: typography.fontSize.sm,
      color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    },
  };

  return (
    <div style={styles.container}>
      <SettingsHeader
        onBack={onBack}
        onExport={onExport}
        onImport={onImport}
        darkMode={darkMode}
      />
      <div style={styles.content}>
        {SETTINGS_SECTIONS.map((section) => (
          <SettingsSectionCard
            key={section.id}
            section={section}
            settings={settings}
            onSettingChange={onSettingChange}
            onReset={
              onResetSection ? () => onResetSection(section.id) : undefined
            }
            darkMode={darkMode}
            expanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </div>
      <div style={styles.footer}>
        {onResetAll && (
          <button style={styles.resetAllButton} onClick={onResetAll}>
            Reset All Settings
          </button>
        )}
        <div style={styles.version}>ProcrastinAct v{settings.version}</div>
      </div>
    </div>
  );
}

// ============================================================================
// QUICK SETTINGS MODAL
// ============================================================================

interface QuickSettingsModalProps {
  settings: AppSettings;
  onSettingChange: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => void;
  onClose: () => void;
  darkMode?: boolean;
}

export function QuickSettingsModal({
  settings,
  onSettingChange,
  onClose,
  darkMode = false,
}: QuickSettingsModalProps) {
  const quickSettings: Array<keyof AppSettings> = [
    'theme',
    'notificationsEnabled',
    'hapticFeedback',
    'reducedMotion',
    'pomodoroMode',
  ];

  const styles: Record<string, CSSProperties> = {
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: colors.overlay.light,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 50,
    },
    modal: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: `${borderRadius.xl}px ${borderRadius.xl}px 0 0`,
      padding: spacing[6],
      width: '100%',
      maxWidth: 400,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    closeButton: {
      padding: spacing[2],
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: typography.fontSize.xl,
      color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    },
    settingsList: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Quick Settings</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div style={styles.settingsList}>
          {quickSettings.map((settingId) => {
            const item = SETTING_ITEMS.find((i) => i.id === settingId);
            if (!item) return null;
            return (
              <SettingRow
                key={item.id}
                item={item}
                value={settings[item.id]}
                onChange={(value) => onSettingChange(item.id, value)}
                darkMode={darkMode}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
