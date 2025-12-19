'use client';

import {
  type CSSProperties,
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { colors, spacing, typography, borderRadius, animation } from './tokens';

// ============================================================================
// TYPES
// ============================================================================

export type ConnectionStatus = 'online' | 'offline' | 'reconnecting';
export type SyncStatus =
  | 'synced'
  | 'pending'
  | 'syncing'
  | 'error'
  | 'conflict';

export interface OfflineState {
  connectionStatus: ConnectionStatus;
  syncStatus: SyncStatus;
  pendingChangesCount: number;
  lastSyncTime: Date | null;
  isInitialized: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

interface OfflineContextValue extends OfflineState {
  triggerSync: () => Promise<void>;
  getOfflineEncouragement: () => string;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

interface OfflineProviderProps {
  children: ReactNode;
  onSync?: () => Promise<void>;
  initialState?: Partial<OfflineState>;
}

/**
 * Provider for offline state management
 */
export function OfflineProvider({
  children,
  onSync,
  initialState,
}: OfflineProviderProps) {
  const [state, setState] = useState<OfflineState>({
    connectionStatus: 'online',
    syncStatus: 'synced',
    pendingChangesCount: 0,
    lastSyncTime: null,
    isInitialized: false,
    ...initialState,
  });

  // Set up network listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        connectionStatus: 'reconnecting',
      }));

      // Trigger sync after reconnection
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          connectionStatus: 'online',
        }));
      }, 1000);
    };

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        connectionStatus: 'offline',
      }));
    };

    // Check initial status
    setState((prev) => ({
      ...prev,
      connectionStatus: navigator.onLine ? 'online' : 'offline',
      isInitialized: true,
    }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSync = useCallback(async () => {
    if (onSync) {
      setState((prev) => ({ ...prev, syncStatus: 'syncing' }));
      try {
        await onSync();
        setState((prev) => ({
          ...prev,
          syncStatus: 'synced',
          lastSyncTime: new Date(),
        }));
      } catch {
        setState((prev) => ({ ...prev, syncStatus: 'error' }));
      }
    }
  }, [onSync]);

  const getOfflineEncouragement = useCallback(() => {
    const messages = [
      "You're working offline, and that's totally fine! Your changes are safe.",
      'No internet? No problem! Everything is saved locally.',
      'Offline mode active. Your progress is being tracked!',
      "Working without WiFi? We've got you covered.",
      "All your work is saved here. We'll sync when you're back online.",
      'Keep going! Your tasks are safe even without internet.',
      'Offline but still productive. Nice!',
      'No connection needed to be awesome.',
    ];
    return messages[Math.floor(Math.random() * messages.length)] as string;
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        ...state,
        triggerSync,
        getOfflineEncouragement,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

/**
 * Hook to access offline state
 */
export function useOffline(): OfflineContextValue {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}

// ============================================================================
// OFFLINE INDICATOR
// ============================================================================

interface OfflineIndicatorProps {
  showWhenOnline?: boolean;
  compact?: boolean;
  darkMode?: boolean;
}

/**
 * Clear offline/online status indicator
 */
export function OfflineIndicator({
  showWhenOnline = false,
  compact = false,
  darkMode = false,
}: OfflineIndicatorProps) {
  const { connectionStatus, syncStatus, pendingChangesCount } = useOffline();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const shouldShow =
      connectionStatus !== 'online' ||
      (showWhenOnline && syncStatus !== 'synced');

    if (shouldShow) {
      setIsVisible(true);
    } else {
      // Delay hide for smooth transition
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, syncStatus, showWhenOnline]);

  if (!isVisible && connectionStatus === 'online' && syncStatus === 'synced') {
    return null;
  }

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'offline':
        return {
          icon: '📡',
          label: 'Offline',
          description:
            pendingChangesCount > 0
              ? `${pendingChangesCount} change${pendingChangesCount !== 1 ? 's' : ''} pending`
              : 'Working offline',
          bg: darkMode ? colors.warning[900] : colors.warning[50],
          border: colors.warning[500],
          text: darkMode ? colors.warning[300] : colors.warning[700],
        };
      case 'reconnecting':
        return {
          icon: '🔄',
          label: 'Reconnecting',
          description: 'Back online, syncing...',
          bg: darkMode ? colors.primary[900] : colors.primary[50],
          border: colors.primary[500],
          text: darkMode ? colors.primary[300] : colors.primary[700],
        };
      default:
        if (syncStatus === 'syncing') {
          return {
            icon: '⟳',
            label: 'Syncing',
            description: `Syncing ${pendingChangesCount} change${pendingChangesCount !== 1 ? 's' : ''}`,
            bg: darkMode ? colors.primary[900] : colors.primary[50],
            border: colors.primary[500],
            text: darkMode ? colors.primary[300] : colors.primary[700],
          };
        }
        if (syncStatus === 'error') {
          return {
            icon: '⚠️',
            label: 'Sync Error',
            description: 'Some changes failed to sync',
            bg: darkMode ? colors.danger[900] : colors.danger[50],
            border: colors.danger[500],
            text: darkMode ? colors.danger[300] : colors.danger[700],
          };
        }
        return {
          icon: '✓',
          label: 'Online',
          description: 'All synced',
          bg: darkMode ? colors.success[900] : colors.success[50],
          border: colors.success[500],
          text: darkMode ? colors.success[300] : colors.success[700],
        };
    }
  };

  const config = getStatusConfig();

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: compact ? spacing[2] : spacing[3],
    padding: compact
      ? `${spacing[1]}px ${spacing[3]}px`
      : `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: config.bg,
    borderRadius: borderRadius.full,
    border: `1px solid ${config.border}`,
    transition: `all ${animation.duration.normal}ms ${animation.easing.standard}`,
  };

  const iconStyle: CSSProperties = {
    fontSize: compact ? 14 : 16,
    animation:
      connectionStatus === 'reconnecting' || syncStatus === 'syncing'
        ? 'spin 1s linear infinite'
        : 'none',
  };

  const textStyle: CSSProperties = {
    fontSize: compact ? typography.fontSize.xs : typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: config.text,
    margin: 0,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: config.text,
    opacity: 0.8,
    margin: 0,
    display: compact ? 'none' : 'block',
  };

  return (
    <>
      <div style={containerStyle} role="status" aria-live="polite">
        <span style={iconStyle} aria-hidden="true">
          {config.icon}
        </span>
        <div>
          <p style={textStyle}>{config.label}</p>
          {!compact && <p style={descriptionStyle}>{config.description}</p>}
        </div>
      </div>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}

// ============================================================================
// SYNC BUTTON
// ============================================================================

interface SyncButtonProps {
  onSync?: () => Promise<void>;
  disabled?: boolean;
  darkMode?: boolean;
}

/**
 * Manual sync trigger button
 */
export function SyncButton({
  onSync,
  disabled = false,
  darkMode = false,
}: SyncButtonProps) {
  const { connectionStatus, syncStatus, triggerSync } = useOffline();
  const [isSpinning, setIsSpinning] = useState(false);

  const isSyncing = syncStatus === 'syncing';
  const isDisabled =
    disabled ||
    !connectionStatus ||
    connectionStatus === 'offline' ||
    isSyncing;

  const handleClick = async () => {
    if (isDisabled) return;

    setIsSpinning(true);
    try {
      if (onSync) {
        await onSync();
      } else {
        await triggerSync();
      }
    } finally {
      setTimeout(() => setIsSpinning(false), 500);
    }
  };

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    color: isDisabled
      ? darkMode
        ? colors.text.muted.dark
        : colors.text.muted.light
      : darkMode
        ? colors.text.primary.dark
        : colors.text.primary.light,
    border: `1px solid ${darkMode ? colors.neutral[600] : colors.neutral[300]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    transition: `all ${animation.duration.fast}ms ${animation.easing.standard}`,
  };

  const iconStyle: CSSProperties = {
    fontSize: 16,
    animation: isSpinning || isSyncing ? 'spin 1s linear infinite' : 'none',
  };

  return (
    <>
      <button
        style={buttonStyle}
        onClick={handleClick}
        disabled={isDisabled}
        type="button"
        aria-label={isSyncing ? 'Syncing...' : 'Sync now'}
      >
        <span style={iconStyle} aria-hidden="true">
          ⟳
        </span>
        <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
      </button>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}

// ============================================================================
// SYNC STATUS BAR
// ============================================================================

interface SyncStatusBarProps {
  showPendingCount?: boolean;
  showLastSync?: boolean;
  darkMode?: boolean;
}

/**
 * Detailed sync status bar
 */
export function SyncStatusBar({
  showPendingCount = true,
  showLastSync = true,
  darkMode = false,
}: SyncStatusBarProps) {
  const { syncStatus, pendingChangesCount, lastSyncTime, connectionStatus } =
    useOffline();

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing[3]}px ${spacing[4]}px`,
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[50],
    borderRadius: borderRadius.lg,
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const leftStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  };

  const statusDotStyle: CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor:
      connectionStatus === 'offline'
        ? colors.warning[500]
        : syncStatus === 'synced'
          ? colors.success[500]
          : syncStatus === 'error'
            ? colors.danger[500]
            : colors.primary[500],
    animation: syncStatus === 'syncing' ? 'pulse 1s infinite' : 'none',
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const metaStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  };

  const getStatusLabel = () => {
    if (connectionStatus === 'offline') return 'Offline';
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'pending':
        return 'Changes pending';
      case 'error':
        return 'Sync error';
      case 'conflict':
        return 'Conflicts found';
      default:
        return 'All synced';
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return lastSyncTime.toLocaleDateString();
  };

  return (
    <>
      <div style={containerStyle}>
        <div style={leftStyle}>
          <div style={statusDotStyle} />
          <p style={labelStyle}>{getStatusLabel()}</p>
        </div>
        <div style={metaStyle}>
          {showPendingCount && pendingChangesCount > 0 && (
            <span>{pendingChangesCount} pending</span>
          )}
          {showLastSync && lastSyncTime && (
            <span>Last sync: {formatLastSync()}</span>
          )}
        </div>
      </div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </>
  );
}

// ============================================================================
// OFFLINE BANNER
// ============================================================================

interface OfflineBannerProps {
  onDismiss?: () => void;
  showEncouragement?: boolean;
  darkMode?: boolean;
}

/**
 * Full-width offline notification banner
 */
export function OfflineBanner({
  onDismiss,
  showEncouragement = true,
  darkMode = false,
}: OfflineBannerProps) {
  const { connectionStatus, getOfflineEncouragement, pendingChangesCount } =
    useOffline();
  const [encouragement, setEncouragement] = useState('');

  useEffect(() => {
    if (connectionStatus === 'offline' && showEncouragement) {
      setEncouragement(getOfflineEncouragement());
    }
  }, [connectionStatus, showEncouragement, getOfflineEncouragement]);

  if (connectionStatus !== 'offline') {
    return null;
  }

  const bannerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
    padding: `${spacing[3]}px ${spacing[4]}px`,
    backgroundColor: darkMode ? colors.warning[900] : colors.warning[100],
    borderBottom: `1px solid ${colors.warning[500]}`,
  };

  const contentStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  };

  const iconStyle: CSSProperties = {
    fontSize: 20,
  };

  const textContainerStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.warning[300] : colors.warning[800],
    margin: 0,
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.warning[400] : colors.warning[700],
    margin: 0,
    marginTop: 2,
  };

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spacing[1]}px ${spacing[2]}px`,
    backgroundColor: darkMode ? colors.warning[800] : colors.warning[200],
    color: darkMode ? colors.warning[200] : colors.warning[800],
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  };

  const dismissButtonStyle: CSSProperties = {
    padding: spacing[2],
    backgroundColor: 'transparent',
    border: 'none',
    color: darkMode ? colors.warning[400] : colors.warning[700],
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: 1,
  };

  return (
    <div style={bannerStyle} role="alert">
      <div style={contentStyle}>
        <span style={iconStyle} aria-hidden="true">
          📡
        </span>
        <div style={textContainerStyle}>
          <p style={titleStyle}>You're offline</p>
          {showEncouragement && encouragement && (
            <p style={messageStyle}>{encouragement}</p>
          )}
        </div>
        {pendingChangesCount > 0 && (
          <span style={badgeStyle}>{pendingChangesCount} pending</span>
        )}
      </div>
      {onDismiss && (
        <button
          style={dismissButtonStyle}
          onClick={onDismiss}
          type="button"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ============================================================================
// RECONNECTED TOAST
// ============================================================================

interface ReconnectedToastProps {
  onDismiss: () => void;
  autoDismissMs?: number;
  darkMode?: boolean;
}

/**
 * Toast shown when connection is restored
 */
export function ReconnectedToast({
  onDismiss,
  autoDismissMs = 4000,
  darkMode = false,
}: ReconnectedToastProps) {
  const { connectionStatus, syncStatus, pendingChangesCount } = useOffline();
  const [show, setShow] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (connectionStatus === 'offline') {
      setWasOffline(true);
    } else if (wasOffline && connectionStatus === 'online') {
      setShow(true);
      setWasOffline(false);

      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onDismiss, 200);
      }, autoDismissMs);

      return () => clearTimeout(timer);
    }
  }, [connectionStatus, wasOffline, autoDismissMs, onDismiss]);

  if (!show) return null;

  const toastStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: `${spacing[3]}px ${spacing[4]}px`,
    backgroundColor: darkMode ? colors.success[900] : colors.success[50],
    border: `1px solid ${colors.success[500]}`,
    borderRadius: borderRadius.lg,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  };

  const iconStyle: CSSProperties = {
    fontSize: 20,
    animation: syncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none',
  };

  const textStyle: CSSProperties = {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.success[300] : colors.success[800],
    margin: 0,
  };

  const getMessage = () => {
    if (syncStatus === 'syncing') {
      return `Back online! Syncing ${pendingChangesCount} change${pendingChangesCount !== 1 ? 's' : ''}...`;
    }
    if (syncStatus === 'synced') {
      return 'Back online! All changes synced.';
    }
    return 'Back online!';
  };

  return (
    <>
      <div style={toastStyle} role="status" aria-live="polite">
        <span style={iconStyle} aria-hidden="true">
          {syncStatus === 'syncing' ? '⟳' : '✓'}
        </span>
        <p style={textStyle}>{getMessage()}</p>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: darkMode ? colors.success[400] : colors.success[700],
            cursor: 'pointer',
            fontSize: 16,
            padding: spacing[1],
          }}
          onClick={() => {
            setShow(false);
            onDismiss();
          }}
          type="button"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}

