import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useTimerStore} from '@store/timerStore';

export default function StatsScreen() {
  const {usedMinutes, allowedMinutes} = useTimerStore();
  const percent = Math.min(100, Math.round((usedMinutes / allowedMinutes) * 100));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>통계</Text>

      <View style={styles.card}>
        <Text style={styles.label}>오늘 사용률</Text>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, {width: `${percent}%` as `${number}%`}]} />
        </View>
        <Text style={styles.percentText}>{percent}%</Text>
        <Text style={styles.detail}>
          {usedMinutes}분 사용 / {allowedMinutes}분 허용
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>주간 통계</Text>
        <Text style={styles.comingSoon}>v2에서 제공 예정</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f0f0f'},
  content: {padding: 24},
  title: {fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 24},
  card: {backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 16},
  label: {fontSize: 13, color: '#888', marginBottom: 12},
  barBackground: {height: 12, backgroundColor: '#333', borderRadius: 6, overflow: 'hidden'},
  barFill: {height: '100%', backgroundColor: '#4ade80', borderRadius: 6},
  percentText: {fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 12},
  detail: {fontSize: 14, color: '#666', marginTop: 4},
  comingSoon: {fontSize: 15, color: '#555'},
});
