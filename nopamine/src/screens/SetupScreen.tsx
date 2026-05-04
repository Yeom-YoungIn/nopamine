import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {TARGET_APPS} from '@constants/apps';
import {colors, metrics, shadows} from '@theme/ui';

const ALLOWED_OPTIONS = [10, 15, 20, 30, 45, 60];
const COOLDOWN_OPTIONS = [15, 30, 60, 120];
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const TABS = ['기본', '요일별'];

const APP_EMOJIS: Record<string, string> = {
  youtube: '▶',
  instagram: '◎',
  tiktok: '♪',
};

export default function SetupScreen() {
  const {
    allowedMinutes,
    cooldownMinutes,
    setAllowedMinutes,
    setCooldownMinutes,
    daySchedule,
    setDayOverride,
  } = useTimerStore();
  const {enabledAppIds, toggleApp} = useAppStore();
  const [tab, setTab] = useState(0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>preferences</Text>
      <Text style={styles.title}>간결한 규칙으로 설정하기</Text>
      <Text style={styles.subtitle}>핵심 값만 빠르게 바꿀 수 있도록 구조를 줄였습니다.</Text>

      <View style={styles.tabRow}>
        {TABS.map((label, index) => (
          <TouchableOpacity
            key={label}
            style={[styles.tab, tab === index && styles.tabActive]}
            onPress={() => setTab(index)}>
            <Text style={[styles.tabText, tab === index && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 0 && (
        <>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>하루 허용 시간</Text>
              <Text style={styles.sectionMeta}>{allowedMinutes}분</Text>
            </View>
            <View style={styles.optionRow}>
              {ALLOWED_OPTIONS.map(min => (
                <TouchableOpacity
                  key={min}
                  style={[styles.optionChip, allowedMinutes === min && styles.optionChipActive]}
                  onPress={() => setAllowedMinutes(min)}>
                  <Text
                    style={[styles.optionText, allowedMinutes === min && styles.optionTextActive]}>
                    {min}분
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>차단 후 쿨다운</Text>
              <Text style={styles.sectionMeta}>
                {cooldownMinutes >= 60 ? `${cooldownMinutes / 60}시간` : `${cooldownMinutes}분`}
              </Text>
            </View>
            <View style={styles.optionRow}>
              {COOLDOWN_OPTIONS.map(min => (
                <TouchableOpacity
                  key={min}
                  style={[styles.optionChip, cooldownMinutes === min && styles.optionChipActive]}
                  onPress={() => setCooldownMinutes(min)}>
                  <Text
                    style={[styles.optionText, cooldownMinutes === min && styles.optionTextActive]}>
                    {min >= 60 ? `${min / 60}시간` : `${min}분`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>차단할 앱</Text>
              <Text style={styles.sectionMeta}>{enabledAppIds.length} selected</Text>
            </View>
            {TARGET_APPS.map(app => {
              const enabled = enabledAppIds.includes(app.id);
              return (
                <TouchableOpacity
                  key={app.id}
                  style={[styles.appRow, enabled && styles.appRowActive]}
                  onPress={() => toggleApp(app.id)}>
                  <View style={styles.appInfo}>
                    <Text style={styles.appGlyph}>{APP_EMOJIS[app.id] ?? '•'}</Text>
                    <Text style={styles.appName}>{app.name}</Text>
                  </View>
                  <View style={[styles.appBadge, enabled && styles.appBadgeActive]}>
                    <Text style={[styles.appBadgeText, enabled && styles.appBadgeTextActive]}>
                      {enabled ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {tab === 1 && (
        <View style={styles.sectionCard}>
          <Text style={styles.scheduleHint}>
            미설정 요일은 기본 허용 시간 {allowedMinutes}분을 따릅니다.
          </Text>
          {DAY_LABELS.map((label, dow) => {
            const override = daySchedule.overrides[dow];
            return (
              <View key={dow} style={styles.dayBlock}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>{label}요일</Text>
                  <Text style={styles.dayMeta}>
                    {override === null ? '기본값 사용' : `${override}분 적용`}
                  </Text>
                </View>
                <View style={styles.optionRow}>
                  <TouchableOpacity
                    style={[styles.smallOptionChip, override === null && styles.optionChipActive]}
                    onPress={() => setDayOverride(dow, null)}>
                    <Text
                      style={[
                        styles.smallOptionText,
                        override === null && styles.optionTextActive,
                      ]}>
                      기본
                    </Text>
                  </TouchableOpacity>
                  {ALLOWED_OPTIONS.map(min => (
                    <TouchableOpacity
                      key={min}
                      style={[styles.smallOptionChip, override === min && styles.optionChipActive]}
                      onPress={() => setDayOverride(dow, min)}>
                      <Text
                        style={[
                          styles.smallOptionText,
                          override === min && styles.optionTextActive,
                        ]}>
                        {min}분
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: metrics.pillRadius,
    padding: 4,
    marginBottom: 18,
  },
  tab: {flex: 1, borderRadius: metrics.pillRadius, paddingVertical: 12, alignItems: 'center'},
  tabActive: {backgroundColor: colors.text},
  tabText: {fontSize: 14, fontWeight: '700', color: colors.textMuted},
  tabTextActive: {color: colors.white},
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: metrics.cardRadius,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...shadows.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {fontSize: 18, fontWeight: '700', color: colors.text},
  sectionMeta: {fontSize: 13, color: colors.textFaint},
  optionRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  optionChip: {
    borderRadius: metrics.pillRadius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surfaceMuted,
  },
  optionChipActive: {backgroundColor: colors.text},
  optionText: {fontSize: 14, fontWeight: '700', color: colors.textMuted},
  optionTextActive: {color: colors.white},
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  appRowActive: {},
  appInfo: {flexDirection: 'row', alignItems: 'center', gap: 12},
  appGlyph: {
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    fontSize: 18,
    lineHeight: 36,
  },
  appName: {fontSize: 16, fontWeight: '600', color: colors.text},
  appBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: metrics.pillRadius,
    backgroundColor: colors.surfaceMuted,
  },
  appBadgeActive: {backgroundColor: colors.accentSoft},
  appBadgeText: {fontSize: 12, fontWeight: '800', color: colors.textMuted},
  appBadgeTextActive: {color: colors.accentStrong},
  scheduleHint: {fontSize: 14, lineHeight: 21, color: colors.textMuted, marginBottom: 18},
  dayBlock: {paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border},
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayTitle: {fontSize: 16, fontWeight: '700', color: colors.text},
  dayMeta: {fontSize: 13, color: colors.textFaint},
  smallOptionChip: {
    borderRadius: metrics.pillRadius,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surfaceMuted,
  },
  smallOptionText: {fontSize: 13, fontWeight: '700', color: colors.textMuted},
});
