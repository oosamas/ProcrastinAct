/**
 * Cost tracking and limits for AI service usage
 */

import type { AIProvider, CostLimits, AIServiceStats } from './types';

interface UsageRecord {
  timestamp: number;
  provider: AIProvider;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  cached: boolean;
}

export interface CostTrackerOptions {
  limits?: CostLimits;
  onLimitWarning?: (
    type: 'daily' | 'monthly',
    usage: number,
    limit: number
  ) => void;
  onLimitExceeded?: (type: 'daily' | 'monthly' | 'request') => void;
}

export class CostTracker {
  private records: UsageRecord[] = [];
  private limits: CostLimits;
  private onLimitWarning?: CostTrackerOptions['onLimitWarning'];
  private onLimitExceeded?: CostTrackerOptions['onLimitExceeded'];

  constructor(options: CostTrackerOptions = {}) {
    this.limits = options.limits ?? {};
    this.onLimitWarning = options.onLimitWarning;
    this.onLimitExceeded = options.onLimitExceeded;
  }

  /**
   * Check if a request with estimated cost can proceed
   */
  canProceed(estimatedCost: number): boolean {
    // Check per-request limit
    if (
      this.limits.perRequestLimit &&
      estimatedCost > this.limits.perRequestLimit
    ) {
      this.onLimitExceeded?.('request');
      return false;
    }

    // Check daily limit
    if (this.limits.dailyLimit) {
      const dailyUsage = this.getDailyUsage();
      if (dailyUsage + estimatedCost > this.limits.dailyLimit) {
        this.onLimitExceeded?.('daily');
        return false;
      }
    }

    // Check monthly limit
    if (this.limits.monthlyLimit) {
      const monthlyUsage = this.getMonthlyUsage();
      if (monthlyUsage + estimatedCost > this.limits.monthlyLimit) {
        this.onLimitExceeded?.('monthly');
        return false;
      }
    }

    return true;
  }

  /**
   * Record usage after a successful request
   */
  recordUsage(
    provider: AIProvider,
    inputTokens: number,
    outputTokens: number,
    cost: number,
    cached: boolean = false
  ): void {
    this.records.push({
      timestamp: Date.now(),
      provider,
      inputTokens,
      outputTokens,
      cost,
      cached,
    });

    // Check for warning thresholds (80% of limit)
    this.checkWarnings();

    // Clean up old records (keep 90 days)
    this.pruneOldRecords();
  }

  getDailyUsage(): number {
    const startOfDay = this.getStartOfDay();
    return this.records
      .filter((r) => r.timestamp >= startOfDay)
      .reduce((sum, r) => sum + r.cost, 0);
  }

  getMonthlyUsage(): number {
    const startOfMonth = this.getStartOfMonth();
    return this.records
      .filter((r) => r.timestamp >= startOfMonth)
      .reduce((sum, r) => sum + r.cost, 0);
  }

  getStats(): AIServiceStats {
    const requestsByProvider: Record<AIProvider, number> = {
      claude: 0,
      openai: 0,
      ollama: 0,
    };

    let totalTokens = 0;
    let totalCost = 0;
    let cachedCount = 0;
    const failedCount = 0; // We track this elsewhere, default to 0

    for (const record of this.records) {
      requestsByProvider[record.provider]++;
      totalTokens += record.inputTokens + record.outputTokens;
      totalCost += record.cost;
      if (record.cached) cachedCount++;
    }

    return {
      totalRequests: this.records.length,
      cachedResponses: cachedCount,
      failedRequests: failedCount,
      totalTokensUsed: totalTokens,
      estimatedCost: totalCost,
      requestsByProvider,
    };
  }

  getUsageByDay(
    days: number = 30
  ): { date: string; cost: number; requests: number }[] {
    const result: Map<string, { cost: number; requests: number }> = new Map();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    for (const record of this.records) {
      if (record.timestamp < cutoff) continue;

      const dateStr = new Date(record.timestamp).toISOString().split('T')[0]!;
      const existing = result.get(dateStr) ?? { cost: 0, requests: 0 };
      existing.cost += record.cost;
      existing.requests++;
      result.set(dateStr, existing);
    }

    return Array.from(result.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getRemainingBudget(): { daily: number | null; monthly: number | null } {
    return {
      daily: this.limits.dailyLimit
        ? Math.max(0, this.limits.dailyLimit - this.getDailyUsage())
        : null,
      monthly: this.limits.monthlyLimit
        ? Math.max(0, this.limits.monthlyLimit - this.getMonthlyUsage())
        : null,
    };
  }

  updateLimits(limits: Partial<CostLimits>): void {
    this.limits = { ...this.limits, ...limits };
  }

  exportRecords(): UsageRecord[] {
    return [...this.records];
  }

  importRecords(records: UsageRecord[]): void {
    this.records = [...records];
    this.pruneOldRecords();
  }

  private checkWarnings(): void {
    const WARNING_THRESHOLD = 0.8; // 80%

    if (this.limits.dailyLimit && this.onLimitWarning) {
      const dailyUsage = this.getDailyUsage();
      if (dailyUsage >= this.limits.dailyLimit * WARNING_THRESHOLD) {
        this.onLimitWarning('daily', dailyUsage, this.limits.dailyLimit);
      }
    }

    if (this.limits.monthlyLimit && this.onLimitWarning) {
      const monthlyUsage = this.getMonthlyUsage();
      if (monthlyUsage >= this.limits.monthlyLimit * WARNING_THRESHOLD) {
        this.onLimitWarning('monthly', monthlyUsage, this.limits.monthlyLimit);
      }
    }
  }

  private pruneOldRecords(): void {
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days
    this.records = this.records.filter((r) => r.timestamp >= cutoff);
  }

  private getStartOfDay(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }

  private getStartOfMonth(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }
}
