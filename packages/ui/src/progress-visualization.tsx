'use client';

import { type CSSProperties, useMemo } from 'react';
import { colors, spacing, typography, borderRadius, animation } from './tokens';

// ============================================================================
// TYPES
// ============================================================================

export interface DayProgress {
  date: Date;
  tasksCompleted: number;
  focusMinutes: number;
  hasActivity: boolean;
}

export interface WeekProgress {
  weekStart: Date;
  weekEnd: Date;
  days: DayProgress[];
  totalTasks: number;
  totalFocusMinutes: number;
}

export interface MonthProgress {
  month: number;
  year: number;
  weeks: WeekProgress[];
  totalTasks: number;
  totalFocusMinutes: number;
  mostProductiveDay?: { day: string; tasks: number };
  longestSession?: number;
}

export interface PersonalRecord {
  id: string;
  title: string;
  value: number;
  unit: string;
  date: Date;
  icon: string;
}

export interface TrendIndicator {
  type: 'improving' | 'consistent' | 'neutral';
  label: string;
  detail?: string;
}

// ============================================================================
// HEATMAP COLORS
// ============================================================================

export const HEATMAP_COLORS = {
  light: {
    empty: '#EBEDF0',
    level1: '#9BE9A8',
    level2: '#40C463',
    level3: '#30A14E',
    level4: '#216E39',
  },
  dark: {
    empty: '#161B22',
    level1: '#0E4429',
    level2: '#006D32',
    level3: '#26A641',
    level4: '#39D353',
  },
};

export function getHeatmapColor(tasks: number, darkMode: boolean): string {
  const colors = darkMode ? HEATMAP_COLORS.dark : HEATMAP_COLORS.light;
  if (tasks === 0) return colors.empty;
  if (tasks <= 2) return colors.level1;
  if (tasks <= 4) return colors.level2;
  if (tasks <= 6) return colors.level3;
  return colors.level4;
}

// ============================================================================
// DAILY COMPLETION RING
// ============================================================================

interface DailyCompletionRingProps {
  completed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  darkMode?: boolean;
}

/**
 * Circular progress ring for daily completion
 */
