import {NativeModules, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {UsageStatsModule} = NativeModules;

const PREFS_KEY = '@nopamine:block';

/**
 * 차단 상태를 Android SharedPreferences에 동기화.
 * AccessibilityService가 JS 없이도 차단 여부를 읽을 수 있도록 네이티브에 저장.
 */
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
