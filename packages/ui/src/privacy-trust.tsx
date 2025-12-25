'use client';

import { type CSSProperties, useState } from 'react';
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

export interface PrivacySection {
  id: string;
  title: string;
  emoji: string;
  content: string;
  details?: string[];
}

export interface DataCollectionItem {
  id: string;
  category: 'essential' | 'functional' | 'analytics' | 'optional';
  name: string;
  description: string;
  purpose: string;
  storedLocally: boolean;
  sentToServer: boolean;
  canOptOut: boolean;
  retentionPeriod: string;
}

export interface OpenSourceCredit {
  name: string;
  license: string;
  url: string;
  description: string;
}

export interface TrustBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  verified: boolean;
}

// ============================================================================
// TRUST BADGE COMPONENT
// ============================================================================

interface TrustBadgeDisplayProps {
  badge: TrustBadge;
  size?: 'small' | 'medium' | 'large';
  darkMode?: boolean;
}

/**
 * Individual trust badge display
 */
export function TrustBadgeDisplay({
  badge,
  size = 'medium',
  darkMode = false,
}: TrustBadgeDisplayProps) {
  const sizes = {
    small: { icon: 20, padding: spacing[2], fontSize: typography.fontSize.xs },
    medium: { icon: 28, padding: spacing[3], fontSize: typography.fontSize.sm },
    large: {
      icon: 36,
      padding: spacing[4],
      fontSize: typography.fontSize.base,
    },
  };

  const sizeConfig = sizes[size];

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing[2],
    padding: sizeConfig.padding,
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[50],
    borderRadius: borderRadius.xl,
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
    textAlign: 'center',
    minWidth: size === 'large' ? 120 : 100,
  };

  const iconStyle: CSSProperties = {
    fontSize: sizeConfig.icon,
    lineHeight: 1,
  };

  const nameStyle: CSSProperties = {
    fontSize: sizeConfig.fontSize,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    display: size === 'small' ? 'none' : 'block',
  };

  const verifiedStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    fontSize: typography.fontSize.xs,
    color: colors.success[500],
    marginTop: spacing[1],
  };

  return (
    <div style={containerStyle}>
      <span style={iconStyle} aria-hidden="true">
        {badge.icon}
      </span>
      <p style={nameStyle}>{badge.name}</p>
      <p style={descriptionStyle}>{badge.description}</p>
      {badge.verified && size !== 'small' && (
        <span style={verifiedStyle}>
          <span>✓</span> Verified
        </span>
      )}
    </div>
  );
}

// ============================================================================
// TRUST BADGES GRID
// ============================================================================

interface TrustBadgesGridProps {
  badges: TrustBadge[];
  columns?: 2 | 3 | 4;
  size?: 'small' | 'medium' | 'large';
  darkMode?: boolean;
}

/**
 * Grid of trust badges
 */
