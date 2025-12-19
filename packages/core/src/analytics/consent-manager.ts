/**
 * Consent Manager - GDPR/CCPA compliant consent handling
 */

import type { ConsentState } from './types';

const CONSENT_VERSION = '1.0.0';
const CONSENT_STORAGE_KEY = 'procrastinact_consent';

export class ConsentManager {
  private consent: ConsentState;
  private listeners: Set<(consent: ConsentState) => void> = new Set();
  private storageAdapter: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  };

  constructor(
    storageAdapter: {
      get: (key: string) => Promise<string | null>;
      set: (key: string, value: string) => Promise<void>;
    },
    defaultConsent?: Partial<ConsentState>
  ) {
    this.storageAdapter = storageAdapter;
    this.consent = {
      analyticsEnabled: false,
      crashReportingEnabled: false,
      personalizedAdsEnabled: false, // Always false
      consentVersion: CONSENT_VERSION,
      ...defaultConsent,
    };
  }

  /**
   * Load consent state from storage
   */
  async load(): Promise<ConsentState> {
    try {
      const stored = await this.storageAdapter.get(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ConsentState;
        // Check if consent version matches
        if (parsed.consentVersion === CONSENT_VERSION) {
          this.consent = parsed;
        } else {
          // Consent version changed, need to re-ask
          this.consent = {
            ...this.consent,
            consentVersion: CONSENT_VERSION,
          };
        }
      }
    } catch {
      // Use default consent if loading fails
    }
    return this.consent;
  }

  /**
   * Save consent state to storage
   */
  async save(): Promise<void> {
    await this.storageAdapter.set(
      CONSENT_STORAGE_KEY,
      JSON.stringify(this.consent)
    );
  }

  /**
   * Get current consent state
   */
  getConsent(): ConsentState {
    return { ...this.consent };
  }

  /**
   * Check if analytics is allowed
   */
  isAnalyticsAllowed(): boolean {
    return this.consent.analyticsEnabled;
  }

  /**
   * Check if crash reporting is allowed
   */
  isCrashReportingAllowed(): boolean {
    return this.consent.crashReportingEnabled;
  }

  /**
   * Update consent state
   */
  async updateConsent(
    updates: Partial<Omit<ConsentState, 'consentVersion'>>
  ): Promise<void> {
    this.consent = {
      ...this.consent,
      ...updates,
      // Never allow personalized ads
      personalizedAdsEnabled: false,
      consentTimestamp: new Date(),
      consentVersion: CONSENT_VERSION,
    };

    await this.save();
    this.notifyListeners();
  }

  /**
   * Grant all consents
   */
  async grantAll(): Promise<void> {
    await this.updateConsent({
      analyticsEnabled: true,
      crashReportingEnabled: true,
    });
  }

  /**
   * Revoke all consents
   */
  async revokeAll(): Promise<void> {
    await this.updateConsent({
      analyticsEnabled: false,
      crashReportingEnabled: false,
    });
  }

  /**
   * Check if user has made a consent decision
   */
  hasConsentDecision(): boolean {
    return this.consent.consentTimestamp !== undefined;
  }

  /**
   * Subscribe to consent changes
   */
  subscribe(listener: (consent: ConsentState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const consent = this.getConsent();
    this.listeners.forEach((listener) => listener(consent));
  }

  /**
   * Export consent data for GDPR data portability
   */
  exportConsentData(): ConsentState & { exportedAt: string } {
    return {
      ...this.consent,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Get consent version for compliance tracking
   */
  getConsentVersion(): string {
    return CONSENT_VERSION;
  }
}
