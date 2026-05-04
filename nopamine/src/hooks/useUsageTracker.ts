import {useEffect, useRef} from 'react';
import {AppState, Platform} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {getUsageMinutesToday} from '@modules/permissionManager';
import {
  getNativeDebugState,
  syncBlockStateToNative,
  syncIsEnabledToNative,
  syncTrackingConfigToNative,
  syncWidgetData,
} from '@modules/blockManager';
import {
  startIOSMonitoring,
  stopIOSMonitoring,
  applyIOSShield,
  removeIOSShield,
  syncIOSWidgetData,
} from '@modules/iosScreenTime';
import {sendWarningNotification, sendBlockedNotification} from '@modules/notificationManager';

const WARNING_MINUTES = 5;

export function useUsageTracker() {
  const {
    getTodayAllowedMinutes,
    usedMinutes,
    isBlocked,
    cooldownUntil,
    cooldownMinutes,
    warningFired,
    triggerBlock,
    clearBlock,
    addUsedMinutes,
    resetIfNewDay,
    setWarningFired,
  } = useTimerStore();
  const {getEnabledApps, isEnabled} = useAppStore();
  const lastSyncRef = useRef(0);
  const iosStartedRef = useRef(false);
  const todayAllowedMinutes = getTodayAllowedMinutes();
  const enabledPackages = getEnabledApps().map(app => app.androidPackage);

  const syncAndroid = async () => {
    if (!isEnabled) return;
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

    let totalMinutes = 0;
    const nativeDebug = await getNativeDebugState();

    if (nativeDebug) {
      totalMinutes = Math.floor(nativeDebug.usedSeconds / 60);
    } else {
      const apps = getEnabledApps();
      for (const app of apps) {
        try {
          totalMinutes += await getUsageMinutesToday(app.androidPackage);
        } catch {
          // 권한 미허용 시 skip
        }
      }
    }

    const store = useTimerStore.getState();
    if (totalMinutes > store.usedMinutes) {
      addUsedMinutes(totalMinutes - store.usedMinutes);
    }

    const current = useTimerStore.getState();

    const remaining = todayAllowed - current.usedMinutes;
    if (!current.warningFired && remaining <= WARNING_MINUTES && remaining > 0) {
      setWarningFired();
      await sendWarningNotification(remaining);
    }

    if (current.usedMinutes >= todayAllowed) {
      triggerBlock();
      const finalState = useTimerStore.getState();
      await syncBlockStateToNative(true, finalState.cooldownUntil);
      syncWidgetData(0, todayAllowed, true, finalState.cooldownUntil);
      await sendBlockedNotification();
    } else {
      const finalState = useTimerStore.getState();
      syncWidgetData(Math.max(0, todayAllowed - finalState.usedMinutes), todayAllowed, false, null);
    }
  };

  const syncIOS = async () => {
    if (!isEnabled) return;
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
      const finalState = useTimerStore.getState();
      await applyIOSShield();
      await syncIOSWidgetData(0, todayAllowed, true, finalState.cooldownUntil);
      await sendBlockedNotification();
    } else {
      await syncIOSWidgetData(Math.max(0, todayAllowed - usedMinutes), todayAllowed, false, null);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      syncIsEnabledToNative(isEnabled);
      syncTrackingConfigToNative(todayAllowedMinutes, cooldownMinutes, enabledPackages);
    }
  }, [cooldownMinutes, enabledPackages, isEnabled, todayAllowedMinutes]);

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
