'use client';

/**
 * App Store UI Components - Sprint 7
 * Review prompts, about screen, legal screens
 */

import type { CSSProperties } from 'react';
import type { ReviewPromptContent } from '@procrastinact/core';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  zIndex,
} from './tokens';

// ============================================================================
// REVIEW PROMPT MODAL
// ============================================================================

interface ReviewPromptModalProps {
  content: ReviewPromptContent;
  isOpen: boolean;
  onRate: () => void;
  onDismiss: (forever: boolean) => void;
  onLater: () => void;
  darkMode?: boolean;
}

export function ReviewPromptModal({
  content,
  isOpen,
  onRate,
  onDismiss,
  onLater,
  darkMode = false,
}: ReviewPromptModalProps) {
  if (!isOpen) return null;

  const styles: Record<string, CSSProperties> = {
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: colors.overlay.light,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex.modal,
      padding: spacing[4],
    },
    modal: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.xl,
      padding: spacing[6],
      width: '100%',
      maxWidth: 340,
      boxShadow: shadows.xl,
      textAlign: 'center' as const,
    },
    stars: {
      fontSize: typography.fontSize['3xl'],
      marginBottom: spacing[4],
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      marginBottom: spacing[2],
    },
    message: {
      fontSize: typography.fontSize.sm,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: spacing[6],
    },
    buttons: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
    },
    rateButton: {
      padding: spacing[4],
      backgroundColor: colors.primary[500],
      color: 'white',
      border: 'none',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      cursor: 'pointer',
    },
    laterButton: {
      padding: spacing[3],
      backgroundColor: 'transparent',
      color: colors.primary[500],
      border: `1px solid ${colors.primary[500]}`,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      cursor: 'pointer',
    },
    dismissButton: {
      padding: spacing[2],
      backgroundColor: 'transparent',
      color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
      border: 'none',
      fontSize: typography.fontSize.sm,
      cursor: 'pointer',
      marginTop: spacing[2],
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.stars}>⭐️⭐️⭐️⭐️⭐️</div>
        <h2 style={styles.title}>{content.title}</h2>
        <p style={styles.message}>{content.message}</p>
        <div style={styles.buttons}>
          <button style={styles.rateButton} onClick={onRate}>
            {content.positiveButton}
          </button>
          <button style={styles.laterButton} onClick={onLater}>
            {content.laterButton}
          </button>
          <button style={styles.dismissButton} onClick={() => onDismiss(true)}>
            {content.negativeButton}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ABOUT SCREEN
// ============================================================================

interface AppInfo {
  name: string;
  version: string;
  buildNumber?: string;
  description: string;
  website?: string;
  email?: string;
  twitter?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
}

interface AboutScreenProps {
  appInfo: AppInfo;
  onBack?: () => void;
  onPrivacyPolicy?: () => void;
  onTerms?: () => void;
  onContact?: () => void;
  onRateApp?: () => void;
  onShareApp?: () => void;
  darkMode?: boolean;
}

