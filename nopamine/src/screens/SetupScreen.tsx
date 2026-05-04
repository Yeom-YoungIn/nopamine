import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {TARGET_APPS} from '@constants/apps';

const ALLOWED_OPTIONS = [10, 15, 20, 30, 45, 60];
const COOLDOWN_OPTIONS = [15, 30, 60, 120];
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const TABS = ['기본 설정', '요일별 설정'];

const APP_EMOJIS: Record<string, string> = {
  youtube: '▶️',
  instagram: '📷',
  tiktok: '🎵',
};

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
      <Text style={styles.title}>설정 ⚙️</Text>

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
          <Text style={styles.sectionTitle}>⏱ 기본 허용 시간</Text>
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

          <Text style={styles.sectionTitle}>❄️ 차단 후 쿨다운</Text>
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

          <Text style={styles.sectionTitle}>📱 차단 앱 선택</Text>
          {TARGET_APPS.map(app => {
            const isEnabled = enabledAppIds.includes(app.id);
            return (
              <TouchableOpacity
                key={app.id}
                style={[styles.appRow, isEnabled && styles.appRowActive]}
                onPress={() => toggleApp(app.id)}>
                <View style={styles.appRowLeft}>
                  <Text style={styles.appEmoji}>{APP_EMOJIS[app.id] ?? '📦'}</Text>
                  <Text style={[styles.appName, isEnabled && styles.appNameActive]}>{app.name}</Text>
                </View>
                <View style={[styles.toggle, isEnabled && styles.toggleActive]}>
                  <Text style={[styles.toggleText, isEnabled && styles.toggleTextActive]}>
                    {isEnabled ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {tab === 1 && (
        <>
          <View style={styles.hintBox}>
            <Text style={styles.hint}>
              💡 요일별로 다른 시간을 설정할 수 있어요.{'\n'}
              미설정 시 기본({allowedMinutes}분)이 적용돼요.
            </Text>
          </View>
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
  container: {flex: 1, backgroundColor: '#F6F4FF'},
  content: {padding: 24, paddingBottom: 48},
  title: {fontSize: 28, fontWeight: '800', color: '#1F0A3A', marginBottom: 20},
  tabRow: {
    flexDirection: 'row', backgroundColor: '#EDE9FE', borderRadius: 16,
    padding: 5, marginBottom: 28,
  },
  tab: {flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 12},
  tabActive: {
    backgroundColor: '#7C3AED',
    elevation: 2,
    shadowColor: '#7C3AED', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 6,
  },
  tabText: {fontSize: 14, color: '#9CA3AF', fontWeight: '700'},
  tabTextActive: {color: '#fff'},
  sectionTitle: {fontSize: 13, color: '#9CA3AF', marginBottom: 14, marginTop: 6, fontWeight: '700'},
  optionRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28},
  option: {
    borderWidth: 1.5, borderColor: '#E9E6FF', borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 12, backgroundColor: '#fff',
  },
  optionActive: {borderColor: '#7C3AED', backgroundColor: '#F3F0FF'},
  optionText: {fontSize: 15, color: '#9CA3AF', fontWeight: '600'},
  optionTextActive: {color: '#7C3AED', fontWeight: '800'},
  appRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 12,
    borderWidth: 1.5, borderColor: 'transparent',
    elevation: 1,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 8,
  },
  appRowActive: {borderColor: '#7C3AED', backgroundColor: '#FDFAFF'},
  appRowLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
  appEmoji: {fontSize: 20},
  appName: {fontSize: 16, color: '#9CA3AF', fontWeight: '700'},
  appNameActive: {color: '#1F0A3A'},
  toggle: {
    backgroundColor: '#F3F4F6', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  toggleActive: {backgroundColor: '#7C3AED'},
  toggleText: {fontSize: 13, fontWeight: '800', color: '#9CA3AF'},
  toggleTextActive: {color: '#fff'},
  hintBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 8,
  },
  hint: {fontSize: 13, color: '#9CA3AF', lineHeight: 22},
  dayRow: {marginBottom: 18},
  dayLabel: {fontSize: 14, color: '#7C3AED', fontWeight: '800', marginBottom: 10},
  dayOptions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  dayOption: {
    borderWidth: 1.5, borderColor: '#E9E6FF', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff',
  },
  dayOptionActive: {borderColor: '#7C3AED', backgroundColor: '#F3F0FF'},
  dayOptionText: {fontSize: 13, color: '#9CA3AF', fontWeight: '600'},
  dayOptionTextActive: {color: '#7C3AED', fontWeight: '800'},
});
