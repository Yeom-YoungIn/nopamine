import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TARGET_APPS, TargetApp} from '@constants/apps';

interface AppState {
  isEnabled: boolean;
  enabledAppIds: string[];
  getEnabledApps: () => TargetApp[];
  toggleApp: (id: string) => void;
  setEnabled: (v: boolean) => void;
  loadFromStorage: () => Promise<void>;
}

const STORAGE_KEY = '@nopamine:apps';
const ENABLED_KEY = '@nopamine:enabled';

export const useAppStore = create<AppState>((set, get) => ({
  isEnabled: true,
  enabledAppIds: ['youtube', 'instagram'],

  getEnabledApps: () => TARGET_APPS.filter(a => get().enabledAppIds.includes(a.id)),

  toggleApp: id => {
    const current = get().enabledAppIds;
    const next = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    set({enabledAppIds: next});
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  setEnabled: v => {
    set({isEnabled: v});
    AsyncStorage.setItem(ENABLED_KEY, JSON.stringify(v));
  },

  loadFromStorage: async () => {
    const [appsRaw, enabledRaw] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(ENABLED_KEY),
    ]);
    if (appsRaw) set({enabledAppIds: JSON.parse(appsRaw)});
    if (enabledRaw !== null) set({isEnabled: JSON.parse(enabledRaw)});
  },
}));
