'use client';

import {
  type CSSProperties,
  type ReactNode,
  useState,
  useCallback,
} from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
  touchTarget,
} from './tokens';
import { useMotion } from './motion';
import { useHaptics } from './haptics';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationSettings {
  // Master toggle
  enabled: boolean;

  // Per-type toggles
  taskReminders: boolean;
  streakReminders: boolean;
  encouragementMessages: boolean;
  breakReminders: boolean;
  dailySummary: boolean;

  // Timing
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string; // HH:mm
  weekendMode: 'same' | 'different' | 'off';
  weekendQuietStart?: string;
  weekendQuietEnd?: string;

  // Tone
  tone: 'encouraging' | 'neutral' | 'minimal';

  // Sound
  soundEnabled: boolean;
  soundVolume: number; // 0-1
  vibrationEnabled: boolean;

  // Snooze
  defaultSnoozeMinutes: number;

  // Do Not Disturb
  respectSystemDND: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  taskReminders: true,
  streakReminders: true,
  encouragementMessages: true,
  breakReminders: true,
  dailySummary: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  weekendMode: 'same',
  tone: 'encouraging',
  soundEnabled: true,
  soundVolume: 0.7,
  vibrationEnabled: true,
  defaultSnoozeMinutes: 15,
  respectSystemDND: true,
};

// ============================================================================
// TOGGLE SWITCH
// ============================================================================

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  darkMode?: boolean;
}

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  darkMode = false,
}: ToggleSwitchProps) {
  const { reducedMotion } = useMotion();
  const { trigger } = useHaptics();

  const trackStyle: CSSProperties = {
    position: 'relative',
    width: 52,
    height: 32,
    backgroundColor: checked
      ? colors.primary[500]
      : darkMode
        ? colors.neutral[700]
        : colors.neutral[300],
    borderRadius: borderRadius.full,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: reducedMotion
      ? 'none'
      : `background-color ${animation.duration.fast}ms ${animation.easing.easeOut}`,
  };

  const thumbStyle: CSSProperties = {
    position: 'absolute',
    top: 2,
    left: checked ? 22 : 2,
    width: 28,
    height: 28,
    backgroundColor: 'white',
    borderRadius: borderRadius.full,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: reducedMotion
      ? 'none'
      : `left ${animation.duration.fast}ms ${animation.easing.easeOut}`,
  };

  return (
    <button
      style={{ ...trackStyle, border: 'none', padding: 0 }}
      onClick={() => {
        if (!disabled) {
          trigger('tap');
          onChange(!checked);
        }
      }}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
    >
      <div style={thumbStyle} />
    </button>
  );
}

// ============================================================================
// SETTING ROW
// ============================================================================

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  darkMode?: boolean;
}

