/**
 * Insights Module - Issue #96 & #97
 * Export all insights-related functionality
 */

export {
  type DailyStats,
  type WeeklyInsights,
  type MonthlyInsights,
  type PersonalInsight,
  type InsightsDashboardData,
  generateWins,
  generatePatterns,
  generateSuggestions,
  InsightsService,
  getInsightsService,
} from './insights-service';
