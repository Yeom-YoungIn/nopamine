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
      <Text style={styles.title}>통계</Text>

      {/* 요약 카드 */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{todayPercent}%</Text>
          <Text style={styles.summaryLabel}>오늘 사용률</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{weekGoalDays}/7</Text>
          <Text style={styles.summaryLabel}>이번 주 목표</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, {color: '#f97316'}]}>🔥{streak}</Text>
          <Text style={styles.summaryLabel}>연속 달성</Text>
        </View>
      </View>

      {/* 주간 막대 그래프 */}
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

      {/* 오늘 상세 */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>오늘</Text>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              {width: `${todayPercent}%` as `${number}%`},
              todayPercent >= 100 && styles.progressOver,
            ]}
          />
        </View>
        <Text style={styles.progressDetail}>
          {usedMinutes}분 사용 / {allowedMinutes}분 허용
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f0f0f'},
  content: {padding: 24, paddingBottom: 40},
  title: {fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 20},
  summaryRow: {flexDirection: 'row', gap: 10, marginBottom: 16},
  summaryCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: {fontSize: 22, fontWeight: '800', color: '#4ade80', marginBottom: 4},
  summaryLabel: {fontSize: 11, color: '#555', textAlign: 'center'},
  card: {backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 16},
  cardLabel: {fontSize: 13, color: '#666', marginBottom: 16},
  barChart: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140},
  barCol: {alignItems: 'center', flex: 1},
  barMinutes: {fontSize: 9, color: '#555', marginBottom: 4, height: 12},
  barWrapper: {height: 100, justifyContent: 'flex-end'},
  bar: {width: 24, borderRadius: 4},
  barGood: {backgroundColor: '#4ade80'},
  barBad: {backgroundColor: '#f87171'},
  barEmpty: {backgroundColor: '#2a2a2a'},
  barLabel: {fontSize: 12, color: '#555', marginTop: 6},
  barLabelToday: {color: '#fff', fontWeight: '700'},
  progressBg: {height: 10, backgroundColor: '#2a2a2a', borderRadius: 5, overflow: 'hidden', marginBottom: 8},
  progressFill: {height: '100%', backgroundColor: '#4ade80', borderRadius: 5},
  progressOver: {backgroundColor: '#f87171'},
  progressDetail: {fontSize: 13, color: '#555'},
});
