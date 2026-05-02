import {useEffect, useRef} from 'react';
import {AppState, Platform} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {getUsageMinutesToday} from '@modules/permissionManager';
import {syncBlockStateToNative} from '@modules/blockManager';
import {startIOSMonitoring, stopIOSMonitoring, applyIOSShield, removeIOSShield} from '@modules/iosScreenTime';

export function useUsageTracker() {
  const {
    allowedMinutes, usedMinutes, isBlocked, cooldownUntil,
    triggerBlock, clearBlock, addUsedMinutes, resetIfNewDay,
  } = useTimerStore();
  const {getEnabledApps} = useAppStore();
  const lastSyncRef = useRef(0);
  const iosStartedRef = useRef(false);

  const syncAndroid = async () => {
    resetIfNewDay();

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

    if (useTimerStore.getState().usedMinutes >= allowedMinutes) {
      triggerBlock();
      await syncBlockStateToNative(true, useTimerStore.getState().cooldownUntil);
    }
  };

  const syncIOS = async () => {
    resetIfNewDay();

    if (isBlocked && cooldownUntil && Date.now() > cooldownUntil) {
      clearBlock();
      await removeIOSShield();
      return;
    }

    if (!iosStartedRef.current) {
      const apps = getEnabledApps();
      const bundleIds = apps.map(a => a.iosBundleId);
      await startIOSMonitoring(allowedMinutes, bundleIds);
      iosStartedRef.current = true;
    }

    if (usedMinutes >= allowedMinutes && !isBlocked) {
      triggerBlock();
      await applyIOSShield();
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
