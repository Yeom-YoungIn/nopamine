import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimerState {
  allowedMinutes: number;
  cooldownMinutes: number;
  usedMinutes: number;
  isBlocked: boolean;
  cooldownUntil: number | null;
  lastResetDate: string;

  setAllowedMinutes: (minutes: number) => void;
  setCooldownMinutes: (minutes: number) => void;
  addUsedMinutes: (minutes: number) => void;
  triggerBlock: () => void;
  clearBlock: () => void;
  resetIfNewDay: () => void;
  loadFromStorage: () => Promise<void>;
}

const STORAGE_KEY = '@nopamine:timer';

const todayString = () => new Date().toISOString().slice(0, 10);

export const useTimerStore = create<TimerState>((set, get) => ({
  allowedMinutes: 30,
  cooldownMinutes: 30,
  usedMinutes: 0,
  isBlocked: false,
  cooldownUntil: null,
  lastResetDate: todayString(),

  setAllowedMinutes: minutes => {
    set({allowedMinutes: minutes});
    AsyncStorage.mergeItem(STORAGE_KEY, JSON.stringify({allowedMinutes: minutes}));
  },

  setCooldownMinutes: minutes => {
    set({cooldownMinutes: minutes});
    AsyncStorage.mergeItem(STORAGE_KEY, JSON.stringify({cooldownMinutes: minutes}));
  },

  addUsedMinutes: minutes => {
    const next = get().usedMinutes + minutes;
    set({usedMinutes: next});
    AsyncStorage.mergeItem(STORAGE_KEY, JSON.stringify({usedMinutes: next}));
  },

  triggerBlock: () => {
    const cooldownUntil = Date.now() + get().cooldownMinutes * 60 * 1000;
    set({isBlocked: true, cooldownUntil});
    AsyncStorage.mergeItem(STORAGE_KEY, JSON.stringify({isBlocked: true, cooldownUntil}));
  },

  clearBlock: () => {
    set({isBlocked: false, cooldownUntil: null});
    AsyncStorage.mergeItem(STORAGE_KEY, JSON.stringify({isBlocked: false, cooldownUntil: null}));
  },

  resetIfNewDay: () => {
    const today = todayString();
    if (get().lastResetDate !== today) {
      set({usedMinutes: 0, isBlocked: false, cooldownUntil: null, lastResetDate: today});
      AsyncStorage.mergeItem(
        STORAGE_KEY,
        JSON.stringify({usedMinutes: 0, isBlocked: false, cooldownUntil: null, lastResetDate: today}),
      );
    }
  },

  loadFromStorage: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    const today = todayString();
    if (saved.lastResetDate !== today) {
      saved.usedMinutes = 0;
      saved.isBlocked = false;
      saved.cooldownUntil = null;
      saved.lastResetDate = today;
    }
    if (saved.cooldownUntil && Date.now() > saved.cooldownUntil) {
      saved.isBlocked = false;
      saved.cooldownUntil = null;
    }
    set(saved);
  },
}));
