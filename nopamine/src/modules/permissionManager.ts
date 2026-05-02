import {NativeModules, Platform} from 'react-native';

const {UsageStatsModule} = NativeModules;

export interface PermissionStatus {
  usage: boolean;
  overlay: boolean;
  accessibility: boolean;
}

export async function checkAllPermissions(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android') {
    return {usage: true, overlay: true, accessibility: true};
  }
  const [usage, overlay, accessibility] = await Promise.all([
    UsageStatsModule.hasUsagePermission(),
    UsageStatsModule.hasOverlayPermission(),
    UsageStatsModule.hasAccessibilityPermission(),
  ]);
  return {usage, overlay, accessibility};
}

export function openUsageSettings() {
  UsageStatsModule.openUsageSettings();
}

export function openOverlaySettings() {
  UsageStatsModule.openOverlaySettings();
}

export function openAccessibilitySettings() {
  UsageStatsModule.openAccessibilitySettings();
}

export async function getUsageMinutesToday(packageName: string): Promise<number> {
  if (Platform.OS !== 'android') return 0;
  return UsageStatsModule.getUsageMinutesToday(packageName);
}