export function AboutScreen({
  appInfo,
  onBack,
  onPrivacyPolicy,
  onTerms,
  onContact,
  onRateApp,
  onShareApp,
  darkMode = false,
}: AboutScreenProps) {
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
    headerTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    content: {
      padding: spacing[6],
    },
    logo: {
      width: 100,
      height: 100,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.primary[500],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      marginBottom: spacing[4],
    },
    logoText: {
      fontSize: typography.fontSize['4xl'],
      color: 'white',
    },
    appName: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      textAlign: 'center' as const,
      marginBottom: spacing[1],
    },
    version: {
      fontSize: typography.fontSize.sm,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      textAlign: 'center' as const,
      marginBottom: spacing[4],
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      textAlign: 'center' as const,
      lineHeight: typography.lineHeight.relaxed,
      maxWidth: 300,
      margin: `0 auto ${spacing[6]}px`,
    },
    section: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.lg,
      marginBottom: spacing[4],
      overflow: 'hidden' as const,
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `${spacing[4]}px ${spacing[4]}px`,
      borderBottom: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
      cursor: 'pointer',
    },
    rowLast: {
      borderBottom: 'none',
    },
    rowLabel: {
      fontSize: typography.fontSize.base,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    rowArrow: {
      fontSize: typography.fontSize.lg,
      color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    },
    footer: {
      padding: spacing[6],
      textAlign: 'center' as const,
    },
    copyright: {
      fontSize: typography.fontSize.xs,
      color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    },
    madeWith: {
      fontSize: typography.fontSize.xs,
      color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
      marginTop: spacing[2],
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
        <h1 style={styles.headerTitle}>About</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.logo}>
          <span style={styles.logoText}>P</span>
        </div>
        <h2 style={styles.appName}>{appInfo.name}</h2>
        <p style={styles.version}>
          Version {appInfo.version}
          {appInfo.buildNumber && ` (${appInfo.buildNumber})`}
        </p>
        <p style={styles.description}>{appInfo.description}</p>

        <div style={styles.section}>
          {onRateApp && (
            <div style={styles.row} onClick={onRateApp}>
              <span style={styles.rowLabel}>Rate on App Store</span>
              <span style={styles.rowArrow}>→</span>
            </div>
          )}
          {onShareApp && (
            <div
              style={{
                ...styles.row,
                ...(!onPrivacyPolicy && !onTerms ? styles.rowLast : {}),
              }}
              onClick={onShareApp}
            >
              <span style={styles.rowLabel}>Share App</span>
              <span style={styles.rowArrow}>→</span>
            </div>
          )}
          {onContact && (
            <div style={styles.row} onClick={onContact}>
              <span style={styles.rowLabel}>Contact Support</span>
              <span style={styles.rowArrow}>→</span>
            </div>
          )}
        </div>

        <div style={styles.section}>
          {onPrivacyPolicy && (
            <div style={styles.row} onClick={onPrivacyPolicy}>
              <span style={styles.rowLabel}>Privacy Policy</span>
              <span style={styles.rowArrow}>→</span>
            </div>
          )}
          {onTerms && (
            <div style={{ ...styles.row, ...styles.rowLast }} onClick={onTerms}>
              <span style={styles.rowLabel}>Terms of Service</span>
              <span style={styles.rowArrow}>→</span>
            </div>
          )}
        </div>
      </div>

      <div style={styles.footer}>
        <p style={styles.copyright}>
          © {new Date().getFullYear()} ProcrastinAct
        </p>
        <p style={styles.madeWith}>Made with ♥ for people with ADHD</p>
      </div>
    </div>
  );
}

// ============================================================================
// LEGAL SCREEN
// ============================================================================

interface LegalScreenProps {
  title: string;
  content: string;
  lastUpdated?: string;
  onBack?: () => void;
  darkMode?: boolean;
}

export function LegalScreen({
  title,
  content,
  lastUpdated,
  onBack,
  darkMode = false,
}: LegalScreenProps) {
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
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    content: {
      padding: spacing[6],
    },
    lastUpdated: {
      fontSize: typography.fontSize.xs,
      color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
      marginBottom: spacing[4],
    },
    text: {
      fontSize: typography.fontSize.sm,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      lineHeight: typography.lineHeight.relaxed,
      whiteSpace: 'pre-wrap' as const,
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
        <h1 style={styles.headerTitle}>{title}</h1>
      </div>
      <div style={styles.content}>
        {lastUpdated && (
          <p style={styles.lastUpdated}>Last updated: {lastUpdated}</p>
        )}
        <div style={styles.text}>{content}</div>
      </div>
    </div>
  );
}

// ============================================================================
// SPLASH SCREEN
// ============================================================================

interface SplashScreenProps {
  appName?: string;
  tagline?: string;
  loading?: boolean;
}

export function SplashScreen({
  appName = 'ProcrastinAct',
  tagline = 'Small steps, big wins',
  loading = true,
}: SplashScreenProps) {
  const styles: Record<string, CSSProperties> = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex.max,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: borderRadius['2xl'],
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[6],
      boxShadow: shadows.xl,
    },
    logoText: {
      fontSize: typography.fontSize['5xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[500],
    },
    appName: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: 'white',
      marginBottom: spacing[2],
    },
    tagline: {
      fontSize: typography.fontSize.base,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: spacing[8],
    },
    loader: {
      width: 40,
      height: 40,
      border: '3px solid rgba(255, 255, 255, 0.3)',
      borderTopColor: 'white',
      borderRadius: borderRadius.full,
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.logo}>
        <span style={styles.logoText}>P</span>
      </div>
      <h1 style={styles.appName}>{appName}</h1>
      <p style={styles.tagline}>{tagline}</p>
      {loading && <div style={styles.loader} />}
    </div>
  );
}

