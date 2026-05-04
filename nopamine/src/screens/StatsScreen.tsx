import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useStatsStore} from '@store/statsStore';
import {useTimerStore} from '@store/timerStore';
import {colors, metrics, shadows} from '@theme/ui';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function StatsScreen() {
  const {getLast7Days, streak, loadFromStorage} = useStatsStore();
  const {usedMinutes, allowedMinutes} = useTimerStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const week = getLast7Days();
  const maxMinutes = Math.max(...week.map(day => day.usedMinutes), 1);
  const todayPercent =
    allowedMinutes > 0 ? Math.min(100, Math.round((usedMinutes / allowedMinutes) * 100)) : 0;
  const weekGoalDays = week.filter(day => day.goalMet).length;
  const avgMinutes = Math.round(week.reduce((sum, day) => sum + day.usedMinutes, 0) / week.length);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>weekly snapshot</Text>
      <Text style={styles.title}>기록은 간단하게, 흐름은 선명하게</Text>
      <Text style={styles.subtitle}>핵심 숫자만 남기고 통계 구조를 단순화했습니다.</Text>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.summaryCardDark]}>
          <Text style={styles.summaryValueLight}>{todayPercent}%</Text>
          <Text style={styles.summaryLabelLight}>오늘 사용률</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{weekGoalDays}/7</Text>
          <Text style={styles.summaryLabel}>목표 달성일</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{streak}일</Text>
          <Text style={styles.summaryLabel}>연속 집중</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>최근 7일</Text>
          <Text style={styles.cardMeta}>평균 {avgMinutes}분</Text>
        </View>
        <View style={styles.chart}>
          {week.map((day, index) => {
            const barHeight = Math.max(8, Math.round((day.usedMinutes / maxMinutes) * 132));
            const label = DAY_LABELS[new Date(day.date + 'T00:00:00').getDay()];
            const isToday = index === week.length - 1;
            return (
              <View key={day.date} style={styles.barColumn}>
                <Text style={styles.barValue}>
                  {day.usedMinutes > 0 ? `${day.usedMinutes}` : ''}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {height: barHeight},
                      day.goalMet
                        ? styles.barGood
                        : day.usedMinutes > 0
                        ? styles.barAlert
                        : styles.barIdle,
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
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>오늘 현황</Text>
          <Text style={styles.cardMeta}>
            {usedMinutes} / {allowedMinutes}분
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {width: `${todayPercent}%` as `${number}%`},
              todayPercent >= 100 && styles.progressFillAlert,
            ]}
          />
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>사용</Text>
            <Text style={styles.infoValue}>{usedMinutes}분</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>허용</Text>
            <Text style={styles.infoValue}>{allowedMinutes}분</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>잔여</Text>
            <Text style={styles.infoValue}>{Math.max(0, allowedMinutes - usedMinutes)}분</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: metrics.screenPadding, paddingBottom: 40},
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentStrong,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  title: {fontSize: 32, lineHeight: 36, fontWeight: '800', color: colors.text, letterSpacing: -1},
  subtitle: {
    marginTop: 10,
    marginBottom: 22,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  summaryRow: {flexDirection: 'row', gap: 10, marginBottom: 16},
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  summaryCardDark: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  summaryValue: {fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8},
  summaryValueLight: {fontSize: 24, fontWeight: '800', color: colors.white, marginBottom: 8},
  summaryLabel: {fontSize: 12, color: colors.textMuted},
  summaryLabelLight: {fontSize: 12, color: '#FFFFFFB3'},
  card: {
    backgroundColor: colors.card,
    borderRadius: metrics.cardRadius,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardTitle: {fontSize: 18, fontWeight: '700', color: colors.text},
  cardMeta: {fontSize: 13, color: colors.textFaint},
  chart: {flexDirection: 'row', alignItems: 'flex-end', height: 170, gap: 6},
  barColumn: {flex: 1, alignItems: 'center'},
  barValue: {fontSize: 10, height: 16, color: colors.textFaint, marginBottom: 6},
  barTrack: {
    width: '100%',
    height: 132,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    paddingBottom: 6,
  },
  bar: {width: 22, borderRadius: 12},
  barGood: {backgroundColor: colors.accent},
  barAlert: {backgroundColor: colors.danger},
  barIdle: {backgroundColor: '#D8D0C4'},
  barLabel: {marginTop: 8, fontSize: 12, color: colors.textFaint},
  barLabelToday: {color: colors.text, fontWeight: '800'},
  progressTrack: {
    height: 12,
    backgroundColor: colors.surfaceMuted,
    borderRadius: metrics.pillRadius,
    overflow: 'hidden',
  },
  progressFill: {height: '100%', backgroundColor: colors.accent, borderRadius: metrics.pillRadius},
  progressFillAlert: {backgroundColor: colors.danger},
  infoRow: {flexDirection: 'row', gap: 10, marginTop: 20},
  infoBlock: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    padding: 14,
  },
  infoLabel: {fontSize: 12, color: colors.textMuted, marginBottom: 6},
  infoValue: {fontSize: 18, fontWeight: '700', color: colors.text},
});