export function TrustBadgesGrid({
  badges,
  columns = 3,
  size = 'medium',
  darkMode = false,
}: TrustBadgesGridProps) {
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: spacing[3],
  };

  return (
    <div style={gridStyle}>
      {badges.map((badge) => (
        <TrustBadgeDisplay
          key={badge.id}
          badge={badge}
          size={size}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}

// ============================================================================
// PRIVACY SECTION CARD
// ============================================================================

interface PrivacySectionCardProps {
  section: PrivacySection;
  expanded?: boolean;
  onToggle?: () => void;
  darkMode?: boolean;
}

/**
 * Expandable privacy policy section card
 */
export function PrivacySectionCard({
  section,
  expanded = false,
  onToggle,
  darkMode = false,
}: PrivacySectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggle?.();
  };

  const containerStyle: CSSProperties = {
    backgroundColor: darkMode ? colors.neutral[800] : colors.surface.light,
    borderRadius: borderRadius.xl,
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
    overflow: 'hidden',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    cursor: onToggle || section.details ? 'pointer' : 'default',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    minHeight: touchTarget.recommended,
  };

  const iconStyle: CSSProperties = {
    fontSize: 24,
    flexShrink: 0,
  };

  const contentContainerStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const summaryStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginTop: spacing[1],
    display: isExpanded ? 'none' : '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const chevronStyle: CSSProperties = {
    fontSize: 16,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: `transform ${animation.duration.fast}ms ${animation.easing.standard}`,
    display: section.details ? 'block' : 'none',
  };

  const detailsStyle: CSSProperties = {
    padding: isExpanded
      ? `0 ${spacing[4]}px ${spacing[4]}px ${spacing[4]}px`
      : '0',
    maxHeight: isExpanded ? 1000 : 0,
    opacity: isExpanded ? 1 : 0,
    overflow: 'hidden',
    transition: `all ${animation.duration.normal}ms ${animation.easing.standard}`,
  };

  const fullContentStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginBottom: section.details ? spacing[3] : 0,
    lineHeight: 1.6,
  };

  const listStyle: CSSProperties = {
    margin: 0,
    padding: 0,
    paddingLeft: spacing[4],
    listStyleType: 'disc',
  };

  const listItemStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    marginBottom: spacing[2],
    lineHeight: 1.5,
  };

  return (
    <div style={containerStyle}>
      <button style={headerStyle} onClick={handleToggle} type="button">
        <span style={iconStyle} aria-hidden="true">
          {section.emoji}
        </span>
        <div style={contentContainerStyle}>
          <h3 style={titleStyle}>{section.title}</h3>
          <p style={summaryStyle}>{section.content}</p>
        </div>
        <span style={chevronStyle} aria-hidden="true">
          ▼
        </span>
      </button>
      <div style={detailsStyle}>
        <p style={fullContentStyle}>{section.content}</p>
        {section.details && (
          <ul style={listStyle}>
            {section.details.map((detail, index) => (
              <li key={index} style={listItemStyle}>
                {detail}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PRIVACY POLICY VIEW
// ============================================================================

interface PrivacyPolicyViewProps {
  sections: PrivacySection[];
  version?: string;
  lastUpdated?: Date;
  darkMode?: boolean;
}

/**
 * Full privacy policy display
 */
export function PrivacyPolicyView({
  sections,
  version,
  lastUpdated,
  darkMode = false,
}: PrivacyPolicyViewProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
  };

  const headerStyle: CSSProperties = {
    textAlign: 'center',
    marginBottom: spacing[4],
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const metaStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginTop: spacing[2],
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Privacy Policy</h1>
        {(version || lastUpdated) && (
          <p style={metaStyle}>
            {version && `Version ${version}`}
            {version && lastUpdated && ' • '}
            {lastUpdated && `Last updated: ${lastUpdated.toLocaleDateString()}`}
          </p>
        )}
      </div>
      {sections.map((section) => (
        <PrivacySectionCard
          key={section.id}
          section={section}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}

// ============================================================================
// DATA TRANSPARENCY PANEL
// ============================================================================

interface DataTransparencyPanelProps {
  items: DataCollectionItem[];
  onOptOutChange?: (itemId: string, optedOut: boolean) => void;
  optedOutItems?: string[];
  darkMode?: boolean;
}

/**
 * Panel showing what data is collected and why
 */
export function DataTransparencyPanel({
  items,
  onOptOutChange,
  optedOutItems = [],
  darkMode = false,
}: DataTransparencyPanelProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
  };

  const categoryHeaderStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginBottom: spacing[2],
  };

  const itemStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[3],
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[50],
    borderRadius: borderRadius.lg,
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const itemContentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const itemNameStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const itemDescStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginTop: spacing[1],
  };

  const badgeContainerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginTop: spacing[2],
  };

  const badgeStyle = (type: 'local' | 'server' | 'optout'): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    padding: `${spacing[1]}px ${spacing[2]}px`,
    backgroundColor:
      type === 'local'
        ? colors.success[100]
        : type === 'server'
          ? colors.warning[100]
          : colors.primary[100],
    color:
      type === 'local'
        ? colors.success[700]
        : type === 'server'
          ? colors.warning[700]
          : colors.primary[700],
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
  });

  const toggleStyle = (enabled: boolean): CSSProperties => ({
    position: 'relative',
    width: 48,
    height: 28,
    backgroundColor: enabled
      ? colors.primary[500]
      : darkMode
        ? colors.neutral[600]
        : colors.neutral[300],
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    border: 'none',
    flexShrink: 0,
  });

  const toggleThumbStyle = (enabled: boolean): CSSProperties => ({
    position: 'absolute',
    top: 2,
    left: enabled ? 22 : 2,
    width: 24,
    height: 24,
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.full,
    transition: `left ${animation.duration.fast}ms ${animation.easing.standard}`,
  });

  const getCategoryTitle = (category: DataCollectionItem['category']) => {
    switch (category) {
      case 'essential':
        return 'Essential (Required)';
      case 'functional':
        return 'Functional Features';
      case 'analytics':
        return 'Analytics';
      case 'optional':
        return 'Optional';
      default:
        return category;
    }
  };

  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<DataCollectionItem['category'], DataCollectionItem[]>
  );

  const categories: DataCollectionItem['category'][] = [
    'essential',
    'functional',
    'analytics',
    'optional',
  ];

  return (
    <div style={containerStyle}>
      {categories.map(
        (category) =>
          groupedItems[category] && (
            <div key={category}>
              <h3 style={categoryHeaderStyle}>{getCategoryTitle(category)}</h3>
              {groupedItems[category].map((item) => {
                const isOptedOut = optedOutItems.includes(item.id);
                const isEnabled = !isOptedOut;

                return (
                  <div key={item.id} style={itemStyle}>
                    <div style={itemContentStyle}>
                      <p style={itemNameStyle}>{item.name}</p>
                      <p style={itemDescStyle}>{item.description}</p>
                      <p style={itemDescStyle}>
                        <strong>Purpose:</strong> {item.purpose}
                      </p>
                      <p style={itemDescStyle}>
                        <strong>Retention:</strong> {item.retentionPeriod}
                      </p>
                      <div style={badgeContainerStyle}>
                        {item.storedLocally && (
                          <span style={badgeStyle('local')}>📱 Local only</span>
                        )}
                        {item.sentToServer && (
                          <span style={badgeStyle('server')}>☁️ Synced</span>
                        )}
                        {item.canOptOut && (
                          <span style={badgeStyle('optout')}>✓ Optional</span>
                        )}
                      </div>
                    </div>
                    {item.canOptOut && onOptOutChange && (
                      <button
                        style={toggleStyle(isEnabled)}
                        onClick={() => onOptOutChange(item.id, isEnabled)}
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        aria-label={`${item.name}: ${isEnabled ? 'Enabled' : 'Disabled'}`}
                      >
                        <div style={toggleThumbStyle(isEnabled)} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )
      )}
    </div>
  );
}

// ============================================================================
// NO ADS BADGE
// ============================================================================

interface NoAdsBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showDescription?: boolean;
  darkMode?: boolean;
}

/**
 * Prominent "No Ads Ever" badge
 */
export function NoAdsBadge({
  size = 'medium',
  showDescription = true,
  darkMode = false,
}: NoAdsBadgeProps) {
  const sizes = {
    small: { icon: 24, padding: spacing[2], gap: spacing[2] },
    medium: { icon: 32, padding: spacing[3], gap: spacing[3] },
    large: { icon: 48, padding: spacing[4], gap: spacing[4] },
  };

  const sizeConfig = sizes[size];

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: sizeConfig.gap,
    padding: sizeConfig.padding,
    backgroundColor: darkMode ? colors.success[900] : colors.success[50],
    borderRadius: borderRadius.xl,
    border: `2px solid ${colors.success[500]}`,
  };

  const iconContainerStyle: CSSProperties = {
    width: sizeConfig.icon,
    height: sizeConfig.icon,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success[500],
    borderRadius: borderRadius.full,
    color: '#ffffff',
    fontSize: sizeConfig.icon * 0.5,
    fontWeight: typography.fontWeight.bold,
  };

  const textContainerStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: CSSProperties = {
    fontSize:
      size === 'large' ? typography.fontSize.lg : typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: darkMode ? colors.success[300] : colors.success[800],
    margin: 0,
  };

  const descStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.success[400] : colors.success[700],
    margin: 0,
    marginTop: spacing[1],
    display: showDescription ? 'block' : 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle}>🚫</div>
      <div style={textContainerStyle}>
        <p style={titleStyle}>No Ads, Ever</p>
        <p style={descStyle}>
          We will never show advertisements. Your focus is sacred.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// OPEN SOURCE CREDITS LIST
// ============================================================================

interface OpenSourceCreditsListProps {
  credits: OpenSourceCredit[];
  darkMode?: boolean;
}

/**
 * List of open source attributions
 */
export function OpenSourceCreditsList({
  credits,
  darkMode = false,
}: OpenSourceCreditsListProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
  };

  const headerStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[3],
  };

  const itemStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[50],
    borderRadius: borderRadius.lg,
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const nameStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const descStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginTop: spacing[1],
  };

  const licenseStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
    backgroundColor: darkMode ? colors.primary[900] : colors.primary[50],
    padding: `${spacing[1]}px ${spacing[2]}px`,
    borderRadius: borderRadius.md,
    textDecoration: 'none',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Open Source Software</h2>
      <p
        style={{
          fontSize: typography.fontSize.sm,
          color: darkMode
            ? colors.text.secondary.dark
            : colors.text.secondary.light,
          margin: 0,
          marginBottom: spacing[3],
        }}
      >
        ProcrastinAct is built with the help of these amazing open source
        projects. We&apos;re grateful to their contributors.
      </p>
      {credits.map((credit) => (
        <div key={credit.name} style={itemStyle}>
          <div>
            <p style={nameStyle}>{credit.name}</p>
            <p style={descStyle}>{credit.description}</p>
          </div>
          <a
            href={credit.url}
            target="_blank"
            rel="noopener noreferrer"
            style={licenseStyle}
          >
            {credit.license}
          </a>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// PRIVACY SUMMARY CARD
// ============================================================================

interface PrivacySummaryCardProps {
  onViewFullPolicy?: () => void;
  darkMode?: boolean;
}

/**
 * Quick summary of key privacy points
 */
export function PrivacySummaryCard({
  onViewFullPolicy,
  darkMode = false,
}: PrivacySummaryCardProps) {
  const summaryPoints = [
    { icon: '📱', text: 'Your data stays on your device by default' },
    { icon: '🚫', text: "No ads, ever - we're donation-supported" },
    { icon: '🔒', text: 'Optional cloud sync is end-to-end encrypted' },
    { icon: '📊', text: 'Anonymous analytics can be disabled' },
    { icon: '🗑️', text: 'Delete your data anytime, completely' },
  ];

  const containerStyle: CSSProperties = {
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.surface.light,
    borderRadius: borderRadius.xl,
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const listStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    margin: 0,
    padding: 0,
    listStyle: 'none',
  };

  const itemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
  };

  const buttonStyle: CSSProperties = {
    width: '100%',
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: 'transparent',
    color: colors.primary[500],
    border: `1px solid ${colors.primary[500]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={{ fontSize: 24 }}>🔐</span>
        <h2 style={titleStyle}>Your Privacy, Protected</h2>
      </div>
      <ul style={listStyle}>
        {summaryPoints.map((point, index) => (
          <li key={index} style={itemStyle}>
            <span aria-hidden="true">{point.icon}</span>
            <span>{point.text}</span>
          </li>
        ))}
      </ul>
      {onViewFullPolicy && (
        <button style={buttonStyle} onClick={onViewFullPolicy} type="button">
          View Full Privacy Policy
        </button>
      )}
    </div>
  );
}
