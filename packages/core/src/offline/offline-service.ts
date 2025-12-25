/**
 * Offline Service - Issue #116
 * Manages offline functionality and data synchronization
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Online/offline connection status
 */
export type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

/**
 * Sync status for data
 */
export type SyncStatus =
  | 'synced'
  | 'pending'
  | 'syncing'
  | 'error'
  | 'conflict';

/**
 * Pending change to be synced
 */
export interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'timer' | 'note' | 'preference' | 'achievement';
  entityId: string;
  data: Record<string, unknown>;
  timestamp: Date;
  retryCount: number;
  lastError?: string;
}

/**
 * Sync result
 */
export interface SyncResult {
  success: boolean;
  syncedChanges: number;
  failedChanges: number;
  conflicts: ConflictInfo[];
  timestamp: Date;
}

/**
 * Conflict information
 */
export interface ConflictInfo {
  changeId: string;
  entityId: string;
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
  localTimestamp: Date;
  remoteTimestamp: Date;
  resolution?: 'local' | 'remote' | 'merged';
}

/**
 * Offline service configuration
 */
export interface OfflineServiceConfig {
  maxRetries: number;
  retryDelayMs: number;
  syncIntervalMs: number;
  maxPendingChanges: number;
  storageKey: string;
  debug?: boolean;
}

/**
 * Offline state
 */
export interface OfflineState {
  connectionStatus: ConnectionStatus;
  syncStatus: SyncStatus;
  pendingChangesCount: number;
  lastSyncTime: Date | null;
  lastOnlineTime: Date | null;
  isInitialized: boolean;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

export const DEFAULT_OFFLINE_CONFIG: OfflineServiceConfig = {
  maxRetries: 3,
  retryDelayMs: 5000,
  syncIntervalMs: 30000, // 30 seconds
  maxPendingChanges: 1000,
  storageKey: 'procrastinact_offline',
  debug: false,
};

// ============================================================================
// OFFLINE SERVICE
// ============================================================================

export class OfflineService {
  private config: OfflineServiceConfig;
  private pendingChanges: Map<string, PendingChange> = new Map();
  private state: OfflineState;
  private listeners: Set<(state: OfflineState) => void> = new Set();
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private storageAdapter: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    remove: (key: string) => Promise<void>;
  } | null = null;

  constructor(config: Partial<OfflineServiceConfig> = {}) {
    this.config = { ...DEFAULT_OFFLINE_CONFIG, ...config };
    this.state = {
      connectionStatus: 'online',
      syncStatus: 'synced',
      pendingChangesCount: 0,
      lastSyncTime: null,
      lastOnlineTime: new Date(),
      isInitialized: false,
    };
  }

