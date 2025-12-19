'use client';

import {
  type CSSProperties,
  type ReactNode,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
  touchTarget,
  shadows,
} from './tokens';
import { useMotion } from './motion';
import { useHaptics } from './haptics';

// ============================================================================
// TYPES
// ============================================================================

export interface DonationAmount {
  value: number;
  label: string;
  description: string;
  popular?: boolean;
}

export type DonationType = 'one-time' | 'monthly';

export interface DonationTrigger {
  type: 'streak' | 'tasks' | 'gratitude' | 'anniversary' | 'manual';
  threshold?: number;
}

// ============================================================================
// DEFAULT DONATION AMOUNTS
// ============================================================================

export const DONATION_AMOUNTS: DonationAmount[] = [
  {
    value: 3,
    label: '$3',
    description: 'Buy us a coffee',
  },
  {
    value: 5,
    label: '$5',
    description: 'Support one week of development',
    popular: true,
  },
  {
    value: 10,
    label: '$10',
    description: 'Keep the servers running for a month',
  },
  {
    value: 25,
    label: '$25',
    description: 'Help us add new features',
  },
];

// ============================================================================
// DONATION TRIGGER CHECKER
// ============================================================================

export interface TriggerCheckResult {
  shouldShow: boolean;
  trigger: DonationTrigger | null;
  message: string | null;
}

/**
 * Check if donation prompt should be shown
 */
export function checkDonationTrigger(
  tasksCompleted: number,
  currentStreak: number,
  lastDonationDate: Date | null,
  lastPromptDate: Date | null
): TriggerCheckResult {
  const now = new Date();

  // Don't show if recently prompted (within 7 days)
  if (lastPromptDate) {
    const daysSincePrompt =
      (now.getTime() - lastPromptDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePrompt < 7) {
      return { shouldShow: false, trigger: null, message: null };
    }
  }

  // Don't show if recently donated (within 30 days)
  if (lastDonationDate) {
    const daysSinceDonation =
      (now.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDonation < 30) {
      return { shouldShow: false, trigger: null, message: null };
    }
  }

  // Check 7-day streak
  if (currentStreak === 7) {
    return {
      shouldShow: true,
      trigger: { type: 'streak', threshold: 7 },
      message: "One week strong! You're building great habits.",
    };
  }

  // Check 50 tasks milestone
  if (tasksCompleted === 50) {
    return {
      shouldShow: true,
      trigger: { type: 'tasks', threshold: 50 },
      message: "50 tasks completed! You're making incredible progress.",
    };
  }

  return { shouldShow: false, trigger: null, message: null };
}

// ============================================================================
// DONATION CARD
// ============================================================================

interface DonationCardProps {
  onDonate: (amount: number, type: DonationType) => void;
  onDismiss: () => void;
  triggerMessage?: string;
  darkMode?: boolean;
}

/**
 * Non-intrusive donation card
 */
