import {NativeModules, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {UsageStatsModule} = NativeModules;

const PREFS_KEY = '@nopamine:block';

/**
 * 차단 상태를 Android SharedPreferences에 동기화.
 * AccessibilityService가 JS 없이도 차단 여부를 읽을 수 있도록 네이티브에 저장.
 */
export function syncIsEnabledToNative(isEnabled: boolean) {
  if (Platform.OS !== 'android') return;
  if (UsageStatsModule?.syncIsEnabled) {
    UsageStatsModule.syncIsEnabled(isEnabled);
  }
}

export function syncTrackingConfigToNative(
  allowedMinutes: number,
  cooldownMinutes: number,
  enabledPackages: string[],
) {
  if (Platform.OS !== 'android') return;
  if (UsageStatsModule?.syncTrackingConfig) {
    UsageStatsModule.syncTrackingConfig(allowedMinutes, cooldownMinutes, enabledPackages);
  }
}

export interface NativeDebugState {
  isEnabled: boolean;
  isBlocked: boolean;
  cooldownUntil: number;
  allowedMinutes: number;
  cooldownMinutes: number;
  usedSeconds: number;
  remainingSeconds: number;
  remainingMinutes: number;
  currentForegroundPackage: string | null;
  enabledPackages: string[];
}

export async function getNativeDebugState(): Promise<NativeDebugState | null> {
  if (Platform.OS !== 'android') return null;
  if (!UsageStatsModule?.getDebugState) return null;
  return UsageStatsModule.getDebugState();
}

export function resetNativeUsageProgress() {
  if (Platform.OS !== 'android') return;
  if (UsageStatsModule?.resetUsageProgress) {
    UsageStatsModule.resetUsageProgress();
  }
}

export async function syncBlockStateToNative(isBlocked: boolean, cooldownUntil: number | null) {
  if (Platform.OS !== 'android') return;
  await AsyncStorage.setItem(
    PREFS_KEY,
    JSON.stringify({isBlocked, cooldownUntil: cooldownUntil ?? 0}),
  );
  if (UsageStatsModule?.syncBlockState) {
    UsageStatsModule.syncBlockState(isBlocked, cooldownUntil ?? 0);
  }
}

/**
 * 위젯 표시 데이터를 SharedPreferences에 저장 후 위젯 강제 갱신.
 */
export function syncWidgetData(
  remainingMinutes: number,
  allowedMinutes: number,
  isBlocked: boolean,
  cooldownUntil: number | null,
) {
  if (Platform.OS !== 'android') return;
  if (UsageStatsModule?.syncWidgetData) {
    UsageStatsModule.syncWidgetData(
      remainingMinutes,
      allowedMinutes,
      isBlocked,
      cooldownUntil ?? 0,
    );
  }
}
