import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { offlineQueue } from '../../services/OfflineQueue';
import { useLanguage } from '../../i18n/LanguageContext';

export const OfflineBanner = () => {
  const { t } = useLanguage();
  const [state, setState] = useState({
    isOffline: false,
    count: 0,
    isSyncing: false,
  });
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe((info) => {
      setState((prev) => ({
        ...prev,
        isOffline: info.isOffline,
        count: info.count,
      }));

      if (info.syncEvent?.type === 'synced_success') {
        showToast(t('synced_toast'));
      }
    });

    return () => unsubscribe();
  }, [t]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleManualSync = async () => {
    setState((prev) => ({ ...prev, isSyncing: true }));
    await offlineQueue.syncAllQueued();
    setState((prev) => ({ ...prev, isSyncing: false }));
  };

  if (toastMsg) {
    return (
      <View style={[styles.banner, styles.toastBanner]}>
        <Text style={styles.toastIcon}>✓</Text>
        <Text style={styles.toastText}>{toastMsg}</Text>
      </View>
    );
  }

  if (!state.isOffline && state.count === 0) {
    return null;
  }

  return (
    <View style={[styles.banner, styles.offlineBanner]}>
      <View style={styles.leftRow}>
        <View style={styles.warningDot} />
        <Text style={styles.offlineText}>
          {state.isOffline
            ? t('offline_banner', { count: state.count })
            : `${state.count} scan(s) waiting to sync`}
        </Text>
      </View>

      {state.count > 0 && !state.isOffline ? (
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleManualSync}
          disabled={state.isSyncing}
        >
          {state.isSyncing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.syncBtnText}>Sync Now</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 999,
  },
  offlineBanner: {
    backgroundColor: '#fffbeb',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  toastBanner: {
    backgroundColor: '#ecfdf5',
    borderBottomWidth: 1,
    borderBottomColor: '#a7f3d0',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  warningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d97706',
    marginRight: 8,
  },
  offlineText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#92400e',
    flex: 1,
  },
  toastIcon: {
    color: '#059669',
    fontWeight: '800',
    marginRight: 8,
    fontSize: 14,
  },
  toastText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#065f46',
  },
  syncBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
