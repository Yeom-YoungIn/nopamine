import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform, Switch} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {useStatsStore} from '@store/statsStore';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {syncBlockStateToNative, syncWidgetData, syncIsEnabledToNative} from '@modules/blockManager';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({navigation}: Props) {
  const {
    allowedMinutes, usedMinutes, isBlocked, cooldownUntil, cooldownMinutes,
    resetIfNewDay, triggerBlock, clearBlock, addUsedMinutes, getTodayAllowedMinutes,
  } = useTimerStore();
  const {getEnabledApps, isEnabled, setEnabled} = useAppStore();
  const {streak, recordToday, loadFromStorage} = useStatsStore();

  const [devVisible, setDevVisible] = useState(false);
  const titleTapCount = useRef(0);
  const titleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleToggle = async (v: boolean) => {
    setEnabled(v);
    syncIsEnabledToNative(v);
    if (!v) {
      clearBlock();
      await syncBlockStateToNative(false, null);
      syncWidgetData(getTodayAllowedMinutes(), getTodayAllowedMinutes(), false, null);
    }
  };

  const handleTitlePress = () => {
    titleTapCount.current += 1;
    if (titleTapTimer.current) clearTimeout(titleTapTimer.current);
    titleTapTimer.current = setTimeout(() => {
      titleTapCount.current = 0;
    }, 1500);
    if (titleTapCount.current >= 3) {
      titleTapCount.current = 0;
      setDevVisible(true);
    }
  };

  // --- 개발자 기능 ---

  const devTriggerBlock = async () => {
    triggerBlock();
    const state = useTimerStore.getState();
    await syncBlockStateToNative(true, state.cooldownUntil);
    syncWidgetData(0, getTodayAllowedMinutes(), true, state.cooldownUntil);
  };

  const devClearBlock = async () => {
    clearBlock();
    await syncBlockStateToNative(false, null);
    syncWidgetData(
      Math.max(0, getTodayAllowedMinutes() - usedMinutes),
      getTodayAllowedMinutes(),
      false,
      null,
    );
  };

  const devSimulateTimeUp = async () => {
    const todayAllowed = getTodayAllowedMinutes();
    const gap = todayAllowed - usedMinutes;
    if (gap > 0) addUsedMinutes(gap);
    triggerBlock();
    const state = useTimerStore.getState();
    await syncBlockStateToNative(true, state.cooldownUntil);
    syncWidgetData(0, todayAllowed, true, state.cooldownUntil);
  };

  const devReset = async () => {
    useTimerStore.setState({
      usedMinutes: 0,
      isBlocked: false,
      cooldownUntil: null,
      warningFired: false,
    });
    await syncBlockStateToNative(false, null);
    syncWidgetData(getTodayAllowedMinutes(), getTodayAllowedMinutes(), false, null);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleTitlePress} activeOpacity={1}>
            <Text style={styles.title}>Nopamine</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak}일 연속</Text>
              </View>
            )}
            <Switch
              value={isEnabled}
              onValueChange={handleToggle}
              trackColor={{false: '#2a2a2a', true: '#166534'}}
              thumbColor={isEnabled ? '#4ade80' : '#555'}
            />
          </View>
        </View>

        {!isEnabled && (
          <View style={styles.disabledBanner}>
            <Text style={styles.disabledBannerText}>차단 기능이 꺼져 있습니다</Text>
          </View>
        )}

        <View style={[styles.mainCard, isBlocked && styles.mainCardBlocked, !isEnabled && styles.mainCardDisabled]}>
          <Text style={styles.cardLabel}>{isBlocked ? '차단 중' : '남은 시간'}</Text>
          <Text style={[styles.mainTimer, isBlocked && styles.mainTimerBlocked]}>
            {isBlocked ? `${cooldownRemainMin}분 후 해제` : `${remainingMinutes}분`}
          </Text>
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

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Setup')}>
          <Text style={styles.buttonText}>설정 변경</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Stats')}>
          <Text style={styles.buttonSecondaryText}>통계 보기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 개발자 모달 */}
      <Modal visible={devVisible} transparent animationType="slide" onRequestClose={() => setDevVisible(false)}>
        <View style={dev.backdrop}>
          <View style={dev.sheet}>
            <View style={dev.header}>
              <Text style={dev.headerTitle}>🛠 개발자 모드</Text>
              <TouchableOpacity onPress={() => setDevVisible(false)}>
                <Text style={dev.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={dev.stateBox}>
              <Text style={dev.stateText}>isEnabled: <Text style={isEnabled ? dev.green : dev.red}>{String(isEnabled)}</Text></Text>
              <Text style={dev.stateText}>isBlocked: <Text style={isBlocked ? dev.red : dev.green}>{String(isBlocked)}</Text></Text>
              <Text style={dev.stateText}>usedMinutes: {usedMinutes} / {allowedMinutes}</Text>
              <Text style={dev.stateText}>cooldownMinutes: {cooldownMinutes}</Text>
              <Text style={dev.stateText}>cooldownUntil: {cooldownUntil ? new Date(cooldownUntil).toLocaleTimeString() : 'null'}</Text>
              <Text style={dev.stateText}>platform: {Platform.OS}</Text>
            </View>

            <TouchableOpacity style={dev.btnRed} onPress={devTriggerBlock}>
              <Text style={dev.btnText}>🚫 차단 강제 실행</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dev.btnGreen} onPress={devClearBlock}>
              <Text style={dev.btnText}>✅ 차단 즉시 해제</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dev.btnOrange} onPress={devSimulateTimeUp}>
              <Text style={dev.btnText}>⏱ 시간 초과 시뮬레이션</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dev.btnGray} onPress={devReset}>
              <Text style={dev.btnText}>🔄 상태 초기화</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f0f0f'},
  content: {padding: 24, paddingBottom: 40},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24},
  headerRight: {flexDirection: 'row', alignItems: 'center', gap: 10},
  title: {fontSize: 28, fontWeight: '800', color: '#fff'},
  streakBadge: {backgroundColor: '#1a1a1a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6},
  streakText: {fontSize: 14, color: '#f97316', fontWeight: '700'},
  disabledBanner: {backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#333'},
  disabledBannerText: {fontSize: 14, color: '#555', textAlign: 'center'},
  mainCardDisabled: {opacity: 0.4},
  mainCard: {
    backgroundColor: '#1a1a1a', borderRadius: 20, padding: 24, marginBottom: 16,
    borderWidth: 1, borderColor: '#2a2a2a',
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

const dev = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end'},
  sheet: {backgroundColor: '#141414', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
  headerTitle: {fontSize: 18, fontWeight: '800', color: '#fff'},
  closeBtn: {fontSize: 20, color: '#666', paddingHorizontal: 8},
  stateBox: {backgroundColor: '#1e1e1e', borderRadius: 12, padding: 14, marginBottom: 20, gap: 6},
  stateText: {fontSize: 13, color: '#aaa', fontFamily: 'monospace'},
  red: {color: '#f87171', fontWeight: '700'},
  green: {color: '#4ade80', fontWeight: '700'},
  btnRed: {backgroundColor: '#7f1d1d', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 10},
  btnGreen: {backgroundColor: '#14532d', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 10},
  btnOrange: {backgroundColor: '#7c2d12', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 10},
  btnGray: {backgroundColor: '#27272a', borderRadius: 12, padding: 16, alignItems: 'center'},
  btnText: {fontSize: 15, fontWeight: '700', color: '#fff'},
});
