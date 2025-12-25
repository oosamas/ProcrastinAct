'use client';

import { type CSSProperties, useState, useEffect } from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
  touchTarget,
} from './tokens';

// ============================================================================
// TYPES
// ============================================================================

export type AchievementCategory =
  | 'getting_started'
  | 'task_mastery'
  | 'focus'
  | 'self_care'
  | 'consistency'
  | 'exploration'
  | 'social'
  | 'hidden';

export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  hiddenUntilUnlocked: boolean;
  rewardMessage: string;
  shareText?: string;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: Date;
  seenByUser: boolean;
  shared: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  percentComplete: number;
}

// ============================================================================
// RARITY COLORS
// ============================================================================

export const RARITY_COLORS: Record<
  AchievementRarity,
  { bg: string; text: string; border: string; glow: string }
> = {
  common: {
    bg: '#9CA3AF',
    text: '#374151',
    border: '#6B7280',
    glow: 'rgba(156, 163, 175, 0.4)',
  },
  uncommon: {
    bg: '#10B981',
    text: '#065F46',
    border: '#059669',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  rare: {
    bg: '#3B82F6',
    text: '#1E40AF',
    border: '#2563EB',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  epic: {
    bg: '#8B5CF6',
    text: '#5B21B6',
    border: '#7C3AED',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  legendary: {
    bg: '#F59E0B',
    text: '#92400E',
    border: '#D97706',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
};

// ============================================================================
// ACHIEVEMENT BADGE
// ============================================================================

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: AchievementProgress;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onClick?: () => void;
  darkMode?: boolean;
}

/**
 * Single achievement badge display
 */
export function AchievementBadge({
  achievement,
  unlocked,
  progress,
  size = 'medium',
  showProgress = true,
  onClick,
  darkMode = false,
}: AchievementBadgeProps) {
  const rarityColors = RARITY_COLORS[achievement.rarity];

  const sizes = {
    small: { badge: 48, icon: 24, fontSize: typography.fontSize.xs },
    medium: { badge: 72, icon: 36, fontSize: typography.fontSize.sm },
    large: { badge: 96, icon: 48, fontSize: typography.fontSize.base },
  };

  const sizeConfig = sizes[size];

  const isHidden = achievement.hiddenUntilUnlocked && !unlocked;

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing[2],
    cursor: onClick ? 'pointer' : 'default',
    opacity: unlocked ? 1 : 0.5,
    filter: unlocked ? 'none' : 'grayscale(80%)',
    transition: `all ${animation.duration.normal}ms ${animation.easing.standard}`,
    minWidth: sizeConfig.badge + 20,
  };

  const badgeStyle: CSSProperties = {
    width: sizeConfig.badge,
    height: sizeConfig.badge,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: unlocked
      ? rarityColors.bg
      : darkMode
        ? colors.neutral[700]
        : colors.neutral[300],
    borderRadius: borderRadius.full,
    border: `3px solid ${unlocked ? rarityColors.border : 'transparent'}`,
    boxShadow: unlocked ? `0 0 20px ${rarityColors.glow}` : 'none',
    fontSize: sizeConfig.icon,
    position: 'relative',
  };

  const nameStyle: CSSProperties = {
    fontSize: sizeConfig.fontSize,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    textAlign: 'center',
    maxWidth: sizeConfig.badge + 40,
  };

  const progressBarContainerStyle: CSSProperties = {
    width: sizeConfig.badge,
    height: 4,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[300],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    display: showProgress && !unlocked && progress ? 'block' : 'none',
  };

  const progressBarStyle: CSSProperties = {
    width: `${progress?.percentComplete || 0}%`,
    height: '100%',
    backgroundColor: rarityColors.bg,
    transition: `width ${animation.duration.slow}ms ${animation.easing.standard}`,
  };

  return (
    <div
      style={containerStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div style={badgeStyle}>
        {isHidden ? '?' : achievement.icon}
        {unlocked && size === 'large' && (
          <div
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 20,
              height: 20,
              backgroundColor: colors.success[500],
              borderRadius: borderRadius.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#ffffff',
            }}
          >
            ✓
          </div>
        )}
      </div>
      <p style={nameStyle}>{isHidden ? '???' : achievement.name}</p>
      <div style={progressBarContainerStyle}>
        <div style={progressBarStyle} />
      </div>
    </div>
  );
}

// ============================================================================
// ACHIEVEMENT CARD
// ============================================================================

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: AchievementProgress;
  onShare?: () => void;
  darkMode?: boolean;
}

