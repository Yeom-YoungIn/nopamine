import {useEffect, useRef} from 'react';
import {AppState, Platform} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {getUsageMinutesToday} from '@modules/permissionManager';
import {syncBlockStateToNative} from '@modules/blockManager';

/**
 * 앱이 포그라운드로 돌아올 때마다 UsageStats를 조회해 누적 사용 시간을 갱신.
 * 허용 시간 초과 시 차단 발동 + 네이티브 동기화.
 */
export function useUsageTracker() {
  const {allowedMinutes, usedMinutes, isBlocked, cooldownUntil, triggerBlock, clearBlock, addUsedMinutes, resetIfNewDay} =
    useTimerStore();
  const {getEnabledApps} = useAppStore();
  const lastSyncRef = useRef(0);

  const syncUsage = async () => {
    if (Platform.OS !== 'android') return;

    resetIfNewDay();

    // 쿨다운 만료 체크
    if (isBlocked && cooldownUntil && Date.now() > cooldownUntil) {
      clearBlock();
      await syncBlockStateToNative(false, null);
      return;
    }

    if (isBlocked) return;

    // 30초마다 UsageStats 조회 (배터리 절약)
    if (Date.now() - lastSyncRef.current < 30_000) return;
    lastSyncRef.current = Date.now();

    const apps = getEnabledApps();
    let totalMinutes = 0;
    for (const app of apps) {
      try {
        const mins = await getUsageMinutesToday(app.androidPackage);
        totalMinutes += mins;
      } catch {
        // 권한 없는 경우 skip
      }
    }

    const store = useTimerStore.getState();
    if (totalMinutes > store.usedMinutes) {
      const diff = totalMinutes - store.usedMinutes;
      addUsedMinutes(diff);
    }

    if (useTimerStore.getState().usedMinutes >= allowedMinutes) {
      triggerBlock();
      await syncBlockStateToNative(true, useTimerStore.getState().cooldownUntil);
    }
  };

  useEffect(() => {
    syncUsage();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') syncUsage();
    });
    const interval = setInterval(syncUsage, 30_000);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