// ============================================================================
// UPDATE AVAILABLE BANNER
// ============================================================================

interface UpdateBannerProps {
  version: string;
  onUpdate: () => void;
  onDismiss: () => void;
  darkMode?: boolean;
}

export function UpdateBanner({
  version,
  onUpdate,
  onDismiss,
  darkMode: _darkMode = false,
}: UpdateBannerProps) {
  const styles: Record<string, CSSProperties> = {
    banner: {
      position: 'fixed' as const,
      bottom: spacing[6],
      left: spacing[4],
      right: spacing[4],
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      boxShadow: shadows.xl,
      zIndex: zIndex.banner,
    },
    content: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    text: {
      color: 'white',
    },
    title: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing[1],
    },
    subtitle: {
      fontSize: typography.fontSize.xs,
      opacity: 0.9,
    },
    buttons: {
      display: 'flex',
      gap: spacing[2],
    },
    updateButton: {
      padding: `${spacing[2]}px ${spacing[4]}px`,
      backgroundColor: 'white',
      color: colors.primary[600],
      border: 'none',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      cursor: 'pointer',
    },
    dismissButton: {
      padding: spacing[2],
      backgroundColor: 'transparent',
      color: 'white',
      border: 'none',
      fontSize: typography.fontSize.lg,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <div style={styles.text}>
          <div style={styles.title}>Update Available</div>
          <div style={styles.subtitle}>
            Version {version} is ready to install
          </div>
        </div>
        <div style={styles.buttons}>
          <button style={styles.updateButton} onClick={onUpdate}>
            Update
          </button>
          <button style={styles.dismissButton} onClick={onDismiss}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WHAT'S NEW MODAL
// ============================================================================

interface WhatsNewItem {
  emoji: string;
  title: string;
  description: string;
}

interface WhatsNewModalProps {
  version: string;
  items: WhatsNewItem[];
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export function WhatsNewModal({
  version,
  items,
  isOpen,
  onClose,
  darkMode = false,
}: WhatsNewModalProps) {
  if (!isOpen) return null;

  const styles: Record<string, CSSProperties> = {
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: colors.overlay.light,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex.modal,
      padding: spacing[4],
    },
    modal: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.xl,
      padding: spacing[6],
      width: '100%',
      maxWidth: 400,
      maxHeight: '80vh',
      overflow: 'auto' as const,
      boxShadow: shadows.xl,
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: spacing[6],
    },
    badge: {
      display: 'inline-block',
      padding: `${spacing[1]}px ${spacing[3]}px`,
      backgroundColor: colors.primary[500],
      color: 'white',
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      marginBottom: spacing[2],
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    },
    list: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[4],
      marginBottom: spacing[6],
    },
    item: {
      display: 'flex',
      gap: spacing[3],
    },
    itemEmoji: {
      fontSize: typography.fontSize['2xl'],
      flexShrink: 0,
    },
    itemContent: {
      flex: 1,
    },
    itemTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      marginBottom: spacing[1],
    },
    itemDescription: {
      fontSize: typography.fontSize.sm,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      lineHeight: typography.lineHeight.relaxed,
    },
    closeButton: {
      width: '100%',
      padding: spacing[4],
      backgroundColor: colors.primary[500],
      color: 'white',
      border: 'none',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.badge}>v{version}</span>
          <h2 style={styles.title}>What&apos;s New</h2>
        </div>

        <div style={styles.list}>
          {items.map((item, index) => (
            <div key={index} style={styles.item}>
              <span style={styles.itemEmoji}>{item.emoji}</span>
              <div style={styles.itemContent}>
                <h3 style={styles.itemTitle}>{item.title}</h3>
                <p style={styles.itemDescription}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button style={styles.closeButton} onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}