  /**
   * Initialize the offline service
   */
  async initialize(storageAdapter?: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    remove: (key: string) => Promise<void>;
  }): Promise<void> {
    this.storageAdapter = storageAdapter || null;

    // Load pending changes from storage
    await this.loadPendingChanges();

    // Set up network listeners
    this.setupNetworkListeners();

    // Start sync interval
    this.startSyncInterval();

    // Check initial connection status
    await this.checkConnection();

    this.updateState({ isInitialized: true });

    if (this.config.debug) {
      console.log('[Offline] Service initialized', this.state);
    }
  }

  /**
   * Shutdown the service
   */
  shutdown(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  /**
   * Get current state
   */
  getState(): OfflineState {
    return { ...this.state };
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return this.state.connectionStatus === 'online';
  }

  /**
   * Queue a change for sync
   */
  async queueChange(
    change: Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<string> {
    const id = `change_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const pendingChange: PendingChange = {
      ...change,
      id,
      timestamp: new Date(),
      retryCount: 0,
    };

    // Check if we're at max capacity
    if (this.pendingChanges.size >= this.config.maxPendingChanges) {
      // Remove oldest changes
      const sorted = [...this.pendingChanges.values()].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
      const toRemove = sorted.slice(
        0,
        this.pendingChanges.size - this.config.maxPendingChanges + 1
      );
      toRemove.forEach((c) => this.pendingChanges.delete(c.id));
    }

    this.pendingChanges.set(id, pendingChange);
    await this.savePendingChanges();

    this.updateState({
      pendingChangesCount: this.pendingChanges.size,
      syncStatus: 'pending',
    });

    if (this.config.debug) {
      console.log('[Offline] Change queued:', pendingChange);
    }

    // Try to sync immediately if online
    if (this.isOnline()) {
      this.triggerSync();
    }

    return id;
  }

  /**
   * Get pending changes
   */
  getPendingChanges(): PendingChange[] {
    return [...this.pendingChanges.values()];
  }

  /**
   * Clear a specific change
   */
  async clearChange(changeId: string): Promise<void> {
    this.pendingChanges.delete(changeId);
    await this.savePendingChanges();
    this.updateState({
      pendingChangesCount: this.pendingChanges.size,
    });
  }

  /**
   * Clear all pending changes
   */
  async clearAllChanges(): Promise<void> {
    this.pendingChanges.clear();
    await this.savePendingChanges();
    this.updateState({
      pendingChangesCount: 0,
      syncStatus: 'synced',
    });
  }

  /**
   * Trigger a sync
   */
  async triggerSync(): Promise<SyncResult> {
    if (!this.isOnline()) {
      return {
        success: false,
        syncedChanges: 0,
        failedChanges: this.pendingChanges.size,
        conflicts: [],
        timestamp: new Date(),
      };
    }

    if (this.state.syncStatus === 'syncing') {
      // Already syncing
      return {
        success: true,
        syncedChanges: 0,
        failedChanges: 0,
        conflicts: [],
        timestamp: new Date(),
      };
    }

    this.updateState({ syncStatus: 'syncing' });

    const result: SyncResult = {
      success: true,
      syncedChanges: 0,
      failedChanges: 0,
      conflicts: [],
      timestamp: new Date(),
    };

    // Process each pending change
    const changes = [...this.pendingChanges.values()];

    for (const change of changes) {
      try {
        // In a real implementation, this would call the API
        // For now, we simulate a successful sync
        await this.syncChange(change);

        // Remove from pending
        this.pendingChanges.delete(change.id);
        result.syncedChanges++;

        if (this.config.debug) {
          console.log('[Offline] Change synced:', change.id);
        }
      } catch (error) {
        change.retryCount++;
        change.lastError =
          error instanceof Error ? error.message : 'Sync failed';

        if (change.retryCount >= this.config.maxRetries) {
          // Move to failed state, but keep for manual retry
          result.failedChanges++;
        }

        result.success = false;
      }
    }

    await this.savePendingChanges();

    const newSyncStatus =
      this.pendingChanges.size === 0
        ? 'synced'
        : result.failedChanges > 0
          ? 'error'
          : 'pending';

    this.updateState({
      syncStatus: newSyncStatus,
      pendingChangesCount: this.pendingChanges.size,
      lastSyncTime: new Date(),
    });

    if (this.config.debug) {
      console.log('[Offline] Sync complete:', result);
    }

    return result;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get offline-specific encouragement message
   */
  getOfflineEncouragement(): string {
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
  }

  // Private methods

  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = (): void => {
    if (this.config.debug) {
      console.log('[Offline] Network online');
    }

    this.updateState({
      connectionStatus: 'reconnecting',
      lastOnlineTime: new Date(),
    });

    // Trigger sync after coming back online
    setTimeout(() => {
      this.triggerSync().then(() => {
        this.updateState({ connectionStatus: 'online' });
      });
    }, 1000);
  };

  private handleOffline = (): void => {
    if (this.config.debug) {
      console.log('[Offline] Network offline');
    }

    this.updateState({
      connectionStatus: 'offline',
    });
  };

  private async checkConnection(): Promise<void> {
    if (typeof navigator === 'undefined') {
      this.updateState({ connectionStatus: 'online' });
      return;
    }

    const online = navigator.onLine;
    this.updateState({
      connectionStatus: online ? 'online' : 'offline',
      lastOnlineTime: online ? new Date() : this.state.lastOnlineTime,
    });
  }

  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline() && this.pendingChanges.size > 0) {
        this.triggerSync();
      }
    }, this.config.syncIntervalMs);
  }

  private async syncChange(_change: PendingChange): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In a real implementation, this would make an API call
    // For now, we just simulate success
    if (Math.random() < 0.95) {
      // 95% success rate for simulation
      return;
    }

    throw new Error('Simulated sync failure');
  }

  private async loadPendingChanges(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const stored = await this.storageAdapter.get(
        `${this.config.storageKey}_pending`
      );
      if (stored) {
        const changes = JSON.parse(stored) as PendingChange[];
        changes.forEach((c) => {
          c.timestamp = new Date(c.timestamp);
          this.pendingChanges.set(c.id, c);
        });
      }
    } catch {
      // Ignore load errors
    }
  }

  private async savePendingChanges(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const changes = [...this.pendingChanges.values()];
      await this.storageAdapter.set(
        `${this.config.storageKey}_pending`,
        JSON.stringify(changes)
      );
    } catch {
      // Ignore save errors
    }
  }

  private updateState(updates: Partial<OfflineState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }
}

// ============================================================================
// OFFLINE DATA WRAPPER
// ============================================================================

/**
 * Wrapper for making data operations offline-capable
 */
export class OfflineDataWrapper<T extends { id: string }> {
  private offlineService: OfflineService;
  private entityType: PendingChange['entity'];
  private localCache: Map<string, T> = new Map();
  private storageKey: string;
  private storageAdapter: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  } | null = null;

  constructor(
    offlineService: OfflineService,
    entityType: PendingChange['entity'],
    storageKey: string
  ) {
    this.offlineService = offlineService;
    this.entityType = entityType;
    this.storageKey = storageKey;
  }

  /**
   * Initialize with storage adapter
   */
  async initialize(storageAdapter: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  }): Promise<void> {
    this.storageAdapter = storageAdapter;
    await this.loadCache();
  }

  /**
   * Get an item
   */
  get(id: string): T | undefined {
    return this.localCache.get(id);
  }

  /**
   * Get all items
   */
  getAll(): T[] {
    return [...this.localCache.values()];
  }

  /**
   * Create an item (offline-safe)
   */
  async create(data: T): Promise<T> {
    // Save locally first
    this.localCache.set(data.id, data);
    await this.saveCache();

    // Queue for sync
    await this.offlineService.queueChange({
      type: 'create',
      entity: this.entityType,
      entityId: data.id,
      data: data as unknown as Record<string, unknown>,
    });

    return data;
  }

  /**
   * Update an item (offline-safe)
   */
  async update(id: string, updates: Partial<T>): Promise<T | undefined> {
    const existing = this.localCache.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.localCache.set(id, updated);
    await this.saveCache();

    // Queue for sync
    await this.offlineService.queueChange({
      type: 'update',
      entity: this.entityType,
      entityId: id,
      data: updates as Record<string, unknown>,
    });

    return updated;
  }

  /**
   * Delete an item (offline-safe)
   */
  async delete(id: string): Promise<boolean> {
    const existed = this.localCache.has(id);
    if (!existed) return false;

    this.localCache.delete(id);
    await this.saveCache();

    // Queue for sync
    await this.offlineService.queueChange({
      type: 'delete',
      entity: this.entityType,
      entityId: id,
      data: {},
    });

    return true;
  }

  /**
   * Refresh from remote (when online)
   */
  async refreshFromRemote(items: T[]): Promise<void> {
    this.localCache.clear();
    items.forEach((item) => this.localCache.set(item.id, item));
    await this.saveCache();
  }

  private async loadCache(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const stored = await this.storageAdapter.get(this.storageKey);
      if (stored) {
        const items = JSON.parse(stored) as T[];
        items.forEach((item) => this.localCache.set(item.id, item));
      }
    } catch {
      // Ignore load errors
    }
  }

  private async saveCache(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const items = [...this.localCache.values()];
      await this.storageAdapter.set(this.storageKey, JSON.stringify(items));
    } catch {
      // Ignore save errors
    }
  }
}

// Classes are already exported with 'export class' declarations above
