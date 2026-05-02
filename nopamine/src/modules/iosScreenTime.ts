import {NativeModules, Platform} from 'react-native';

const {NopamineModule} = NativeModules;

const isSupported = Platform.OS === 'ios' && !!NopamineModule;

export async function requestiOSAuthorization(): Promise<boolean> {
  if (!isSupported) return false;
  return NopamineModule.requestAuthorization();
}

export async function startIOSMonitoring(
  allowedMinutes: number,
  bundleIds: string[],
): Promise<boolean> {
  if (!isSupported) return false;
  return NopamineModule.startMonitoring(allowedMinutes, bundleIds);
}

export async function stopIOSMonitoring(): Promise<boolean> {
  if (!isSupported) return false;
  return NopamineModule.stopMonitoring();
}

export async function applyIOSShield(): Promise<boolean> {
  if (!isSupported) return false;
  return NopamineModule.applyShield();
}

export async function removeIOSShield(): Promise<boolean> {
  if (!isSupported) return false;
  return NopamineModule.removeShield();
}