/**
 * Detailed achievement card
 */
export function AchievementCard({
  achievement,
  unlocked,
  unlockedAt,
  progress,
  onShare,
  darkMode = false,
}: AchievementCardProps) {
  const rarityColors = RARITY_COLORS[achievement.rarity];
  const isHidden = achievement.hiddenUntilUnlocked && !unlocked;

  const containerStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[4],
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.surface.light,
    borderRadius: borderRadius.xl,
    border: unlocked
      ? `2px solid ${rarityColors.border}`
      : `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
    boxShadow: unlocked ? `0 4px 20px ${rarityColors.glow}` : 'none',
    opacity: unlocked ? 1 : 0.7,
    filter: unlocked ? 'none' : 'grayscale(50%)',
  };

  const badgeStyle: CSSProperties = {
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: unlocked
      ? rarityColors.bg
      : darkMode
        ? colors.neutral[700]
        : colors.neutral[300],
    borderRadius: borderRadius.full,
    fontSize: 32,
    flexShrink: 0,
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[2],
  };

  const nameStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const rarityBadgeStyle: CSSProperties = {
    padding: `${spacing[1]}px ${spacing[2]}px`,
    backgroundColor: rarityColors.bg,
    color: '#ffffff',
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  };

  const descriptionStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginTop: spacing[1],
  };

  const progressContainerStyle: CSSProperties = {
    marginTop: spacing[3],
    display: !unlocked && progress ? 'block' : 'none',
  };

  const progressBarBgStyle: CSSProperties = {
    width: '100%',
    height: 8,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  };

  const progressBarFillStyle: CSSProperties = {
    width: `${progress?.percentComplete || 0}%`,
    height: '100%',
    backgroundColor: rarityColors.bg,
    transition: `width ${animation.duration.slow}ms ${animation.easing.standard}`,
  };

  const progressTextStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginTop: spacing[1],
    textAlign: 'right',
  };

  const unlockedInfoStyle: CSSProperties = {
    marginTop: spacing[3],
    display: unlocked ? 'flex' : 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const dateStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
  };

  const shareButtonStyle: CSSProperties = {
    padding: `${spacing[1]}px ${spacing[3]}px`,
    backgroundColor: 'transparent',
    color: colors.primary[500],
    border: `1px solid ${colors.primary[500]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    display: onShare && achievement.shareText ? 'block' : 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={badgeStyle}>{isHidden ? '?' : achievement.icon}</div>
      <div style={contentStyle}>
        <div style={headerStyle}>
          <p style={nameStyle}>{isHidden ? '???' : achievement.name}</p>
          <span style={rarityBadgeStyle}>{achievement.rarity}</span>
        </div>
        <p style={descriptionStyle}>
          {isHidden
            ? 'This achievement is hidden until unlocked!'
            : achievement.description}
        </p>
        <div style={progressContainerStyle}>
          <div style={progressBarBgStyle}>
            <div style={progressBarFillStyle} />
          </div>
          <p style={progressTextStyle}>
            {progress?.currentValue} / {progress?.targetValue}
          </p>
        </div>
        <div style={unlockedInfoStyle}>
          <p style={dateStyle}>Unlocked {unlockedAt?.toLocaleDateString()}</p>
          {onShare && (
            <button style={shareButtonStyle} onClick={onShare} type="button">
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ACHIEVEMENT UNLOCK NOTIFICATION
// ============================================================================

interface AchievementUnlockNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
  onShare?: () => void;
  animated?: boolean;
  darkMode?: boolean;
}

/**
 * Full-screen achievement unlock notification
 */
export function AchievementUnlockNotification({
  achievement,
  onDismiss,
  onShare,
  animated = true,
  darkMode: _darkMode = false,
}: AchievementUnlockNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const rarityColors = RARITY_COLORS[achievement.rarity];

  useEffect(() => {
    if (animated) {
      setIsAnimating(true);
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(true);
    }
  }, [animated]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${animation.duration.normal}ms ${animation.easing.standard}`,
  };

  const contentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing[5],
    padding: spacing[6],
    textAlign: 'center',
    maxWidth: 320,
    transform: isVisible ? 'scale(1)' : 'scale(0.8)',
    transition: `transform ${animation.duration.normal}ms ${animation.easing.standard}`,
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: rarityColors.bg,
    margin: 0,
  };

  const badgeContainerStyle: CSSProperties = {
    position: 'relative',
  };

  const badgeStyle: CSSProperties = {
    width: 120,
    height: 120,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: rarityColors.bg,
    borderRadius: borderRadius.full,
    border: `4px solid ${rarityColors.border}`,
    boxShadow: `0 0 40px ${rarityColors.glow}, 0 0 80px ${rarityColors.glow}`,
    fontSize: 60,
    animation: isAnimating ? 'bounceIn 0.6s ease-out' : 'none',
  };

  const nameStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#ffffff',
    margin: 0,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    color: colors.neutral[300],
    margin: 0,
    lineHeight: 1.5,
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: rarityColors.bg,
    margin: 0,
    fontStyle: 'italic',
  };

  const buttonsStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[3],
    marginTop: spacing[4],
  };

  const primaryButtonStyle: CSSProperties = {
    padding: `${spacing[3]}px ${spacing[5]}px`,
    backgroundColor: rarityColors.bg,
    color: '#ffffff',
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    minHeight: touchTarget.recommended,
  };

  const secondaryButtonStyle: CSSProperties = {
    padding: `${spacing[3]}px ${spacing[5]}px`,
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: `1px solid ${colors.neutral[600]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.base,
    cursor: 'pointer',
    minHeight: touchTarget.recommended,
    display: onShare && achievement.shareText ? 'block' : 'none',
  };

  return (
    <>
      <div style={overlayStyle} onClick={handleDismiss}>
        <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
          <p style={labelStyle}>{achievement.rarity} Achievement</p>
          <div style={badgeContainerStyle}>
            <div style={badgeStyle}>{achievement.icon}</div>
          </div>
          <p style={nameStyle}>{achievement.name}</p>
          <p style={descriptionStyle}>{achievement.description}</p>
          <p style={messageStyle}>{achievement.rewardMessage}</p>
          <div style={buttonsStyle}>
            <button
              style={primaryButtonStyle}
              onClick={handleDismiss}
              type="button"
            >
              Awesome!
            </button>
            {onShare && (
              <button
                style={secondaryButtonStyle}
                onClick={onShare}
                type="button"
              >
                Share
              </button>
            )}
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes bounceIn {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </>
  );
}

// ============================================================================
// ACHIEVEMENT GALLERY
// ============================================================================

interface AchievementGalleryProps {
  achievements: Achievement[];
  unlockedIds: string[];
  progressMap: Record<string, AchievementProgress>;
  onAchievementClick?: (achievement: Achievement) => void;
  columns?: 3 | 4 | 5;
  darkMode?: boolean;
}

/**
 * Grid gallery of achievements
 */
export function AchievementGallery({
  achievements,
  unlockedIds,
  progressMap,
  onAchievementClick,
  columns = 4,
  darkMode = false,
}: AchievementGalleryProps) {
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: spacing[4],
    padding: spacing[4],
  };

  return (
    <div style={gridStyle}>
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          unlocked={unlockedIds.includes(achievement.id)}
          progress={progressMap[achievement.id]}
          onClick={
            onAchievementClick
              ? () => onAchievementClick(achievement)
              : undefined
          }
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}

// ============================================================================
// ACHIEVEMENT CATEGORY SECTION
// ============================================================================

interface CategoryInfo {
  name: string;
  emoji: string;
  description: string;
}

interface AchievementCategorySectionProps {
  category: AchievementCategory;
  categoryInfo: CategoryInfo;
  achievements: Achievement[];
  unlockedIds: string[];
  progressMap: Record<string, AchievementProgress>;
  onAchievementClick?: (achievement: Achievement) => void;
  darkMode?: boolean;
}

/**
 * Section for a single category of achievements
 */
export function AchievementCategorySection({
  category: _category,
  categoryInfo,
  achievements,
  unlockedIds,
  progressMap,
  onAchievementClick,
  darkMode = false,
}: AchievementCategorySectionProps) {
  const unlockedCount = achievements.filter((a) =>
    unlockedIds.includes(a.id)
  ).length;

  const containerStyle: CSSProperties = {
    marginBottom: spacing[6],
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  };

  const titleStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const nameStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const countStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: spacing[3],
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>
          <span style={{ fontSize: 24 }}>{categoryInfo.emoji}</span>
          <p style={nameStyle}>{categoryInfo.name}</p>
        </div>
        <p style={countStyle}>
          {unlockedCount} / {achievements.length}
        </p>
      </div>
      <div style={gridStyle}>
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            unlocked={unlockedIds.includes(achievement.id)}
            progress={progressMap[achievement.id]}
            size="medium"
            onClick={
              onAchievementClick
                ? () => onAchievementClick(achievement)
                : undefined
            }
            darkMode={darkMode}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ACHIEVEMENT SUMMARY
// ============================================================================

interface AchievementSummaryProps {
  totalUnlocked: number;
  totalAchievements: number;
  recentUnlocked?: Achievement[];
  onViewAll?: () => void;
  darkMode?: boolean;
}

/**
 * Summary widget for profile/home screen
 */
export function AchievementSummary({
  totalUnlocked,
  totalAchievements,
  recentUnlocked = [],
  onViewAll,
  darkMode = false,
}: AchievementSummaryProps) {
  const percentage = Math.round((totalUnlocked / totalAchievements) * 100);

  const containerStyle: CSSProperties = {
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.surface.light,
    borderRadius: borderRadius.xl,
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const statsStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
    margin: 0,
  };

  const subStatsStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
  };

  const progressBarBgStyle: CSSProperties = {
    width: '100%',
    height: 8,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing[3],
  };

  const progressBarFillStyle: CSSProperties = {
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: colors.primary[500],
    transition: `width ${animation.duration.slow}ms ${animation.easing.standard}`,
  };

  const recentContainerStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[2],
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTop: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
    overflowX: 'auto',
  };

  const viewAllStyle: CSSProperties = {
    marginTop: spacing[4],
    padding: spacing[3],
    width: '100%',
    backgroundColor: 'transparent',
    color: colors.primary[500],
    border: `1px solid ${colors.primary[500]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    display: onViewAll ? 'block' : 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={titleStyle}>Achievements</p>
      </div>
      <p style={statsStyle}>{totalUnlocked}</p>
      <p style={subStatsStyle}>
        of {totalAchievements} unlocked ({percentage}%)
      </p>
      <div style={progressBarBgStyle}>
        <div style={progressBarFillStyle} />
      </div>
      {recentUnlocked.length > 0 && (
        <div style={recentContainerStyle}>
          {recentUnlocked.slice(0, 5).map((achievement) => (
            <div
              key={achievement.id}
              style={{
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: RARITY_COLORS[achievement.rarity].bg,
                borderRadius: borderRadius.full,
                fontSize: 24,
                flexShrink: 0,
              }}
            >
              {achievement.icon}
            </div>
          ))}
        </div>
      )}
      {onViewAll && (
        <button style={viewAllStyle} onClick={onViewAll} type="button">
          View All Achievements
        </button>
      )}
    </div>
  );
}
