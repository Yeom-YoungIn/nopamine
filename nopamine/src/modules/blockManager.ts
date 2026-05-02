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
  // SharedPreferences 직접 쓰기는 NativeModule 통해 처리
  if (UsageStatsModule?.syncBlockState) {
    UsageStatsModule.syncBlockState(isBlocked, cooldownUntil ?? 0);
  }
}