export function DailyCompletionRing({
  completed,
  target,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
  darkMode = false,
}: DailyCompletionRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, (completed / Math.max(target, 1)) * 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
  };

  const svgStyle: CSSProperties = {
    transform: 'rotate(-90deg)',
  };

  const bgCircleStyle: React.SVGProps<SVGCircleElement> = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: 'none',
    stroke: darkMode ? colors.neutral[700] : colors.neutral[200],
    strokeWidth,
  };

  const progressCircleStyle: React.SVGProps<SVGCircleElement> = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: 'none',
    stroke: percentage >= 100 ? colors.success[500] : colors.primary[500],
    strokeWidth,
    strokeDasharray: `${circumference} ${circumference}`,
    strokeDashoffset,
    strokeLinecap: 'round',
    style: {
      transition: `stroke-dashoffset ${animation.duration.slow}ms ${animation.easing.standard}`,
    } as CSSProperties,
  };

  const labelContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  };

  const valueStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    lineHeight: 1,
  };

  const targetStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginTop: 4,
  };

  return (
    <div style={containerStyle}>
      <svg width={size} height={size} style={svgStyle}>
        <circle {...bgCircleStyle} />
        <circle {...progressCircleStyle} />
      </svg>
      {showLabel && (
        <div style={labelContainerStyle}>
          <p style={valueStyle}>{completed}</p>
          <p style={targetStyle}>of {target}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WEEKLY HEATMAP
// ============================================================================

interface WeeklyHeatmapProps {
  days: DayProgress[];
  showLabels?: boolean;
  cellSize?: number;
  gap?: number;
  darkMode?: boolean;
}

/**
 * Weekly heatmap showing daily activity
 */
export function WeeklyHeatmap({
  days,
  showLabels = true,
  cellSize = 24,
  gap = 4,
  darkMode = false,
}: WeeklyHeatmapProps) {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fill to 7 days if needed
  const paddedDays = [...days];
  while (paddedDays.length < 7) {
    paddedDays.push({
      date: new Date(),
      tasksCompleted: 0,
      focusMinutes: 0,
      hasActivity: false,
    });
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
  };

  const rowStyle: CSSProperties = {
    display: 'flex',
    gap,
  };

  const cellStyle = (tasks: number): CSSProperties => ({
    width: cellSize,
    height: cellSize,
    backgroundColor: getHeatmapColor(tasks, darkMode),
    borderRadius: borderRadius.sm,
    transition: `background-color ${animation.duration.fast}ms ${animation.easing.standard}`,
  });

  const labelStyle: CSSProperties = {
    width: cellSize,
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    textAlign: 'center',
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      {showLabels && (
        <div style={rowStyle}>
          {dayLabels.map((label) => (
            <p key={label} style={labelStyle}>
              {label.slice(0, 1)}
            </p>
          ))}
        </div>
      )}
      <div style={rowStyle}>
        {paddedDays.map((day, index) => (
          <div
            key={index}
            style={cellStyle(day.tasksCompleted)}
            title={`${day.tasksCompleted} tasks`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CALENDAR HEATMAP
// ============================================================================

interface CalendarHeatmapProps {
  data: DayProgress[];
  months?: number;
  cellSize?: number;
  gap?: number;
  darkMode?: boolean;
}

/**
 * GitHub-style calendar heatmap
 */
export function CalendarHeatmap({
  data,
  months = 3,
  cellSize = 12,
  gap = 3,
  darkMode = false,
}: CalendarHeatmapProps) {
  const dataMap = useMemo(() => {
    const map = new Map<string, DayProgress>();
    data.forEach((d) => {
      const key = d.date.toISOString().split('T')[0];
      map.set(key!, d);
    });
    return map;
  }, [data]);

  // Generate weeks for the specified months
  const weeks = useMemo(() => {
    const result: Array<Array<{ date: Date; tasks: number } | null>> = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currentWeek: Array<{ date: Date; tasks: number } | null> = [];
    const current = new Date(startDate);

    while (current <= today) {
      const key = current.toISOString().split('T')[0];
      const dayData = dataMap.get(key!);
      currentWeek.push({
        date: new Date(current),
        tasks: dayData?.tasksCompleted || 0,
      });

      if (current.getDay() === 6) {
        result.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      result.push(currentWeek);
    }

    return result;
  }, [dataMap, months]);

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
  };

  const gridStyle: CSSProperties = {
    display: 'flex',
    gap,
  };

  const columnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap,
  };

  const cellStyle = (tasks: number): CSSProperties => ({
    width: cellSize,
    height: cellSize,
    backgroundColor: getHeatmapColor(tasks, darkMode),
    borderRadius: 2,
  });

  const emptyStyle: CSSProperties = {
    width: cellSize,
    height: cellSize,
    backgroundColor: 'transparent',
  };

  const legendStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    justifyContent: 'flex-end',
  };

  const legendLabelStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
  };

  const legendCellStyle = (level: number): CSSProperties => ({
    width: cellSize,
    height: cellSize,
    backgroundColor: getHeatmapColor(level * 2, darkMode),
    borderRadius: 2,
  });

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} style={columnStyle}>
            {week.map((day, dayIndex) =>
              day ? (
                <div
                  key={dayIndex}
                  style={cellStyle(day.tasks)}
                  title={`${day.date.toLocaleDateString()}: ${day.tasks} tasks`}
                />
              ) : (
                <div key={dayIndex} style={emptyStyle} />
              )
            )}
          </div>
        ))}
      </div>
      <div style={legendStyle}>
        <p style={legendLabelStyle}>Less</p>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} style={legendCellStyle(level)} />
        ))}
        <p style={legendLabelStyle}>More</p>
      </div>
    </div>
  );
}

