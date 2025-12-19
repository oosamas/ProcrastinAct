'use client';

/**
 * Personal Insights Dashboard - Issue #96 & Weekly Summary Report - Issue #97
 * User-facing analytics and progress insights
 * All messaging is celebratory, never judgmental
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
  WeeklyInsights,
  MonthlyInsights,
  PersonalInsight,
  InsightsDashboardData,
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
// TYPES
// ============================================================================

interface InsightsDashboardProviderProps {
  children: ReactNode;
  dashboardData?: InsightsDashboardData | null;
  onRefresh?: () => Promise<void>;
  darkMode?: boolean;
}

interface InsightsDashboardContextValue {
  data: InsightsDashboardData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  darkMode: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const InsightsDashboardContext =
  createContext<InsightsDashboardContextValue | null>(null);

export function InsightsDashboardProvider({
  children,
  dashboardData = null,
  onRefresh,
  darkMode = false,
}: InsightsDashboardProviderProps) {
  const [data, setData] = useState<InsightsDashboardData | null>(dashboardData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(dashboardData);
  }, [dashboardData]);

  const refresh = useCallback(async () => {
    if (onRefresh) {
      setLoading(true);
      try {
        await onRefresh();
      } finally {
        setLoading(false);
      }
    }
  }, [onRefresh]);

  return (
    <InsightsDashboardContext.Provider
      value={{ data, loading, refresh, darkMode }}
    >
      {children}
    </InsightsDashboardContext.Provider>
  );
}

export function useInsightsDashboard() {
  const context = useContext(InsightsDashboardContext);
  if (!context) {
    throw new Error(
      'useInsightsDashboard must be used within InsightsDashboardProvider'
    );
  }
  return context;
}

// ============================================================================
// OVERVIEW CARD
// ============================================================================

interface OverviewStatProps {
  label: string;
  value: string | number;
  icon: string;
  darkMode?: boolean;
}

export function OverviewStat({
  label,
  value,
  icon,
  darkMode = false,
}: OverviewStatProps) {
  const styles: Record<string, CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: spacing[4],
      flex: 1,
      minWidth: 100,
    },
    icon: {
      fontSize: typography.fontSize['2xl'],
      marginBottom: spacing[2],
    },
    value: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      fontFamily: typography.fontFamily.mono,
    },
    label: {
      fontSize: typography.fontSize.xs,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      textTransform: 'uppercase' as const,
      letterSpacing: typography.letterSpacing.wider,
      marginTop: spacing[1],
      textAlign: 'center' as const,
    },
  };

  return (
    <div style={styles.container}>
      <span style={styles.icon}>{icon}</span>
      <span style={styles.value}>{value}</span>
      <span style={styles.label}>{label}</span>
    </div>
  );
}

interface OverviewCardProps {
  overview: InsightsDashboardData['overview'];
  darkMode?: boolean;
}

export function OverviewCard({
  overview,
  darkMode = false,
}: OverviewCardProps) {
  const styles: Record<string, CSSProperties> = {
    card: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      boxShadow: darkMode ? shadows.md : shadows.sm,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      marginBottom: spacing[4],
    },
    statsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      gap: spacing[2],
    },
  };

  const formatFocusHours = (hours: number) => {
    if (hours < 1) return '<1';
    return hours.toLocaleString();
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Your Journey</h3>
      <div style={styles.statsRow}>
        <OverviewStat
          icon="✓"
          value={overview.totalTasksEver.toLocaleString()}
          label="Tasks Done"
          darkMode={darkMode}
        />
        <OverviewStat
          icon="⏱"
          value={`${formatFocusHours(overview.totalFocusHours)}h`}
          label="Focus Time"
          darkMode={darkMode}
        />
        <OverviewStat
          icon="🔥"
          value={overview.currentStreak}
          label="Current Streak"
          darkMode={darkMode}
        />
        <OverviewStat
          icon="🏆"
          value={overview.longestStreak}
          label="Best Streak"
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

// ============================================================================
// INSIGHT CARD
// ============================================================================

interface InsightCardProps {
  insight: PersonalInsight;
  darkMode?: boolean;
  onDismiss?: () => void;
}

export function InsightCard({
  insight,
  darkMode = false,
  onDismiss,
}: InsightCardProps) {
  const typeColors: Record<PersonalInsight['type'], string> = {
    pattern: colors.accent[500],
    win: colors.success,
    suggestion: colors.secondary[500],
    milestone: colors.primary[500],
  };

  const bgColor = typeColors[insight.type];

  const styles: Record<string, CSSProperties> = {
    card: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      boxShadow: darkMode ? shadows.sm : shadows.xs,
      borderLeft: `4px solid ${bgColor}`,
      display: 'flex',
      alignItems: 'flex-start',
      gap: spacing[3],
    },
    icon: {
      fontSize: typography.fontSize['2xl'],
      flexShrink: 0,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
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
    value: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: bgColor,
      marginTop: spacing[2],
      fontFamily: typography.fontFamily.mono,
    },
    dismissButton: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: typography.fontSize.lg,
      color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
      padding: spacing[1],
    },
  };

  return (
    <div style={styles.card}>
      <span style={styles.icon}>{insight.icon}</span>
      <div style={styles.content}>
        <h4 style={styles.title}>{insight.title}</h4>
        <p style={styles.description}>{insight.description}</p>
        {insight.value !== undefined && (
          <div style={styles.value}>
            {insight.value} {insight.unit}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          style={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dismiss insight"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ============================================================================
// WINS SECTION
// ============================================================================

interface WinsSectionProps {
  wins: string[];
  darkMode?: boolean;
}

export function WinsSection({ wins, darkMode = false }: WinsSectionProps) {
  if (wins.length === 0) return null;

  const styles: Record<string, CSSProperties> = {
    container: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      boxShadow: darkMode ? shadows.md : shadows.sm,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      marginBottom: spacing[4],
    },
    icon: {
      fontSize: typography.fontSize['2xl'],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
    },
    winItem: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      padding: spacing[3],
      backgroundColor: darkMode
        ? 'rgba(34, 197, 94, 0.1)'
        : 'rgba(34, 197, 94, 0.05)',
      borderRadius: borderRadius.md,
      borderLeft: `3px solid ${colors.success}`,
    },
    checkmark: {
      width: 24,
      height: 24,
      borderRadius: borderRadius.full,
      backgroundColor: colors.success,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      flexShrink: 0,
    },
    winText: {
      fontSize: typography.fontSize.sm,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      lineHeight: typography.lineHeight.relaxed,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>🎉</span>
        <h3 style={styles.title}>This Week's Wins</h3>
      </div>
      <ul style={styles.list}>
        {wins.map((win, index) => (
          <li key={index} style={styles.winItem}>
            <span style={styles.checkmark}>✓</span>
            <span style={styles.winText}>{win}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// PATTERNS SECTION
// ============================================================================

interface PatternsSectionProps {
  patterns: string[];
  darkMode?: boolean;
}

export function PatternsSection({
  patterns,
  darkMode = false,
}: PatternsSectionProps) {
  if (patterns.length === 0) return null;

  const styles: Record<string, CSSProperties> = {
    container: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      boxShadow: darkMode ? shadows.md : shadows.sm,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      marginBottom: spacing[4],
    },
    icon: {
      fontSize: typography.fontSize['2xl'],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
    },
    patternItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: spacing[3],
      padding: spacing[3],
      backgroundColor: darkMode
        ? 'rgba(20, 184, 166, 0.1)'
        : 'rgba(20, 184, 166, 0.05)',
      borderRadius: borderRadius.md,
      borderLeft: `3px solid ${colors.accent[500]}`,
    },
    lightbulb: {
      fontSize: typography.fontSize.lg,
      flexShrink: 0,
    },
    patternText: {
      fontSize: typography.fontSize.sm,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      lineHeight: typography.lineHeight.relaxed,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>💡</span>
        <h3 style={styles.title}>Patterns We Noticed</h3>
      </div>
      <ul style={styles.list}>
        {patterns.map((pattern, index) => (
          <li key={index} style={styles.patternItem}>
            <span style={styles.lightbulb}>🔍</span>
            <span style={styles.patternText}>{pattern}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// SUGGESTIONS SECTION
// ============================================================================

interface SuggestionsSectionProps {
  suggestions: string[];
  darkMode?: boolean;
}

export function SuggestionsSection({
  suggestions,
  darkMode = false,
}: SuggestionsSectionProps) {
  if (suggestions.length === 0) return null;

  const styles: Record<string, CSSProperties> = {
    container: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      boxShadow: darkMode ? shadows.md : shadows.sm,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      marginBottom: spacing[4],
    },
    icon: {
      fontSize: typography.fontSize['2xl'],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
    },
    suggestionItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: spacing[3],
      padding: spacing[3],
      backgroundColor: darkMode
        ? 'rgba(245, 158, 11, 0.1)'
        : 'rgba(245, 158, 11, 0.05)',
      borderRadius: borderRadius.md,
      borderLeft: `3px solid ${colors.secondary[500]}`,
    },
    arrow: {
      fontSize: typography.fontSize.lg,
      color: colors.secondary[500],
      flexShrink: 0,
    },
    suggestionText: {
      fontSize: typography.fontSize.sm,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      lineHeight: typography.lineHeight.relaxed,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>✨</span>
        <h3 style={styles.title}>Try This Week</h3>
      </div>
      <ul style={styles.list}>
        {suggestions.map((suggestion, index) => (
          <li key={index} style={styles.suggestionItem}>
            <span style={styles.arrow}>→</span>
            <span style={styles.suggestionText}>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// PRODUCTIVE TIME CARD
// ============================================================================

interface ProductiveTimeCardProps {
  bestHours: number[];
  bestDays: string[];
  avgSessionLength: number;
  darkMode?: boolean;
}

export function ProductiveTimeCard({
  bestHours,
  bestDays,
  avgSessionLength,
  darkMode = false,
}: ProductiveTimeCardProps) {
  const formatHour = (h: number) => {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  const styles: Record<string, CSSProperties> = {
    card: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      boxShadow: darkMode ? shadows.md : shadows.sm,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      marginBottom: spacing[4],
    },
    icon: {
      fontSize: typography.fontSize['2xl'],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: spacing[4],
    },
    item: {
      padding: spacing[3],
      backgroundColor: darkMode
        ? 'rgba(99, 102, 241, 0.1)'
        : 'rgba(99, 102, 241, 0.05)',
      borderRadius: borderRadius.md,
      textAlign: 'center' as const,
    },
    itemLabel: {
      fontSize: typography.fontSize.xs,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      textTransform: 'uppercase' as const,
      letterSpacing: typography.letterSpacing.wider,
      marginBottom: spacing[2],
    },
    itemValue: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary[500],
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>⚡</span>
        <h3 style={styles.title}>Your Power Times</h3>
      </div>
      <div style={styles.grid}>
        <div style={styles.item}>
          <div style={styles.itemLabel}>Best Hours</div>
          <div style={styles.itemValue}>
            {bestHours.length > 0
              ? bestHours.map(formatHour).join(', ')
              : 'No data yet'}
          </div>
        </div>
        <div style={styles.item}>
          <div style={styles.itemLabel}>Best Days</div>
          <div style={styles.itemValue}>
            {bestDays.length > 0 ? bestDays.join(', ') : 'No data yet'}
          </div>
        </div>
        <div style={styles.item}>
          <div style={styles.itemLabel}>Avg Session</div>
          <div style={styles.itemValue}>{avgSessionLength} min</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WEEKLY COMPARISON
// ============================================================================

interface WeeklyComparisonProps {
  comparison: WeeklyInsights['comparison'];
  totalTasks: number;
  totalFocus: number;
  darkMode?: boolean;
}

export function WeeklyComparison({
  comparison,
  totalTasks,
  totalFocus,
  darkMode = false,
}: WeeklyComparisonProps) {
  const getComparisonIcon = (status: 'improved' | 'same' | 'none') => {
    switch (status) {
      case 'improved':
        return '📈';
      case 'same':
        return '➡️';
      case 'none':
        return '🆕';
    }
  };

  const getComparisonText = (
    status: 'improved' | 'same' | 'none',
    metric: string
  ) => {
    switch (status) {
      case 'improved':
        return `More ${metric} than last week!`;
      case 'same':
        return `Consistent ${metric}`;
      case 'none':
        return 'Building your baseline';
    }
  };

  const styles: Record<string, CSSProperties> = {
    card: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      boxShadow: darkMode ? shadows.md : shadows.sm,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      marginBottom: spacing[4],
    },
    icon: {
      fontSize: typography.fontSize['2xl'],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: spacing[4],
    },
    metric: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      padding: spacing[3],
      backgroundColor: darkMode
        ? colors.surfaceElevated.dark
        : colors.neutral[50],
      borderRadius: borderRadius.md,
    },
    metricIcon: {
      fontSize: typography.fontSize.xl,
    },
    metricContent: {
      flex: 1,
    },
    metricValue: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    metricLabel: {
      fontSize: typography.fontSize.xs,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>📊</span>
        <h3 style={styles.title}>This Week</h3>
      </div>
      <div style={styles.grid}>
        <div style={styles.metric}>
          <span style={styles.metricIcon}>
            {getComparisonIcon(comparison.tasksVsLastWeek)}
          </span>
          <div style={styles.metricContent}>
            <div style={styles.metricValue}>{totalTasks} tasks</div>
            <div style={styles.metricLabel}>
              {getComparisonText(comparison.tasksVsLastWeek, 'tasks')}
            </div>
          </div>
        </div>
        <div style={styles.metric}>
          <span style={styles.metricIcon}>
            {getComparisonIcon(comparison.focusVsLastWeek)}
          </span>
          <div style={styles.metricContent}>
            <div style={styles.metricValue}>
              {Math.round(totalFocus / 60)}h focus
            </div>
            <div style={styles.metricLabel}>
              {getComparisonText(comparison.focusVsLastWeek, 'focus')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CATEGORY BREAKDOWN
// ============================================================================

interface CategoryBreakdownProps {
  categories: Array<{ category: string; percentage: number; count: number }>;
  darkMode?: boolean;
}

export function CategoryBreakdown({
  categories,
  darkMode = false,
}: CategoryBreakdownProps) {
  if (categories.length === 0) return null;

  const categoryColors = [
    colors.primary[500],
    colors.accent[500],
    colors.secondary[500],
    colors.success,
    colors.info,
  ];

  const styles: Record<string, CSSProperties> = {
    card: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      boxShadow: darkMode ? shadows.md : shadows.sm,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      marginBottom: spacing[4],
    },
    icon: {
      fontSize: typography.fontSize['2xl'],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    list: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
    },
    bar: {
      flex: 1,
      height: 24,
      backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
      borderRadius: borderRadius.full,
      overflow: 'hidden' as const,
      position: 'relative' as const,
    },
    barFill: {
      height: '100%',
      borderRadius: borderRadius.full,
      transition: `width ${animation.duration.slow}ms ${animation.easing.easeOut}`,
    },
    label: {
      minWidth: 100,
      fontSize: typography.fontSize.sm,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      fontWeight: typography.fontWeight.medium,
    },
    count: {
      minWidth: 60,
      fontSize: typography.fontSize.sm,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      textAlign: 'right' as const,
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>📁</span>
        <h3 style={styles.title}>Focus Areas</h3>
      </div>
      <div style={styles.list}>
        {categories.slice(0, 5).map((cat, index) => (
          <div key={cat.category} style={styles.item}>
            <span style={styles.label}>{cat.category}</span>
            <div style={styles.bar}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${cat.percentage}%`,
                  backgroundColor:
                    categoryColors[index % categoryColors.length],
                }}
              />
            </div>
            <span style={styles.count}>{cat.count} tasks</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// WEEKLY SUMMARY REPORT (Issue #97)
// ============================================================================

interface WeeklySummaryReportProps {
  insights: WeeklyInsights;
  highlights: string[];
  tips: string[];
  darkMode?: boolean;
  onShare?: () => void;
  onDismiss?: () => void;
}

export function WeeklySummaryReport({
  insights,
  highlights,
  tips,
  darkMode = false,
  onShare,
  onDismiss,
}: WeeklySummaryReportProps) {
  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    const start = insights.weekStart.toLocaleDateString('en-US', options);
    const end = insights.weekEnd.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  };

  const styles: Record<string, CSSProperties> = {
    container: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.xl,
      overflow: 'hidden' as const,
      boxShadow: shadows.xl,
    },
    header: {
      background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
      padding: spacing[8],
      color: 'white',
      textAlign: 'center' as const,
    },
    headerTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing[2],
    },
    headerDate: {
      fontSize: typography.fontSize.sm,
      opacity: 0.9,
    },
    content: {
      padding: spacing[6],
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: spacing[4],
      marginBottom: spacing[6],
    },
    stat: {
      textAlign: 'center' as const,
      padding: spacing[4],
      backgroundColor: darkMode
        ? colors.surfaceElevated.dark
        : colors.neutral[50],
      borderRadius: borderRadius.md,
    },
    statValue: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[500],
      fontFamily: typography.fontFamily.mono,
    },
    statLabel: {
      fontSize: typography.fontSize.xs,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      marginTop: spacing[1],
    },
    section: {
      marginBottom: spacing[6],
    },
    sectionTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      marginBottom: spacing[3],
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[2],
    },
    listItem: {
      fontSize: typography.fontSize.sm,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      padding: spacing[2],
      paddingLeft: spacing[4],
      borderLeft: `2px solid ${colors.primary[300]}`,
      lineHeight: typography.lineHeight.relaxed,
    },
    footer: {
      display: 'flex',
      gap: spacing[3],
      justifyContent: 'center',
      paddingTop: spacing[4],
      borderTop: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    },
    button: {
      padding: `${spacing[3]}px ${spacing[6]}px`,
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      cursor: 'pointer',
      border: 'none',
      transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    },
    shareButton: {
      backgroundColor: colors.primary[500],
      color: 'white',
    },
    dismissButton: {
      backgroundColor: 'transparent',
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Your Weekly Recap</h2>
        <div style={styles.headerDate}>{formatDateRange()}</div>
      </div>

      <div style={styles.content}>
        <div style={styles.statsGrid}>
          <div style={styles.stat}>
            <div style={styles.statValue}>{insights.totalTasksCompleted}</div>
            <div style={styles.statLabel}>Tasks Done</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>
              {Math.round(insights.totalFocusMinutes / 60)}h
            </div>
            <div style={styles.statLabel}>Focus Time</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{insights.streakDays}</div>
            <div style={styles.statLabel}>Day Streak</div>
          </div>
        </div>

        {highlights.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span>🎉</span> Highlights
            </h3>
            <ul style={styles.list}>
              {highlights.map((highlight, index) => (
                <li key={index} style={styles.listItem}>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tips.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span>✨</span> For Next Week
            </h3>
            <ul style={styles.list}>
              {tips.map((tip, index) => (
                <li key={index} style={styles.listItem}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={styles.footer}>
          {onShare && (
            <button
              style={{ ...styles.button, ...styles.shareButton }}
              onClick={onShare}
            >
              Share Progress
            </button>
          )}
          {onDismiss && (
            <button
              style={{ ...styles.button, ...styles.dismissButton }}
              onClick={onDismiss}
            >
              Got it!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyInsightsStateProps {
  darkMode?: boolean;
}

export function EmptyInsightsState({
  darkMode = false,
}: EmptyInsightsStateProps) {
  const styles: Record<string, CSSProperties> = {
    container: {
      textAlign: 'center' as const,
      padding: spacing[12],
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
    },
    icon: {
      fontSize: typography.fontSize['5xl'],
      marginBottom: spacing[4],
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      marginBottom: spacing[2],
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      maxWidth: 300,
      margin: '0 auto',
      lineHeight: typography.lineHeight.relaxed,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>📊</div>
      <h3 style={styles.title}>Your insights are brewing!</h3>
      <p style={styles.description}>
        Complete a few tasks and we'll start showing you patterns and
        celebrating your wins.
      </p>
    </div>
  );
}

// ============================================================================
// FULL DASHBOARD
// ============================================================================

interface InsightsDashboardProps {
  data: InsightsDashboardData | null;
  darkMode?: boolean;
  onRefresh?: () => void;
}

export function InsightsDashboard({
  data,
  darkMode = false,
  onRefresh,
}: InsightsDashboardProps) {
  if (!data) {
    return <EmptyInsightsState darkMode={darkMode} />;
  }

  const styles: Record<string, CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[6],
      padding: spacing[4],
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    refreshButton: {
      padding: `${spacing[2]}px ${spacing[4]}px`,
      backgroundColor: 'transparent',
      border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
      borderRadius: borderRadius.md,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      fontSize: typography.fontSize.sm,
      cursor: 'pointer',
    },
    twoColumn: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: spacing[6],
    },
    insightsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[4],
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Your Insights</h2>
        {onRefresh && (
          <button style={styles.refreshButton} onClick={onRefresh}>
            Refresh
          </button>
        )}
      </div>

      <OverviewCard overview={data.overview} darkMode={darkMode} />

      <div style={styles.twoColumn}>
        <WeeklyComparison
          comparison={data.thisWeek.comparison}
          totalTasks={data.thisWeek.totalTasksCompleted}
          totalFocus={data.thisWeek.totalFocusMinutes}
          darkMode={darkMode}
        />
        <ProductiveTimeCard
          bestHours={data.productivityPatterns.bestHours}
          bestDays={data.productivityPatterns.bestDays}
          avgSessionLength={data.productivityPatterns.avgSessionLength}
          darkMode={darkMode}
        />
      </div>

      <WinsSection wins={data.thisWeek.wins} darkMode={darkMode} />

      <div style={styles.twoColumn}>
        <PatternsSection
          patterns={data.thisWeek.patterns}
          darkMode={darkMode}
        />
        <SuggestionsSection
          suggestions={data.thisWeek.suggestions}
          darkMode={darkMode}
        />
      </div>

      <CategoryBreakdown
        categories={data.thisMonth.categoryBreakdown}
        darkMode={darkMode}
      />

      {data.recentInsights.length > 0 && (
        <div style={styles.insightsList}>
          <h3
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: darkMode
                ? colors.text.primary.dark
                : colors.text.primary.light,
              marginBottom: spacing[2],
            }}
          >
            Recent Insights
          </h3>
          {data.recentInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
