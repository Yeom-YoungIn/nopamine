import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {TARGET_APPS} from '@constants/apps';

const ALLOWED_OPTIONS = [10, 15, 20, 30, 45, 60];
const COOLDOWN_OPTIONS = [15, 30, 60, 120];
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const TABS = ['기본 설정', '요일별 설정'];

export default function SetupScreen() {
  const {
    allowedMinutes, cooldownMinutes,
    setAllowedMinutes, setCooldownMinutes,
    daySchedule, setDayOverride,
  } = useTimerStore();
  const {enabledAppIds, toggleApp} = useAppStore();
  const [tab, setTab] = useState(0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>설정</Text>

      {/* 탭 */}
      <View style={styles.tabRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === i && styles.tabActive]}
            onPress={() => setTab(i)}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 0 && (
        <>
          <Text style={styles.sectionTitle}>기본 허용 시간</Text>
          <View style={styles.optionRow}>
            {ALLOWED_OPTIONS.map(min => (
              <TouchableOpacity
                key={min}
                style={[styles.option, allowedMinutes === min && styles.optionActive]}
                onPress={() => setAllowedMinutes(min)}>
                <Text style={[styles.optionText, allowedMinutes === min && styles.optionTextActive]}>
                  {min}분
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>차단 후 쿨다운</Text>
          <View style={styles.optionRow}>
            {COOLDOWN_OPTIONS.map(min => (
              <TouchableOpacity
                key={min}
                style={[styles.option, cooldownMinutes === min && styles.optionActive]}
                onPress={() => setCooldownMinutes(min)}>
                <Text style={[styles.optionText, cooldownMinutes === min && styles.optionTextActive]}>
                  {min >= 60 ? `${min / 60}시간` : `${min}분`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>차단 앱 선택</Text>
          {TARGET_APPS.map(app => {
            const isEnabled = enabledAppIds.includes(app.id);
            return (
              <TouchableOpacity
                key={app.id}
                style={[styles.appRow, isEnabled && styles.appRowActive]}
                onPress={() => toggleApp(app.id)}>
                <Text style={styles.appName}>{app.name}</Text>
                <View style={[styles.toggle, isEnabled && styles.toggleActive]}>
                  <Text style={styles.toggleText}>{isEnabled ? 'ON' : 'OFF'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {tab === 1 && (
        <>
          <Text style={styles.hint}>
            요일별로 다른 시간을 설정하세요.{'\n'}
            미설정 시 기본 설정({allowedMinutes}분)이 적용됩니다.
          </Text>
          {DAY_LABELS.map((label, dow) => {
            const override = daySchedule.overrides[dow];
            return (
              <View key={dow} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{label}요일</Text>
                <View style={styles.dayOptions}>
                  <TouchableOpacity
                    style={[styles.dayOption, override === null && styles.dayOptionActive]}
                    onPress={() => setDayOverride(dow, null)}>
                    <Text style={[styles.dayOptionText, override === null && styles.dayOptionTextActive]}>
                      기본
                    </Text>
                  </TouchableOpacity>
                  {ALLOWED_OPTIONS.map(min => (
                    <TouchableOpacity
                      key={min}
                      style={[styles.dayOption, override === min && styles.dayOptionActive]}
                      onPress={() => setDayOverride(dow, min)}>
                      <Text style={[styles.dayOptionText, override === min && styles.dayOptionTextActive]}>
                        {min}분
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f0f0f'},
  content: {padding: 24, paddingBottom: 48},
  title: {fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 20},
  tabRow: {flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 4, marginBottom: 28},
  tab: {flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10},
  tabActive: {backgroundColor: '#2a2a2a'},
  tabText: {fontSize: 14, color: '#555', fontWeight: '600'},
  tabTextActive: {color: '#fff'},
  sectionTitle: {fontSize: 13, color: '#666', marginBottom: 12, marginTop: 4},
  optionRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28},
  option: {borderWidth: 1, borderColor: '#333', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12},
  optionActive: {borderColor: '#4ade80', backgroundColor: '#4ade8015'},
  optionText: {fontSize: 15, color: '#666'},
  optionTextActive: {color: '#4ade80', fontWeight: '700'},
  appRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 14, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: 'transparent',
  },
  appRowActive: {borderColor: '#4ade80'},
  appName: {fontSize: 16, color: '#fff', fontWeight: '600'},
  toggle: {backgroundColor: '#333', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6},
  toggleActive: {backgroundColor: '#4ade80'},
  toggleText: {fontSize: 13, fontWeight: '700', color: '#000'},
  hint: {fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 20},
  dayRow: {marginBottom: 16},
  dayLabel: {fontSize: 14, color: '#aaa', fontWeight: '700', marginBottom: 8},
  dayOptions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  dayOption: {borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8},
  dayOptionActive: {borderColor: '#4ade80', backgroundColor: '#4ade8015'},
  dayOptionText: {fontSize: 13, color: '#555'},
  dayOptionTextActive: {color: '#4ade80', fontWeight: '700'},
});