function SettingRow({
  label,
  description,
  children,
  darkMode = false,
}: SettingRowProps) {
  const rowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing[4]}px 0`,
    borderBottom: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    minHeight: touchTarget.comfortable,
  };

  const labelContainerStyle: CSSProperties = {
    flex: 1,
    marginRight: spacing[4],
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginTop: spacing[1],
  };

  return (
    <div style={rowStyle}>
      <div style={labelContainerStyle}>
        <p style={labelStyle}>{label}</p>
        {description && <p style={descriptionStyle}>{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// SECTION HEADER
// ============================================================================

interface SectionHeaderProps {
  title: string;
  darkMode?: boolean;
}

function SectionHeader({ title, darkMode = false }: SectionHeaderProps) {
  const style: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    marginTop: spacing[6],
    marginBottom: spacing[2],
  };

  return <h3 style={style}>{title}</h3>;
}

// ============================================================================
// TIME PICKER
// ============================================================================

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  darkMode?: boolean;
}

function TimePicker({ value, onChange, darkMode = false }: TimePickerProps) {
  const { trigger } = useHaptics();

  const style: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[100],
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.mono,
    cursor: 'pointer',
  };

  return (
    <input
      type="time"
      value={value}
      onChange={(e) => {
        trigger('tap');
        onChange(e.target.value);
      }}
      style={style}
    />
  );
}

// ============================================================================
// SLIDER
// ============================================================================

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  darkMode?: boolean;
}

function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  darkMode = false,
}: SliderProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    width: 160,
  };

  const sliderStyle: CSSProperties = {
    flex: 1,
    height: 4,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[200],
    borderRadius: borderRadius.full,
    appearance: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          trigger('tap');
          onChange(parseFloat(e.target.value));
        }}
        style={sliderStyle}
      />
      <span
        style={{
          fontSize: typography.fontSize.sm,
          color: darkMode
            ? colors.text.secondary.dark
            : colors.text.secondary.light,
          fontFamily: typography.fontFamily.mono,
          minWidth: 40,
          textAlign: 'right',
        }}
      >
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

// ============================================================================
// SEGMENTED CONTROL
// ============================================================================

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  darkMode?: boolean;
}

function SegmentedControl({
  options,
  value,
  onChange,
  darkMode = false,
}: SegmentedControlProps) {
  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();

  const containerStyle: CSSProperties = {
    display: 'flex',
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: 2,
  };

  const buttonStyle = (isSelected: boolean): CSSProperties => ({
    flex: 1,
    padding: `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: isSelected
      ? darkMode
        ? colors.neutral[700]
        : 'white'
      : 'transparent',
    color: isSelected
      ? darkMode
        ? colors.text.primary.dark
        : colors.text.primary.light
      : darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: isSelected
      ? typography.fontWeight.medium
      : typography.fontWeight.normal,
    cursor: 'pointer',
    transition: reducedMotion
      ? 'none'
      : `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    boxShadow: isSelected ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
  });

  return (
    <div style={containerStyle}>
      {options.map((option) => (
        <button
          key={option.value}
          style={buttonStyle(value === option.value)}
          onClick={() => {
            trigger('tap');
            onChange(option.value);
          }}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// NOTIFICATION SETTINGS PANEL
// ============================================================================

interface NotificationSettingsPanelProps {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
  darkMode?: boolean;
}

/**
 * Full notification settings panel
 */
export function NotificationSettingsPanel({
  settings,
  onChange,
  darkMode = false,
}: NotificationSettingsPanelProps) {
  const { trigger } = useHaptics();

  const updateSetting = useCallback(
    <K extends keyof NotificationSettings>(
      key: K,
      value: NotificationSettings[K]
    ) => {
      onChange({ ...settings, [key]: value });
    },
    [settings, onChange]
  );

  const containerStyle: CSSProperties = {
    padding: spacing[4],
  };

  const headerStyle: CSSProperties = {
    fontSize: typography.fontSize['xl'],
    fontWeight: typography.fontWeight.bold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[4],
  };

  const masterToggleStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: settings.enabled
      ? darkMode
        ? colors.primary[900]
        : colors.primary[50]
      : darkMode
        ? colors.neutral[800]
        : colors.neutral[100],
    borderRadius: borderRadius.xl,
    marginBottom: spacing[4],
  };

  const masterLabelStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Notifications</h2>

      {/* Master Toggle */}
      <div style={masterToggleStyle}>
        <p style={masterLabelStyle}>Enable Notifications</p>
        <ToggleSwitch
          checked={settings.enabled}
          onChange={(checked) => updateSetting('enabled', checked)}
          darkMode={darkMode}
        />
      </div>

      {/* Notification Types */}
      <SectionHeader title="Notification Types" darkMode={darkMode} />

      <SettingRow
        label="Task Reminders"
        description="Get reminded about pending tasks"
        darkMode={darkMode}
      >
        <ToggleSwitch
          checked={settings.taskReminders}
          onChange={(checked) => updateSetting('taskReminders', checked)}
          disabled={!settings.enabled}
          darkMode={darkMode}
        />
      </SettingRow>

      <SettingRow
        label="Streak Reminders"
        description="Keep your streak alive"
        darkMode={darkMode}
      >
        <ToggleSwitch
          checked={settings.streakReminders}
          onChange={(checked) => updateSetting('streakReminders', checked)}
          disabled={!settings.enabled}
          darkMode={darkMode}
        />
      </SettingRow>

      <SettingRow
        label="Encouragement"
        description="Motivational messages"
        darkMode={darkMode}
      >
        <ToggleSwitch
          checked={settings.encouragementMessages}
          onChange={(checked) =>
            updateSetting('encouragementMessages', checked)
          }
          disabled={!settings.enabled}
          darkMode={darkMode}
        />
      </SettingRow>

      <SettingRow
        label="Break Reminders"
        description="Take breaks when needed"
        darkMode={darkMode}
      >
        <ToggleSwitch
          checked={settings.breakReminders}
          onChange={(checked) => updateSetting('breakReminders', checked)}
          disabled={!settings.enabled}
          darkMode={darkMode}
        />
      </SettingRow>

      <SettingRow
        label="Daily Summary"
        description="End of day recap"
        darkMode={darkMode}
      >
        <ToggleSwitch
          checked={settings.dailySummary}
          onChange={(checked) => updateSetting('dailySummary', checked)}
          disabled={!settings.enabled}
          darkMode={darkMode}
        />
      </SettingRow>

      {/* Timing */}
      <SectionHeader title="Timing" darkMode={darkMode} />

      <SettingRow
        label="Quiet Hours"
        description="Pause notifications during set times"
        darkMode={darkMode}
      >
        <ToggleSwitch
          checked={settings.quietHoursEnabled}
          onChange={(checked) => updateSetting('quietHoursEnabled', checked)}
          disabled={!settings.enabled}
          darkMode={darkMode}
        />
      </SettingRow>

      {settings.quietHoursEnabled && (
        <>
          <SettingRow label="Start Time" darkMode={darkMode}>
            <TimePicker
              value={settings.quietHoursStart}
              onChange={(value) => updateSetting('quietHoursStart', value)}
              darkMode={darkMode}
            />
          </SettingRow>

          <SettingRow label="End Time" darkMode={darkMode}>
            <TimePicker
              value={settings.quietHoursEnd}
              onChange={(value) => updateSetting('quietHoursEnd', value)}
              darkMode={darkMode}
            />
          </SettingRow>
        </>
      )}

      <SettingRow
        label="Weekends"
        description="Different settings for weekends"
        darkMode={darkMode}
      >
        <SegmentedControl
          options={[
            { value: 'same', label: 'Same' },
            { value: 'different', label: 'Different' },
            { value: 'off', label: 'Off' },
          ]}
          value={settings.weekendMode}
          onChange={(value) =>
            updateSetting('weekendMode', value as 'same' | 'different' | 'off')
          }
          darkMode={darkMode}
        />
      </SettingRow>

      {/* Tone */}
      <SectionHeader title="Tone" darkMode={darkMode} />

      <SettingRow
        label="Message Style"
        description="How we talk to you"
        darkMode={darkMode}
      >
        <SegmentedControl
          options={[
            { value: 'encouraging', label: 'Warm' },
            { value: 'neutral', label: 'Neutral' },
            { value: 'minimal', label: 'Brief' },
          ]}
          value={settings.tone}
          onChange={(value) =>
            updateSetting(
              'tone',
              value as 'encouraging' | 'neutral' | 'minimal'
            )
          }
          darkMode={darkMode}
        />
      </SettingRow>

      {/* Sound & Vibration */}
      <SectionHeader title="Sound & Vibration" darkMode={darkMode} />

      <SettingRow label="Sound" darkMode={darkMode}>
        <ToggleSwitch
          checked={settings.soundEnabled}
          onChange={(checked) => updateSetting('soundEnabled', checked)}
          disabled={!settings.enabled}
          darkMode={darkMode}
        />
      </SettingRow>

      {settings.soundEnabled && (
        <SettingRow label="Volume" darkMode={darkMode}>
          <Slider
            value={settings.soundVolume}
            min={0}
            max={1}
            step={0.1}
            onChange={(value) => updateSetting('soundVolume', value)}
            darkMode={darkMode}
          />
        </SettingRow>
      )}

      <SettingRow label="Vibration" darkMode={darkMode}>
        <ToggleSwitch
          checked={settings.vibrationEnabled}
          onChange={(checked) => updateSetting('vibrationEnabled', checked)}
          disabled={!settings.enabled}
          darkMode={darkMode}
        />
      </SettingRow>

      {/* System Integration */}
      <SectionHeader title="System Integration" darkMode={darkMode} />

      <SettingRow
        label="Respect Do Not Disturb"
        description="Follow system DND settings"
        darkMode={darkMode}
      >
        <ToggleSwitch
          checked={settings.respectSystemDND}
          onChange={(checked) => updateSetting('respectSystemDND', checked)}
          disabled={!settings.enabled}
          darkMode={darkMode}
        />
      </SettingRow>

      {/* Snooze */}
      <SectionHeader title="Snooze" darkMode={darkMode} />

      <SettingRow label="Default Snooze Time" darkMode={darkMode}>
        <SegmentedControl
          options={[
            { value: '5', label: '5m' },
            { value: '15', label: '15m' },
            { value: '30', label: '30m' },
            { value: '60', label: '1h' },
          ]}
          value={String(settings.defaultSnoozeMinutes)}
          onChange={(value) =>
            updateSetting('defaultSnoozeMinutes', parseInt(value, 10))
          }
          darkMode={darkMode}
        />
      </SettingRow>
    </div>
  );
}

// ============================================================================
// COMPACT NOTIFICATION TOGGLE
// ============================================================================

interface NotificationToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  darkMode?: boolean;
}

/**
 * Simple notification toggle for quick access
 */
export function NotificationToggle({
  enabled,
  onChange,
  darkMode = false,
}: NotificationToggleProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[100],
    borderRadius: borderRadius.lg,
  };

  const iconStyle: CSSProperties = {
    width: 24,
    height: 24,
    color: enabled
      ? colors.primary[500]
      : darkMode
        ? colors.text.muted.dark
        : colors.text.muted.light,
  };

  const labelStyle: CSSProperties = {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
      </svg>
      <p style={labelStyle}>Notifications</p>
      <ToggleSwitch checked={enabled} onChange={onChange} darkMode={darkMode} />
    </div>
  );
}