// ============================================================================
// PENDING CHANGES LIST
// ============================================================================

interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  timestamp: Date;
  retryCount: number;
  lastError?: string;
}

interface PendingChangesListProps {
  changes: PendingChange[];
  onRetry?: (changeId: string) => void;
  onDiscard?: (changeId: string) => void;
  darkMode?: boolean;
}

/**
 * List of pending changes waiting to sync
 */
export function PendingChangesList({
  changes,
  onRetry,
  onDiscard,
  darkMode = false,
}: PendingChangesListProps) {
  if (changes.length === 0) {
    return null;
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
  };

  const headerStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[2],
  };

  const itemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    padding: spacing[3],
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[50],
    borderRadius: borderRadius.lg,
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const infoStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const typeStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
  };

  const entityStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginTop: 2,
  };

  const errorStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: colors.danger[500],
    margin: 0,
    marginTop: 4,
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[2],
  };

  const actionButtonStyle = (variant: 'retry' | 'discard'): CSSProperties => ({
    padding: `${spacing[1]}px ${spacing[2]}px`,
    backgroundColor:
      variant === 'retry'
        ? colors.primary[500]
        : darkMode
          ? colors.neutral[700]
          : colors.neutral[200],
    color:
      variant === 'retry'
        ? '#ffffff'
        : darkMode
          ? colors.text.muted.dark
          : colors.text.muted.light,
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.xs,
    cursor: 'pointer',
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'create':
        return '+';
      case 'update':
        return '✎';
      case 'delete':
        return '×';
      default:
        return '•';
    }
  };

  return (
    <div style={containerStyle}>
      <p style={headerStyle}>Pending Changes ({changes.length})</p>
      {changes.slice(0, 5).map((change) => (
        <div key={change.id} style={itemStyle}>
          <div style={infoStyle}>
            <p style={typeStyle}>
              {getTypeIcon(change.type)} {change.type} {change.entity}
            </p>
            <p style={entityStyle}>{change.entityId}</p>
            {change.lastError && (
              <p style={errorStyle}>Error: {change.lastError}</p>
            )}
          </div>
          <div style={actionsStyle}>
            {onRetry && change.lastError && (
              <button
                style={actionButtonStyle('retry')}
                onClick={() => onRetry(change.id)}
                type="button"
              >
                Retry
              </button>
            )}
            {onDiscard && (
              <button
                style={actionButtonStyle('discard')}
                onClick={() => onDiscard(change.id)}
                type="button"
              >
                Discard
              </button>
            )}
          </div>
        </div>
      ))}
      {changes.length > 5 && (
        <p
          style={{
            fontSize: typography.fontSize.xs,
            color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
            margin: 0,
            textAlign: 'center',
          }}
        >
          And {changes.length - 5} more...
        </p>
      )}
    </div>
  );
}

// ============================================================================
// DATA FRESHNESS INDICATOR
// ============================================================================

interface DataFreshnessIndicatorProps {
  lastUpdated: Date | null;
  isStale?: boolean;
  darkMode?: boolean;
}

/**
 * Shows how fresh the local data is
 */
export function DataFreshnessIndicator({
  lastUpdated,
  isStale = false,
  darkMode = false,
}: DataFreshnessIndicatorProps) {
  const formatTime = () => {
    if (!lastUpdated) return 'Never updated';

    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return lastUpdated.toLocaleDateString();
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const dotStyle: CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: isStale
      ? colors.warning[500]
      : lastUpdated
        ? colors.success[500]
        : colors.neutral[400],
  };

  const textStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <div style={dotStyle} />
      <p style={textStyle}>
        {isStale && 'Stale: '}
        {formatTime()}
      </p>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  OfflineProvider,
  useOffline,
  OfflineIndicator,
  SyncButton,
  SyncStatusBar,
  OfflineBanner,
  ReconnectedToast,
  PendingChangesList,
  DataFreshnessIndicator,
};
