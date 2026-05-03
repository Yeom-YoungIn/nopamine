import {NativeModules, Platform} from 'react-native';

const {UsageStatsModule} = NativeModules;

const isAvailable = Platform.OS === 'android' && !!UsageStatsModule;

export interface PermissionStatus {
  usage: boolean;
  overlay: boolean;
  accessibility: boolean;
}

export async function checkAllPermissions(): Promise<PermissionStatus> {
  if (!isAvailable) return {usage: true, overlay: true, accessibility: true};
  const [usage, overlay, accessibility] = await Promise.all([
    UsageStatsModule.hasUsagePermission(),
    UsageStatsModule.hasOverlayPermission(),
    UsageStatsModule.hasAccessibilityPermission(),
  ]);
  return {usage, overlay, accessibility};
}

export function openUsageSettings() {
  if (!isAvailable) return;
  UsageStatsModule.openUsageSettings();
}

export function openOverlaySettings() {
  if (!isAvailable) return;
  UsageStatsModule.openOverlaySettings();
}

export function openAccessibilitySettings() {
  if (!isAvailable) return;
  UsageStatsModule.openAccessibilitySettings();
}

export async function getUsageMinutesToday(packageName: string): Promise<number> {
  if (!isAvailable) return 0;
  return UsageStatsModule.getUsageMinutesToday(packageName);
}
