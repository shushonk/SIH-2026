import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const OfflineContext = createContext();

export function OfflineProvider({ children }) {
  const [isOffline, setIsOffline] = useState(false);
  const [queue, setQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('krishi_offline_queue');
      if (saved) {
        setQueue(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveQueue = (newQueue) => {
    setQueue(newQueue);
    try {
      localStorage.setItem('krishi_offline_queue', JSON.stringify(newQueue));
    } catch (e) {
      console.error(e);
    }
  };

  const queueScan = (scanData) => {
    const item = {
      id: 'queue_' + Date.now(),
      data: scanData,
      queuedAt: new Date().toISOString(),
      status: 'pending'
    };
    const updated = [item, ...queue];
    saveQueue(updated);
    return item;
  };

  const syncQueue = async () => {
    if (queue.length === 0) return;
    setIsSyncing(true);
    let successCount = 0;
    const remaining = [];

    for (const item of queue) {
      try {
        await api.submitObservation({
          ...item.data,
          sync_status: 'synced'
        });
        successCount++;
      } catch (err) {
        remaining.push(item);
      }
    }

    saveQueue(remaining);
    setIsSyncing(false);
    return successCount;
  };

  const clearQueue = () => {
    saveQueue([]);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOffline,
        setIsOffline,
        queue,
        queueScan,
        syncQueue,
        clearQueue,
        isSyncing,
        showSyncModal,
        setShowSyncModal
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}