// ============================================================================
// MONTHLY SUMMARY CARD
// ============================================================================

interface MonthlySummaryCardProps {
  month: MonthProgress;
  onExport?: () => void;
  darkMode?: boolean;
}

/**
 * Monthly summary with highlights
 */
export function MonthlySummaryCard({
  month,
  onExport,
  darkMode = false,
}: MonthlySummaryCardProps) {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const containerStyle: CSSProperties = {
    padding: spacing[5],
    backgroundColor: darkMode ? colors.neutral[800] : colors.surface.light,
    borderRadius: borderRadius.xl,
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const exportButtonStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: 'transparent',
    color: colors.primary[500],
    border: `1px solid ${colors.primary[500]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    display: onExport ? 'block' : 'none',
  };

  const statsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: spacing[4],
    marginBottom: spacing[4],
  };

  const statStyle: CSSProperties = {
    textAlign: 'center',
    padding: spacing[3],
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    borderRadius: borderRadius.lg,
  };

  const statValueStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
    margin: 0,
  };

  const statLabelStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginTop: spacing[1],
  };

  const highlightStyle: CSSProperties = {
    padding: spacing[3],
    backgroundColor: darkMode ? colors.success[900] : colors.success[50],
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.success[500]}`,
  };

  const highlightTitleStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success[600],
    margin: 0,
  };

  const highlightValueStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginTop: spacing[1],
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={titleStyle}>
          {monthNames[month.month]} {month.year}
        </p>
        {onExport && (
          <button style={exportButtonStyle} onClick={onExport} type="button">
            Export
          </button>
        )}
      </div>

      <div style={statsGridStyle}>
        <div style={statStyle}>
          <p style={statValueStyle}>{month.totalTasks}</p>
          <p style={statLabelStyle}>Tasks Completed</p>
        </div>
        <div style={statStyle}>
          <p style={statValueStyle}>{formatMinutes(month.totalFocusMinutes)}</p>
          <p style={statLabelStyle}>Focus Time</p>
        </div>
      </div>

      {(month.mostProductiveDay || month.longestSession) && (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}
        >
          {month.mostProductiveDay && (
            <div style={highlightStyle}>
              <p style={highlightTitleStyle}>Most Productive Day</p>
              <p style={highlightValueStyle}>
                {month.mostProductiveDay.day}: {month.mostProductiveDay.tasks}{' '}
                tasks
              </p>
            </div>
          )}
          {month.longestSession && (
            <div style={highlightStyle}>
              <p style={highlightTitleStyle}>Longest Focus Session</p>
              <p style={highlightValueStyle}>
                {formatMinutes(month.longestSession)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PERSONAL RECORDS
// ============================================================================

interface PersonalRecordsProps {
  records: PersonalRecord[];
  darkMode?: boolean;
}

/**
 * Display personal bests/records
 */
export function PersonalRecords({
  records,
  darkMode = false,
}: PersonalRecordsProps) {
  const containerStyle: CSSProperties = {
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.surface.light,
    borderRadius: borderRadius.xl,
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[4],
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const listStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
  };

  const recordStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[50],
    borderRadius: borderRadius.lg,
  };

  const iconStyle: CSSProperties = {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning[500],
    borderRadius: borderRadius.full,
    fontSize: 20,
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const recordTitleStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const recordValueStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning[500],
    margin: 0,
  };

  const recordDateStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginTop: 2,
  };

  return (
    <div style={containerStyle}>
      <p style={titleStyle}>
        <span>🏆</span> Personal Records
      </p>
      <div style={listStyle}>
        {records.map((record) => (
          <div key={record.id} style={recordStyle}>
            <div style={iconStyle}>{record.icon}</div>
            <div style={contentStyle}>
              <p style={recordTitleStyle}>{record.title}</p>
              <p style={recordValueStyle}>
                {record.value} {record.unit}
              </p>
              <p style={recordDateStyle}>
                Set on {record.date.toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TREND INDICATOR
// ============================================================================

interface TrendIndicatorDisplayProps {
  trend: TrendIndicator;
  size?: 'small' | 'medium';
  darkMode?: boolean;
}

/**
 * Visual trend indicator (improving, consistent, etc.)
 * NOTE: Never shows negative language like "you did less"
 */
export function TrendIndicatorDisplay({
  trend,
  size = 'medium',
  darkMode = false,
}: TrendIndicatorDisplayProps) {
  const getConfig = () => {
    switch (trend.type) {
      case 'improving':
        return {
          icon: '📈',
          color: colors.success[500],
          bg: darkMode ? colors.success[900] : colors.success[50],
        };
      case 'consistent':
        return {
          icon: '➡️',
          color: colors.primary[500],
          bg: darkMode ? colors.primary[900] : colors.primary[50],
        };
      case 'neutral':
      default:
        return {
          icon: '✨',
          color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
          bg: darkMode ? colors.neutral[800] : colors.neutral[100],
        };
    }
  };

  const config = getConfig();

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: size === 'small' ? spacing[2] : spacing[3],
    padding: size === 'small' ? `${spacing[2]}px ${spacing[3]}px` : spacing[3],
    backgroundColor: config.bg,
    borderRadius: borderRadius.lg,
  };

  const iconStyle: CSSProperties = {
    fontSize: size === 'small' ? 16 : 20,
  };

  const textContainerStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const labelStyle: CSSProperties = {
    fontSize:
      size === 'small' ? typography.fontSize.xs : typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: config.color,
    margin: 0,
  };

  const detailStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginTop: 2,
    display: trend.detail && size !== 'small' ? 'block' : 'none',
  };

  return (
    <div style={containerStyle}>
      <span style={iconStyle}>{config.icon}</span>
      <div style={textContainerStyle}>
        <p style={labelStyle}>{trend.label}</p>
        {trend.detail && <p style={detailStyle}>{trend.detail}</p>}
      </div>
    </div>
  );
}

// ============================================================================
// PROGRESS OVERVIEW
// ============================================================================

interface ProgressOverviewProps {
  todayCompleted: number;
  todayTarget: number;
  weekData: DayProgress[];
  trend: TrendIndicator;
  streak: number;
  darkMode?: boolean;
}

/**
 * Combined progress overview widget
 */
export function ProgressOverview({
  todayCompleted,
  todayTarget,
  weekData,
  trend,
  streak,
  darkMode = false,
}: ProgressOverviewProps) {
  const containerStyle: CSSProperties = {
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.surface.light,
    borderRadius: borderRadius.xl,
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  };

  const leftStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
  };

  const textStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const streakBadgeStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    padding: `${spacing[1]}px ${spacing[2]}px`,
    backgroundColor: darkMode ? colors.warning[900] : colors.warning[100],
    color: colors.warning[600],
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  };

  const sectionStyle: CSSProperties = {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTop: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginBottom: spacing[3],
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={leftStyle}>
          <DailyCompletionRing
            completed={todayCompleted}
            target={todayTarget}
            size={80}
            strokeWidth={8}
            darkMode={darkMode}
          />
          <div style={textStyle}>
            <p style={titleStyle}>Today</p>
            <p style={subtitleStyle}>
              {todayCompleted} task{todayCompleted !== 1 ? 's' : ''} done
            </p>
          </div>
        </div>
        {streak > 0 && (
          <div style={streakBadgeStyle}>
            <span>🔥</span>
            <span>{streak} day streak</span>
          </div>
        )}
      </div>

      <TrendIndicatorDisplay trend={trend} darkMode={darkMode} />

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>This Week</p>
        <WeeklyHeatmap days={weekData} darkMode={darkMode} />
      </div>
    </div>
  );
}
