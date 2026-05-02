import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DayRecord {
  date: string;       // "2026-05-02"
  usedMinutes: number;
  allowedMinutes: number;
  goalMet: boolean;
}

interface StatsState {
  records: DayRecord[];
  streak: number;
  recordToday: (usedMinutes: number, allowedMinutes: number) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  getLast7Days: () => DayRecord[];
}

const STORAGE_KEY = '@nopamine:stats';
const MAX_RECORDS = 90;

const todayStr = () => new Date().toISOString().slice(0, 10);

function calcStreak(records: DayRecord[]): number {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = todayStr();
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);
    const rec = sorted.find(r => r.date === expectedStr);
    if (rec?.goalMet) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  records: [],
  streak: 0,

  recordToday: async (usedMinutes, allowedMinutes) => {
    const today = todayStr();
    const existing = get().records.filter(r => r.date !== today);
    const record: DayRecord = {
      date: today,
      usedMinutes,
      allowedMinutes,
      goalMet: usedMinutes <= allowedMinutes,
    };
    const updated = [record, ...existing].slice(0, MAX_RECORDS);
    const streak = calcStreak(updated);
    set({records: updated, streak});
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({records: updated, streak}));
  },

  loadFromStorage: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    set({records: saved.records ?? [], streak: saved.streak ?? 0});
  },

  getLast7Days: () => {
    const result: DayRecord[] = [];
    const records = get().records;
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push(records.find(r => r.date === dateStr) ?? {
        date: dateStr,
        usedMinutes: 0,
        allowedMinutes: 30,
        goalMet: false,
      });
    }
    return result;
  },
}));
