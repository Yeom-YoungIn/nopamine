import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useStatsStore} from '@store/statsStore';
import {useTimerStore} from '@store/timerStore';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function StatsScreen() {
  const {getLast7Days, streak, loadFromStorage} = useStatsStore();
  const {usedMinutes, allowedMinutes} = useTimerStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const week = getLast7Days();
  const maxMinutes = Math.max(...week.map(d => d.usedMinutes), 1);
  const todayPercent = Math.min(100, Math.round((usedMinutes / allowedMinutes) * 100));
  const weekGoalDays = week.filter(d => d.goalMet).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>통계 📊</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{todayPercent}%</Text>
          <Text style={styles.summaryLabel}>오늘 사용률</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, styles.summaryValueGreen]}>{weekGoalDays}/7</Text>
          <Text style={styles.summaryLabel}>이번 주 목표</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, styles.summaryValueOrange]}>🔥{streak}</Text>
          <Text style={styles.summaryLabel}>연속 달성</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>최근 7일 사용량</Text>
        <View style={styles.barChart}>
          {week.map((day, i) => {
            const barHeight = Math.max(4, Math.round((day.usedMinutes / maxMinutes) * 100));
            const isGoalMet = day.goalMet;
            const label = DAY_LABELS[new Date(day.date + 'T00:00:00').getDay()];
            const isToday = i === 6;
            return (
              <View key={day.date} style={styles.barCol}>
                <Text style={styles.barMinutes}>
                  {day.usedMinutes > 0 ? `${day.usedMinutes}` : ''}
                </Text>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {height: barHeight},
                      isGoalMet ? styles.barGood : day.usedMinutes > 0 ? styles.barBad : styles.barEmpty,
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>{label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>오늘 사용 현황</Text>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              {width: `${todayPercent}%` as `${number}%`},
              todayPercent >= 100 && styles.progressOver,
            ]}
          />
        </View>
        <View style={styles.progressDetailRow}>
          <Text style={styles.progressDetail}>{usedMinutes}분 사용</Text>
          <Text style={styles.progressDetail}>{allowedMinutes}분 허용</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F6F4FF'},
  content: {padding: 24, paddingBottom: 40},
  title: {fontSize: 28, fontWeight: '800', color: '#1F0A3A', marginBottom: 20},
  summaryRow: {flexDirection: 'row', gap: 10, marginBottom: 16},
  summaryCard: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 18, padding: 16, alignItems: 'center',
    elevation: 1,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8,
  },
  summaryValue: {fontSize: 22, fontWeight: '800', color: '#7C3AED', marginBottom: 6},
  summaryValueGreen: {color: '#10B981'},
  summaryValueOrange: {color: '#F97316'},
  summaryLabel: {fontSize: 11, color: '#9CA3AF', textAlign: 'center', fontWeight: '600'},
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16,
    elevation: 1,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8,
  },
  cardLabel: {fontSize: 13, color: '#9CA3AF', marginBottom: 18, fontWeight: '600'},
  barChart: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140},
  barCol: {alignItems: 'center', flex: 1},
  barMinutes: {fontSize: 9, color: '#D1D5DB', marginBottom: 4, height: 12},
  barWrapper: {height: 100, justifyContent: 'flex-end'},
  bar: {width: 22, borderRadius: 6},
  barGood: {backgroundColor: '#7C3AED'},
  barBad: {backgroundColor: '#F43F5E'},
  barEmpty: {backgroundColor: '#F3F0FF'},
  barLabel: {fontSize: 12, color: '#D1D5DB', marginTop: 8},
  barLabelToday: {color: '#7C3AED', fontWeight: '800'},
  progressBg: {
    height: 12, backgroundColor: '#F3F0FF', borderRadius: 8,
    overflow: 'hidden', marginBottom: 10,
  },
  progressFill: {height: '100%', backgroundColor: '#7C3AED', borderRadius: 8},
  progressOver: {backgroundColor: '#F43F5E'},
  progressDetailRow: {flexDirection: 'row', justifyContent: 'space-between'},
  progressDetail: {fontSize: 13, color: '#9CA3AF'},
});
