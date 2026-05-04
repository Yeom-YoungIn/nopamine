import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Switch,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {useStatsStore} from '@store/statsStore';
import {syncBlockStateToNative, syncWidgetData, syncIsEnabledToNative} from '@modules/blockManager';
import {colors, metrics, shadows} from '@theme/ui';
import {RootStackParamList} from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const APP_EMOJIS: Record<string, string> = {
  youtube: '▶',
  instagram: '◎',
  tiktok: '♪',
};

export default function HomeScreen({navigation}: Props) {
  const {
    allowedMinutes,
    usedMinutes,
    isBlocked,
    cooldownUntil,
    cooldownMinutes,
    resetIfNewDay,
    triggerBlock,
    clearBlock,
    addUsedMinutes,
    getTodayAllowedMinutes,
  } = useTimerStore();
  const {getEnabledApps, isEnabled, setEnabled} = useAppStore();
  const {streak, recordToday, loadFromStorage} = useStatsStore();

  const [devVisible, setDevVisible] = useState(false);
  const [now, setNow] = useState(() => Date.now());
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
  const progressRatio = allowedMinutes > 0 ? usedMinutes / allowedMinutes : 0;
  const percent = Math.min(100, Math.round(progressRatio * 100));
  const enabledApps = getEnabledApps();
  const cooldownRemainMin = cooldownUntil
    ? Math.max(0, Math.ceil((cooldownUntil - now) / 60000))
    : 0;

  useEffect(() => {
    if (!cooldownUntil) {
      return;
    }

    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const handleToggle = async (value: boolean) => {
    setEnabled(value);
    syncIsEnabledToNative(value);
    if (!value) {
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
          <View>
            <TouchableOpacity onPress={handleTitlePress} activeOpacity={0.9}>
              <Text style={styles.wordmark}>nopamine</Text>
            </TouchableOpacity>
            <Text style={styles.headerHint}>더 적게 보고, 더 오래 집중하기</Text>
          </View>
          <View style={styles.headerActions}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakLabel}>streak</Text>
                <Text style={styles.streakValue}>{streak}d</Text>
              </View>
            )}
            <View style={styles.switchWrap}>
              <Text style={styles.switchLabel}>{isEnabled ? 'ON' : 'OFF'}</Text>
              <Switch
                value={isEnabled}
                onValueChange={handleToggle}
                trackColor={{false: colors.border, true: colors.accent}}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        {!isEnabled && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>차단 기능이 꺼져 있습니다.</Text>
          </View>
        )}

        <View
          style={[
            styles.heroCard,
            isBlocked && styles.heroCardBlocked,
            !isEnabled && styles.heroCardMuted,
          ]}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroEyebrow}>{isBlocked ? 'cooldown' : 'today focus budget'}</Text>
            <Text style={[styles.heroState, isBlocked && styles.heroStateBlocked]}>
              {isBlocked ? 'Blocked' : 'Active'}
            </Text>
          </View>
          <Text style={[styles.heroValue, isBlocked && styles.heroValueBlocked]}>
            {isBlocked ? `${cooldownRemainMin}분` : `${remainingMinutes}분`}
          </Text>
          <Text style={styles.heroCaption}>
            {isBlocked
              ? '다시 열리기까지 잠시 쉬는 시간입니다.'
              : `${usedMinutes}분 사용 / ${allowedMinutes}분 허용`}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {width: `${percent}%` as `${number}%`},
                percent >= 100 && styles.progressFillAlert,
              ]}
            />
          </View>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>사용</Text>
              <Text style={styles.heroStatValue}>{usedMinutes}분</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>남음</Text>
              <Text style={styles.heroStatValue}>{remainingMinutes}분</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>쿨다운</Text>
              <Text style={styles.heroStatValue}>{cooldownMinutes}분</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>차단 대상 앱</Text>
            <Text style={styles.sectionMeta}>{enabledApps.length} selected</Text>
          </View>
          <View style={styles.appList}>
            {enabledApps.map(app => (
              <View key={app.id} style={styles.appChip}>
                <Text style={styles.appChipText}>
                  {APP_EMOJIS[app.id] ?? '•'} {app.name}
                </Text>
              </View>
            ))}
            {enabledApps.length === 0 && (
              <Text style={styles.emptyText}>아직 선택된 앱이 없습니다.</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Setup')}>
          <Text style={styles.primaryButtonText}>설정 열기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Stats')}>
          <Text style={styles.secondaryButtonText}>사용 통계 보기</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={devVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDevVisible(false)}>
        <View style={dev.backdrop}>
          <View style={dev.sheet}>
            <View style={dev.header}>
              <Text style={dev.headerTitle}>Developer</Text>
              <TouchableOpacity onPress={() => setDevVisible(false)}>
                <Text style={dev.closeBtn}>닫기</Text>
              </TouchableOpacity>
            </View>

            <View style={dev.stateBox}>
              <Text style={dev.stateText}>
                isEnabled: <Text style={isEnabled ? dev.green : dev.red}>{String(isEnabled)}</Text>
              </Text>
              <Text style={dev.stateText}>
                isBlocked: <Text style={isBlocked ? dev.red : dev.green}>{String(isBlocked)}</Text>
              </Text>
              <Text style={dev.stateText}>
                usedMinutes: {usedMinutes} / {allowedMinutes}
              </Text>
              <Text style={dev.stateText}>cooldownMinutes: {cooldownMinutes}</Text>
              <Text style={dev.stateText}>
                cooldownUntil:{' '}
                {cooldownUntil ? new Date(cooldownUntil).toLocaleTimeString() : 'null'}
              </Text>
              <Text style={dev.stateText}>platform: {Platform.OS}</Text>
            </View>

            <TouchableOpacity style={dev.btnDanger} onPress={devTriggerBlock}>
              <Text style={dev.btnText}>차단 강제 실행</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dev.btnSuccess} onPress={devClearBlock}>
              <Text style={dev.btnText}>차단 즉시 해제</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dev.btnNeutral} onPress={devSimulateTimeUp}>
              <Text style={dev.btnText}>시간 초과 시뮬레이션</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dev.btnNeutral} onPress={devReset}>
              <Text style={dev.btnText}>상태 초기화</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: metrics.screenPadding, paddingBottom: 40},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  wordmark: {fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -1.2},
  headerHint: {marginTop: 4, fontSize: 14, color: colors.textMuted},
  headerActions: {alignItems: 'flex-end', gap: 10},
  streakBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    minWidth: 76,
  },
  streakLabel: {fontSize: 11, color: colors.textMuted, textTransform: 'uppercase'},
  streakValue: {fontSize: 20, fontWeight: '800', color: colors.text},
  switchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 10,
  },
  switchLabel: {fontSize: 12, fontWeight: '700', color: colors.textMuted},
  notice: {
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
  },
  noticeText: {fontSize: 14, color: colors.textMuted},
  heroCard: {
    backgroundColor: colors.dark,
    borderRadius: 30,
    padding: 24,
    marginBottom: 16,
  },
  heroCardBlocked: {backgroundColor: colors.danger},
  heroCardMuted: {opacity: 0.72},
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFFB3',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroState: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentSoft,
    backgroundColor: '#FFFFFF1A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: metrics.pillRadius,
  },
  heroStateBlocked: {color: colors.white},
  heroValue: {fontSize: 58, fontWeight: '800', color: colors.white, letterSpacing: -2.4},
  heroValueBlocked: {fontSize: 44},
  heroCaption: {marginTop: 6, marginBottom: 20, fontSize: 14, lineHeight: 20, color: '#FFFFFFB3'},
  progressTrack: {
    height: 10,
    borderRadius: metrics.pillRadius,
    backgroundColor: '#FFFFFF1F',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: metrics.pillRadius,
    backgroundColor: colors.accent,
  },
  progressFillAlert: {backgroundColor: colors.dark},
  heroStatsRow: {flexDirection: 'row', gap: 10, marginTop: 20},
  heroStat: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF12',
  },
  heroStatLabel: {fontSize: 12, color: '#FFFFFF99', marginBottom: 6},
  heroStatValue: {fontSize: 18, fontWeight: '700', color: colors.white},
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: metrics.cardRadius,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {fontSize: 18, fontWeight: '700', color: colors.text},
  sectionMeta: {fontSize: 12, color: colors.textFaint},
  appList: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  appChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: metrics.pillRadius,
    backgroundColor: colors.surfaceMuted,
  },
  appChipText: {fontSize: 14, fontWeight: '600', color: colors.text},
  emptyText: {fontSize: 14, color: colors.textFaint},
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: metrics.buttonRadius,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 10,
    ...shadows.accent,
  },
  primaryButtonText: {fontSize: 16, fontWeight: '800', color: colors.white},
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: metrics.buttonRadius,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  secondaryButtonText: {fontSize: 16, fontWeight: '700', color: colors.text},
});

const dev = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {fontSize: 18, fontWeight: '800', color: colors.text},
  closeBtn: {fontSize: 14, color: colors.textMuted, fontWeight: '700'},
  stateBox: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateText: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  red: {color: colors.danger, fontWeight: '700'},
  green: {color: colors.success, fontWeight: '700'},
  btnDanger: {
    backgroundColor: colors.dangerSoft,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnSuccess: {
    backgroundColor: colors.successSoft,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnNeutral: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnText: {fontSize: 15, fontWeight: '700', color: colors.text},
});
