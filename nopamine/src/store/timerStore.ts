import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DaySchedule {
  // 0=일, 1=월 ... 6=토  (null이면 기본값 allowedMinutes 사용)
  overrides: Record<number, number | null>;
}

interface TimerState {
  allowedMinutes: number;       // 기본 허용 시간
  cooldownMinutes: number;
  usedMinutes: number;
  isBlocked: boolean;
  cooldownUntil: number | null;
  lastResetDate: string;
  daySchedule: DaySchedule;
  warningFired: boolean;        // 오늘 5분 전 경고 발송 여부

  getTodayAllowedMinutes: () => number;
  setAllowedMinutes: (minutes: number) => void;
  setDayOverride: (day: number, minutes: number | null) => void;
  setCooldownMinutes: (minutes: number) => void;
  addUsedMinutes: (minutes: number) => void;
  triggerBlock: () => void;
  clearBlock: () => void;
  setWarningFired: () => void;
  resetIfNewDay: () => void;
  loadFromStorage: () => Promise<void>;
}

const STORAGE_KEY = '@nopamine:timer';

const todayString = () => new Date().toISOString().slice(0, 10);

const persistableKeys: (keyof TimerState)[] = [
  'allowedMinutes',
  'cooldownMinutes',
  'usedMinutes',
  'isBlocked',
  'cooldownUntil',
  'lastResetDate',
  'daySchedule',
  'warningFired',
];

function persist(state: TimerState) {
  const snapshot: Record<string, unknown> = {};
  for (const k of persistableKeys) {
    snapshot[k] = state[k];
  }
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export const useTimerStore = create<TimerState>((set, get) => ({
  allowedMinutes: 30,
  cooldownMinutes: 30,
  usedMinutes: 0,
  isBlocked: false,
  cooldownUntil: null,
  lastResetDate: todayString(),
  daySchedule: {overrides: {}},
  warningFired: false,

  getTodayAllowedMinutes: () => {
    const {allowedMinutes, daySchedule} = get();
    const dow = new Date().getDay();
    const override = daySchedule.overrides[dow];
    return override ?? allowedMinutes;
  },

  setAllowedMinutes: minutes => {
    set({allowedMinutes: minutes});
    persist(get());
  },

  setDayOverride: (day, minutes) => {
    const overrides = {...get().daySchedule.overrides, [day]: minutes};
    const daySchedule = {overrides};
    set({daySchedule});
    persist(get());
  },

  setCooldownMinutes: minutes => {
    set({cooldownMinutes: minutes});
    persist(get());
  },

  addUsedMinutes: minutes => {
    const next = get().usedMinutes + minutes;
    set({usedMinutes: next});
    persist(get());
  },

  triggerBlock: () => {
    const cooldownUntil = Date.now() + get().cooldownMinutes * 60 * 1000;
    set({isBlocked: true, cooldownUntil});
    persist(get());
  },

  clearBlock: () => {
    set({isBlocked: false, cooldownUntil: null});
    persist(get());
  },

  setWarningFired: () => {
    set({warningFired: true});
    persist(get());
  },

  resetIfNewDay: () => {
    const today = todayString();
    if (get().lastResetDate !== today) {
      set({usedMinutes: 0, isBlocked: false, cooldownUntil: null, lastResetDate: today, warningFired: false});
      persist(get());
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
      saved.warningFired = false;
    }
    if (saved.cooldownUntil && Date.now() > saved.cooldownUntil) {
      saved.isBlocked = false;
      saved.cooldownUntil = null;
    }
    if (!saved.daySchedule) saved.daySchedule = {overrides: {}};
    set(saved);
  },
}));
