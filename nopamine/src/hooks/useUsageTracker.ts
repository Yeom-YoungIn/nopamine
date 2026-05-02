import {useEffect, useRef} from 'react';
import {AppState, Platform} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {getUsageMinutesToday} from '@modules/permissionManager';
import {syncBlockStateToNative} from '@modules/blockManager';
import {startIOSMonitoring, stopIOSMonitoring, applyIOSShield, removeIOSShield} from '@modules/iosScreenTime';
import {sendWarningNotification, sendBlockedNotification} from '@modules/notificationManager';

const WARNING_MINUTES = 5;

export function useUsageTracker() {
  const {
    getTodayAllowedMinutes, usedMinutes, isBlocked, cooldownUntil,
    warningFired, triggerBlock, clearBlock, addUsedMinutes, resetIfNewDay, setWarningFired,
  } = useTimerStore();
  const {getEnabledApps} = useAppStore();
  const lastSyncRef = useRef(0);
  const iosStartedRef = useRef(false);

  const syncAndroid = async () => {
    resetIfNewDay();
    const todayAllowed = getTodayAllowedMinutes();

    if (isBlocked && cooldownUntil && Date.now() > cooldownUntil) {
      clearBlock();
      await syncBlockStateToNative(false, null);
      return;
    }
    if (isBlocked) return;
    if (Date.now() - lastSyncRef.current < 30_000) return;
    lastSyncRef.current = Date.now();

    const apps = getEnabledApps();
    let totalMinutes = 0;
    for (const app of apps) {
      try {
        totalMinutes += await getUsageMinutesToday(app.androidPackage);
      } catch {
        // 권한 미허용 시 skip
      }
    }

    const store = useTimerStore.getState();
    if (totalMinutes > store.usedMinutes) {
      addUsedMinutes(totalMinutes - store.usedMinutes);
    }

    const current = useTimerStore.getState();

    // 5분 전 경고
    const remaining = todayAllowed - current.usedMinutes;
    if (!current.warningFired && remaining <= WARNING_MINUTES && remaining > 0) {
      setWarningFired();
      await sendWarningNotification(remaining);
    }

    // 차단 발동
    if (current.usedMinutes >= todayAllowed) {
      triggerBlock();
      await syncBlockStateToNative(true, useTimerStore.getState().cooldownUntil);
      await sendBlockedNotification();
    }
  };

  const syncIOS = async () => {
    resetIfNewDay();
    const todayAllowed = getTodayAllowedMinutes();

    if (isBlocked && cooldownUntil && Date.now() > cooldownUntil) {
      clearBlock();
      await removeIOSShield();
      return;
    }

    if (!iosStartedRef.current) {
      const apps = getEnabledApps();
      const bundleIds = apps.map(a => a.iosBundleId);
      await startIOSMonitoring(todayAllowed, bundleIds);
      iosStartedRef.current = true;
    }

    const remaining = todayAllowed - usedMinutes;
    if (!warningFired && remaining <= WARNING_MINUTES && remaining > 0) {
      setWarningFired();
      await sendWarningNotification(remaining);
    }

    if (usedMinutes >= todayAllowed && !isBlocked) {
      triggerBlock();
      await applyIOSShield();
      await sendBlockedNotification();
    }
  };

  useEffect(() => {
    const sync = Platform.OS === 'android' ? syncAndroid : syncIOS;

    sync();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') sync();
    });
    const interval = setInterval(sync, 30_000);

    return () => {
      sub.remove();
      clearInterval(interval);
      if (Platform.OS === 'ios') stopIOSMonitoring();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
