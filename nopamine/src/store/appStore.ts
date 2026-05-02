import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TARGET_APPS, TargetApp} from '@constants/apps';

interface AppState {
  enabledAppIds: string[];
  getEnabledApps: () => TargetApp[];
  toggleApp: (id: string) => void;
  loadFromStorage: () => Promise<void>;
}

const STORAGE_KEY = '@nopamine:apps';

export const useAppStore = create<AppState>((set, get) => ({
  enabledAppIds: ['youtube', 'instagram'],

  getEnabledApps: () => TARGET_APPS.filter(a => get().enabledAppIds.includes(a.id)),

  toggleApp: id => {
    const current = get().enabledAppIds;
    const next = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    set({enabledAppIds: next});
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  loadFromStorage: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) set({enabledAppIds: JSON.parse(raw)});
  },
}));
