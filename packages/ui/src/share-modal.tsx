'use client';

/**
 * Share Modal - Sprint 6
 * UI for sharing achievements and progress
 */

import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { ShareContent } from '@procrastinact/core';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  animation,
  zIndex,
} from './tokens';

// ============================================================================
// TYPES
// ============================================================================

type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'clipboard';

interface SharePlatformConfig {
  id: SharePlatform;
  name: string;
  icon: string;
  color: string;
}

// ============================================================================
// PLATFORM CONFIG
// ============================================================================

const SHARE_PLATFORMS: SharePlatformConfig[] = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '𝕏',
    color: '#000000',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'f',
    color: '#1877f2',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'in',
    color: '#0a66c2',
  },
  {
    id: 'clipboard',
    name: 'Copy',
    icon: '📋',
    color: colors.neutral[500],
  },
];

// ============================================================================
// SHARE BUTTON
// ============================================================================

interface ShareButtonProps {
  platform: SharePlatformConfig;
  onClick: () => void;
  darkMode?: boolean;
}

export function ShareButton({
  platform,
  onClick,
  darkMode = false,
}: ShareButtonProps) {
  const styles: Record<string, CSSProperties> = {
    button: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: spacing[2],
      padding: spacing[3],
      backgroundColor: 'transparent',
      border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
      minWidth: 80,
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: platform.color,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
    },
    name: {
      fontSize: typography.fontSize.xs,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
    },
  };

  return (
    <button style={styles.button} onClick={onClick}>
      <div style={styles.icon}>{platform.icon}</div>
      <span style={styles.name}>{platform.name}</span>
    </button>
  );
}

// ============================================================================
// SHARE PREVIEW
// ============================================================================

interface SharePreviewProps {
  content: ShareContent;
  darkMode?: boolean;
}

export function SharePreview({ content, darkMode = false }: SharePreviewProps) {
  const styles: Record<string, CSSProperties> = {
    preview: {
      padding: spacing[4],
      backgroundColor: darkMode
        ? colors.surfaceElevated.dark
        : colors.neutral[50],
      borderRadius: borderRadius.md,
      marginBottom: spacing[4],
    },
    title: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      marginBottom: spacing[2],
    },
    message: {
      fontSize: typography.fontSize.sm,
      color: darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      whiteSpace: 'pre-wrap' as const,
      lineHeight: typography.lineHeight.relaxed,
    },
    hashtags: {
      marginTop: spacing[3],
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: spacing[2],
    },
    hashtag: {
      fontSize: typography.fontSize.xs,
      color: colors.primary[500],
      backgroundColor: darkMode
        ? 'rgba(99, 102, 241, 0.1)'
        : 'rgba(99, 102, 241, 0.05)',
      padding: `${spacing[1]}px ${spacing[2]}px`,
      borderRadius: borderRadius.full,
    },
  };

  return (
    <div style={styles.preview}>
      <div style={styles.title}>{content.title}</div>
      <div style={styles.message}>{content.message}</div>
      {content.hashtags && content.hashtags.length > 0 && (
        <div style={styles.hashtags}>
          {content.hashtags.map((tag) => (
            <span key={tag} style={styles.hashtag}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SHARE MODAL
// ============================================================================

interface ShareModalProps {
  content: ShareContent;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (platform: SharePlatform) => void;
  getShareUrl?: (
    content: ShareContent,
    platform: 'twitter' | 'facebook' | 'linkedin'
  ) => string;
  formatForClipboard?: (content: ShareContent) => string;
  darkMode?: boolean;
}

export function ShareModal({
  content,
  isOpen,
  onClose,
  onShare,
  getShareUrl,
  formatForClipboard,
  darkMode = false,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = async (platform: SharePlatform) => {
    if (platform === 'clipboard') {
      const text = formatForClipboard
        ? formatForClipboard(content)
        : `${content.title}\n\n${content.message}`;

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else if (getShareUrl) {
      const url = getShareUrl(content, platform);
      window.open(url, '_blank', 'width=600,height=400');
    }

    onShare?.(platform);
  };

  const styles: Record<string, CSSProperties> = {
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: colors.overlay.light,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex.modal,
    },
    modal: {
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.xl,
      padding: spacing[6],
      width: '100%',
      maxWidth: 400,
      boxShadow: shadows.xl,
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
    platforms: {
      display: 'flex',
      justifyContent: 'center',
      gap: spacing[3],
      marginTop: spacing[4],
    },
    copiedToast: {
      position: 'fixed' as const,
      bottom: spacing[8],
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: colors.success,
      color: 'white',
      padding: `${spacing[2]}px ${spacing[4]}px`,
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.sm,
      boxShadow: shadows.lg,
      zIndex: zIndex.toast,
    },
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.title}>Share your progress</h2>
            <button style={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>

          <SharePreview content={content} darkMode={darkMode} />

          <div style={styles.platforms}>
            {SHARE_PLATFORMS.map((platform) => (
              <ShareButton
                key={platform.id}
                platform={platform}
                onClick={() => handleShare(platform.id)}
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>
      </div>

      {copied && <div style={styles.copiedToast}>Copied to clipboard!</div>}
    </>
  );
}

// ============================================================================
// SHARE ACHIEVEMENT CARD
// ============================================================================

interface ShareAchievementCardProps {
  achievementName: string;
  achievementEmoji: string;
  achievementDescription: string;
  onShare: () => void;
  darkMode?: boolean;
}

export function ShareAchievementCard({
  achievementName,
  achievementEmoji,
  achievementDescription,
  onShare,
  darkMode = false,
}: ShareAchievementCardProps) {
  const styles: Record<string, CSSProperties> = {
    card: {
      background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
      borderRadius: borderRadius.xl,
      padding: spacing[6],
      color: 'white',
      textAlign: 'center' as const,
    },
    emoji: {
      fontSize: typography.fontSize['5xl'],
      marginBottom: spacing[3],
    },
    name: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing[2],
    },
    description: {
      fontSize: typography.fontSize.sm,
      opacity: 0.9,
      marginBottom: spacing[4],
    },
    shareButton: {
      padding: `${spacing[3]}px ${spacing[6]}px`,
      backgroundColor: 'white',
      color: colors.primary[600],
      border: 'none',
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.emoji}>{achievementEmoji}</div>
      <div style={styles.name}>{achievementName}</div>
      <div style={styles.description}>{achievementDescription}</div>
      <button style={styles.shareButton} onClick={onShare}>
        Share Achievement
      </button>
    </div>
  );
}

// ============================================================================
// QUICK SHARE BUTTON
// ============================================================================

interface QuickShareButtonProps {
  onClick: () => void;
  label?: string;
  darkMode?: boolean;
}

export function QuickShareButton({
  onClick,
  label = 'Share',
  darkMode = false,
}: QuickShareButtonProps) {
  const styles: Record<string, CSSProperties> = {
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: `${spacing[2]}px ${spacing[4]}px`,
      backgroundColor: darkMode
        ? colors.surfaceElevated.dark
        : colors.neutral[50],
      border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
      borderRadius: borderRadius.full,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
      fontSize: typography.fontSize.sm,
      cursor: 'pointer',
      transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    },
    icon: {
      fontSize: typography.fontSize.base,
    },
  };

  return (
    <button style={styles.button} onClick={onClick}>
      <span style={styles.icon}>↗</span>
      {label}
    </button>
  );
}