export function DonationCard({
  onDonate,
  onDismiss,
  triggerMessage,
  darkMode = false,
}: DonationCardProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donationType, setDonationType] = useState<DonationType>('one-time');
  const [showCustom, setShowCustom] = useState(false);
  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();

  const containerStyle: CSSProperties = {
    backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    borderRadius: borderRadius['2xl'],
    boxShadow: shadows.xl,
    overflow: 'hidden',
    maxWidth: 400,
    margin: '0 auto',
  };

  const headerStyle: CSSProperties = {
    padding: spacing[6],
    paddingBottom: spacing[4],
    textAlign: 'center',
    borderBottom: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
  };

  const heartContainerStyle: CSSProperties = {
    width: 64,
    height: 64,
    margin: '0 auto',
    marginBottom: spacing[4],
    backgroundColor: darkMode ? colors.primary[900] : colors.primary[50],
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: reducedMotion ? 'none' : 'heartBeat 1.5s ease-in-out infinite',
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize['xl'],
    fontWeight: typography.fontWeight.bold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[2],
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    lineHeight: typography.lineHeight.relaxed,
  };

  const bodyStyle: CSSProperties = {
    padding: spacing[6],
  };

  const typeToggleStyle: CSSProperties = {
    display: 'flex',
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: 2,
    marginBottom: spacing[4],
  };

  const typeButtonStyle = (isActive: boolean): CSSProperties => ({
    flex: 1,
    padding: `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: isActive
      ? darkMode
        ? colors.neutral[700]
        : 'white'
      : 'transparent',
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: isActive
      ? typography.fontWeight.medium
      : typography.fontWeight.normal,
    cursor: 'pointer',
    boxShadow: isActive ? shadows.sm : 'none',
  });

  const amountsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: spacing[3],
    marginBottom: spacing[4],
  };

  const amountButtonStyle = (
    isSelected: boolean,
    isPopular: boolean
  ): CSSProperties => ({
    position: 'relative',
    padding: spacing[4],
    backgroundColor: isSelected
      ? darkMode
        ? colors.primary[900]
        : colors.primary[50]
      : darkMode
        ? colors.neutral[800]
        : colors.neutral[50],
    border: `2px solid ${isSelected ? colors.primary[500] : 'transparent'}`,
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    textAlign: 'center',
  });

  const popularBadgeStyle: CSSProperties = {
    position: 'absolute',
    top: -8,
    right: -8,
    padding: `${spacing[1]}px ${spacing[2]}px`,
    backgroundColor: colors.secondary[500],
    color: 'white',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    borderRadius: borderRadius.full,
  };

  const amountValueStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const amountDescStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginTop: spacing[1],
  };

  const customButtonStyle: CSSProperties = {
    width: '100%',
    padding: spacing[3],
    backgroundColor: 'transparent',
    color: colors.primary[500],
    border: 'none',
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    marginBottom: spacing[4],
  };

  const customInputStyle: CSSProperties = {
    width: '100%',
    padding: spacing[3],
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[100],
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: `2px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
    marginBottom: spacing[4],
  };

  const donateButtonStyle: CSSProperties = {
    width: '100%',
    padding: spacing[4],
    backgroundColor: colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    minHeight: touchTarget.comfortable,
  };

  const impactStyle: CSSProperties = {
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[50],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    textAlign: 'center',
  };

  const impactTextStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
  };

  const footerStyle: CSSProperties = {
    padding: spacing[4],
    borderTop: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    textAlign: 'center',
  };

  const dismissStyle: CSSProperties = {
    padding: spacing[2],
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    border: 'none',
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
  };

  const finalAmount = showCustom
    ? parseFloat(customAmount) || 0
    : selectedAmount;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={heartContainerStyle}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill={colors.primary[500]}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <h2 style={titleStyle}>Support ProcrastinAct</h2>
        <p style={messageStyle}>
          {triggerMessage ||
            'Help us keep this app free and ad-free for everyone.'}
        </p>
      </div>

      <div style={bodyStyle}>
        {/* One-time vs Monthly */}
        <div style={typeToggleStyle}>
          <button
            style={typeButtonStyle(donationType === 'one-time')}
            onClick={() => {
              trigger('tap');
              setDonationType('one-time');
            }}
            type="button"
          >
            One-time
          </button>
          <button
            style={typeButtonStyle(donationType === 'monthly')}
            onClick={() => {
              trigger('tap');
              setDonationType('monthly');
            }}
            type="button"
          >
            Monthly
          </button>
        </div>

        {/* Amount Selection */}
        {!showCustom ? (
          <>
            <div style={amountsGridStyle}>
              {DONATION_AMOUNTS.map((amount) => (
                <button
                  key={amount.value}
                  style={amountButtonStyle(
                    selectedAmount === amount.value,
                    !!amount.popular
                  )}
                  onClick={() => {
                    trigger('tap');
                    setSelectedAmount(amount.value);
                  }}
                  type="button"
                >
                  {amount.popular && (
                    <span style={popularBadgeStyle}>Popular</span>
                  )}
                  <p style={amountValueStyle}>{amount.label}</p>
                  <p style={amountDescStyle}>{amount.description}</p>
                </button>
              ))}
            </div>

            <button
              style={customButtonStyle}
              onClick={() => setShowCustom(true)}
              type="button"
            >
              Enter custom amount
            </button>
          </>
        ) : (
          <>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount"
              style={customInputStyle}
              min="1"
              step="1"
            />
            <button
              style={customButtonStyle}
              onClick={() => {
                setShowCustom(false);
                setCustomAmount('');
              }}
              type="button"
            >
              ← Back to presets
            </button>
          </>
        )}

        {/* Impact Message */}
        <div style={impactStyle}>
          <p style={impactTextStyle}>
            {donationType === 'monthly'
              ? `$${finalAmount}/month helps us improve and maintain ProcrastinAct`
              : `Your $${finalAmount} donation helps others like you get things done`}
          </p>
        </div>

        {/* Donate Button */}
        <button
          style={donateButtonStyle}
          onClick={() => {
            trigger('success');
            onDonate(finalAmount, donationType);
          }}
          type="button"
          disabled={finalAmount <= 0}
        >
          {donationType === 'monthly'
            ? `Donate $${finalAmount}/month`
            : `Donate $${finalAmount}`}
        </button>
      </div>

      <div style={footerStyle}>
        <button
          style={dismissStyle}
          onClick={() => {
            trigger('tap');
            onDismiss();
          }}
          type="button"
        >
          Maybe later
        </button>
      </div>

      <style>
        {`
          @keyframes heartBeat {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// THANK YOU CARD
// ============================================================================

interface ThankYouCardProps {
  amount: number;
  type: DonationType;
  onClose: () => void;
  darkMode?: boolean;
}

/**
 * Thank you card after donation
 */
export function ThankYouCard({
  amount,
  type,
  onClose,
  darkMode = false,
}: ThankYouCardProps) {
  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();

  useEffect(() => {
    trigger('success');
  }, [trigger]);

  const containerStyle: CSSProperties = {
    backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    borderRadius: borderRadius['2xl'],
    boxShadow: shadows.xl,
    padding: spacing[8],
    maxWidth: 400,
    margin: '0 auto',
    textAlign: 'center',
  };

  const iconStyle: CSSProperties = {
    width: 80,
    height: 80,
    margin: '0 auto',
    marginBottom: spacing[6],
    backgroundColor: colors.successScale[100],
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: reducedMotion ? 'none' : 'pop 0.5s ease-out',
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[3],
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginBottom: spacing[2],
    lineHeight: typography.lineHeight.relaxed,
  };

  const amountStyle: CSSProperties = {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    margin: 0,
    marginBottom: spacing[4],
  };

  const subMessageStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginBottom: spacing[6],
  };

  const closeButtonStyle: CSSProperties = {
    padding: `${spacing[3]}px ${spacing[6]}px`,
    backgroundColor: colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill={colors.success}>
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </div>

      <h2 style={titleStyle}>Thank You!</h2>

      <p style={messageStyle}>Your generosity means the world to us.</p>

      <p style={amountStyle}>
        ${amount}
        {type === 'monthly' ? '/mo' : ''}
      </p>

      <p style={subMessageStyle}>
        {type === 'monthly'
          ? "You're now a monthly supporter! Your ongoing support helps us build new features and keep ProcrastinAct free for everyone."
          : "Your one-time donation helps us keep ProcrastinAct free and ad-free. Thank you for believing in what we're building."}
      </p>

      <button
        style={closeButtonStyle}
        onClick={() => {
          trigger('tap');
          onClose();
        }}
        type="button"
      >
        Continue
      </button>

      <style>
        {`
          @keyframes pop {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// DONATION PROMPT BANNER
// ============================================================================

interface DonationBannerProps {
  message: string;
  onDonate: () => void;
  onDismiss: () => void;
  darkMode?: boolean;
}

/**
 * Non-intrusive donation prompt banner
 */
export function DonationBanner({
  message,
  onDonate,
  onDismiss,
  darkMode = false,
}: DonationBannerProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: darkMode ? colors.primary[900] : colors.primary[50],
    borderRadius: borderRadius.lg,
  };

  const iconStyle: CSSProperties = {
    width: 24,
    height: 24,
    color: colors.primary[500],
    flexShrink: 0,
  };

  const textStyle: CSSProperties = {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const buttonStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    flexShrink: 0,
  };

  const dismissStyle: CSSProperties = {
    padding: spacing[2],
    backgroundColor: 'transparent',
    border: 'none',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    cursor: 'pointer',
    flexShrink: 0,
  };

  return (
    <div style={containerStyle}>
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <p style={textStyle}>{message}</p>
      <button
        style={buttonStyle}
        onClick={() => {
          trigger('tap');
          onDonate();
        }}
        type="button"
      >
        Support
      </button>
      <button
        style={dismissStyle}
        onClick={() => {
          trigger('tap');
          onDismiss();
        }}
        type="button"
        aria-label="Dismiss"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>
  );
}

// ============================================================================
// SETTINGS DONATION LINK
// ============================================================================

interface DonationSettingsLinkProps {
  onPress: () => void;
  darkMode?: boolean;
}

/**
 * Donation link for settings page
 */
export function DonationSettingsLink({
  onPress,
  darkMode = false,
}: DonationSettingsLinkProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[4],
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
  };

  const iconContainerStyle: CSSProperties = {
    width: 40,
    height: 40,
    backgroundColor: darkMode ? colors.primary[900] : colors.primary[50],
    borderRadius: borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const textContainerStyle: CSSProperties = {
    flex: 1,
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
  };

  return (
    <button
      style={containerStyle}
      onClick={() => {
        trigger('tap');
        onPress();
      }}
      type="button"
    >
      <div style={iconContainerStyle}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={colors.primary[500]}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <div style={textContainerStyle}>
        <p style={titleStyle}>Support ProcrastinAct</p>
        <p style={subtitleStyle}>Help keep the app free and ad-free</p>
      </div>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={darkMode ? colors.text.muted.dark : colors.text.muted.light}
      >
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </svg>
    </button>
  );
}
