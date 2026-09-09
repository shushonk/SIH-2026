// Offline Queue and Automatic Sync Manager (Requirement 2)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const QUEUE_STORAGE_KEY = '@krishiraksha_offline_scans_queue';
const OFFLINE_MODE_OVERRIDE_KEY = '@krishiraksha_force_offline';

class OfflineQueueManager {
  constructor() {
    this.listeners = [];
    this.isOffline = false;
    this.queuedScans = [];
    this.isSyncing = false;
    this.init();
  }

  async init() {
    await this.loadQueue();
    // Start periodic background connectivity check
    this.startConnectivityMonitor();
  }

  async loadQueue() {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      this.queuedScans = data ? JSON.parse(data) : [];
      this.notifyListeners();
    } catch (e) {
      console.warn('Failed to load offline queue:', e);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback({ isOffline: this.isOffline, count: this.queuedScans.length, queue: this.queuedScans });
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notifyListeners(syncEvent = null) {
    this.listeners.forEach((cb) => {
      try {
        cb({
          isOffline: this.isOffline,
          count: this.queuedScans.length,
          queue: this.queuedScans,
          syncEvent,
        });
      } catch (e) {}
    });
  }

  async enqueueScan(scanPayload) {
    const queueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      payload: scanPayload,
      status: 'queued',
    };

    this.queuedScans.push(queueItem);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queuedScans));
    this.notifyListeners({ type: 'enqueued', item: queueItem });
    return queueItem;
  }

  async removeQueuedScan(id) {
    this.queuedScans = this.queuedScans.filter((item) => item.id !== id);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queuedScans));
    this.notifyListeners({ type: 'removed', id });
  }

  async clearQueue() {
    this.queuedScans = [];
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    this.notifyListeners({ type: 'cleared' });
  }

  startConnectivityMonitor() {
    // Check heartbeat against backend every 10 seconds
    setInterval(async () => {
      await this.checkConnectivity();
    }, 10000);
    // Initial check
    this.checkConnectivity();
  }

  async checkConnectivity() {
    try {
      // Check if user manually forced offline in settings
      const forceOffline = await AsyncStorage.getItem(OFFLINE_MODE_OVERRIDE_KEY);
      if (forceOffline === 'true') {
        if (!this.isOffline) {
          this.isOffline = true;
          this.notifyListeners({ type: 'offline' });
        }
        return false;
      }

      // Heartbeat ping
      await api.get('/model-info');
      const wasOffline = this.isOffline;
      this.isOffline = false;

      if (wasOffline) {
        this.notifyListeners({ type: 'reconnected' });
        // Automatically sync queued items when reconnected
        if (this.queuedScans.length > 0) {
          this.syncAllQueued();
        }
      }
      return true;
    } catch (e) {
      if (!this.isOffline) {
        this.isOffline = true;
        this.notifyListeners({ type: 'offline' });
      }
      return false;
    }
  }

  async toggleManualOffline(force) {
    await AsyncStorage.setItem(OFFLINE_MODE_OVERRIDE_KEY, force ? 'true' : 'false');
    this.isOffline = force;
    this.notifyListeners({ type: force ? 'offline' : 'online' });
    if (!force) {
      this.checkConnectivity();
    }
  }

  async syncAllQueued() {
    if (this.isSyncing || this.queuedScans.length === 0 || this.isOffline) return;
    this.isSyncing = true;
    this.notifyListeners({ type: 'sync_start' });

    const itemsToSync = [...this.queuedScans];
    let syncedCount = 0;

    for (const item of itemsToSync) {
      try {
        await api.post('/observations', item.payload);
        await this.removeQueuedScan(item.id);
        syncedCount++;
      } catch (e) {
        console.warn(`Sync failed for scan ${item.id}:`, e);
      }
    }

    this.isSyncing = false;
    if (syncedCount > 0) {
      this.notifyListeners({ type: 'synced_success', count: syncedCount });
    }
  }
}

export const offlineQueue = new OfflineQueueManager();
