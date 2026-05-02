import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {useStatsStore} from '@store/statsStore';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({navigation}: Props) {
  const {allowedMinutes, usedMinutes, isBlocked, cooldownUntil, resetIfNewDay} = useTimerStore();
  const {getEnabledApps} = useAppStore();
  const {streak, recordToday, loadFromStorage} = useStatsStore();

  useEffect(() => {
    resetIfNewDay();
    loadFromStorage();
  }, [resetIfNewDay, loadFromStorage]);

  useEffect(() => {
    recordToday(usedMinutes, allowedMinutes);
  }, [usedMinutes, allowedMinutes, recordToday]);

  const remainingMinutes = Math.max(0, allowedMinutes - usedMinutes);
  const percent = Math.min(100, Math.round((usedMinutes / allowedMinutes) * 100));
  const enabledApps = getEnabledApps();

  const cooldownRemainMin = cooldownUntil
    ? Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 60000))
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Nopamine</Text>
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak}일 연속</Text>
          </View>
        )}
      </View>

      {/* 메인 타이머 카드 */}
      <View style={[styles.mainCard, isBlocked && styles.mainCardBlocked]}>
        <Text style={styles.cardLabel}>{isBlocked ? '차단 중' : '남은 시간'}</Text>
        <Text style={[styles.mainTimer, isBlocked && styles.mainTimerBlocked]}>
          {isBlocked ? `${cooldownRemainMin}분 후 해제` : `${remainingMinutes}분`}
        </Text>

        {/* 프로그레스 바 */}
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              {width: `${percent}%` as `${number}%`},
              percent >= 100 && styles.progressFillFull,
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {usedMinutes}분 사용 / {allowedMinutes}분 허용
        </Text>
      </View>

      {/* 차단 앱 목록 */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>차단 대상</Text>
        <View style={styles.appList}>
          {enabledApps.map(app => (
            <View key={app.id} style={styles.appChip}>
              <Text style={styles.appChipText}>{app.name}</Text>
            </View>
          ))}
          {enabledApps.length === 0 && (
            <Text style={styles.emptyText}>설정에서 앱을 선택해주세요</Text>
          )}
        </View>
      </View>

      {/* 버튼 */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Setup')}>
        <Text style={styles.buttonText}>설정 변경</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Stats')}>
        <Text style={styles.buttonSecondaryText}>통계 보기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f0f0f'},
  content: {padding: 24, paddingBottom: 40},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24},
  title: {fontSize: 28, fontWeight: '800', color: '#fff'},
  streakBadge: {backgroundColor: '#1a1a1a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6},
  streakText: {fontSize: 14, color: '#f97316', fontWeight: '700'},
  mainCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  mainCardBlocked: {borderColor: '#f87171'},
  cardLabel: {fontSize: 13, color: '#666', marginBottom: 8},
  mainTimer: {fontSize: 52, fontWeight: '800', color: '#4ade80', marginBottom: 20},
  mainTimerBlocked: {fontSize: 28, color: '#f87171'},
  progressBg: {height: 8, backgroundColor: '#2a2a2a', borderRadius: 4, overflow: 'hidden', marginBottom: 8},
  progressFill: {height: '100%', backgroundColor: '#4ade80', borderRadius: 4},
  progressFillFull: {backgroundColor: '#f87171'},
  progressLabel: {fontSize: 13, color: '#555'},
  card: {backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 16},
  appList: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4},
  appChip: {backgroundColor: '#2a2a2a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6},
  appChipText: {fontSize: 14, color: '#ccc', fontWeight: '600'},
  emptyText: {fontSize: 14, color: '#555'},
  button: {backgroundColor: '#4ade80', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 12},
  buttonText: {fontSize: 16, fontWeight: '800', color: '#000'},
  buttonSecondary: {backgroundColor: '#1a1a1a', borderRadius: 14, padding: 18, alignItems: 'center'},
  buttonSecondaryText: {fontSize: 16, fontWeight: '600', color: '#555'},
});
