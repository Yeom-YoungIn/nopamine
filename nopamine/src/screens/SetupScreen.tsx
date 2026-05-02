import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {TARGET_APPS} from '@constants/apps';

const ALLOWED_OPTIONS = [10, 15, 20, 30, 45, 60];
const COOLDOWN_OPTIONS = [15, 30, 60, 120];

export default function SetupScreen() {
  const {allowedMinutes, cooldownMinutes, setAllowedMinutes, setCooldownMinutes} = useTimerStore();
  const {enabledAppIds, toggleApp} = useAppStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>설정</Text>

      <Text style={styles.sectionTitle}>오늘 허용 시간</Text>
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
            <Text
              style={[styles.optionText, cooldownMinutes === min && styles.optionTextActive]}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f0f0f'},
  content: {padding: 24},
  title: {fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 24},
  sectionTitle: {fontSize: 15, color: '#888', marginBottom: 12, marginTop: 8},
  optionRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24},
  option: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  optionActive: {borderColor: '#4ade80', backgroundColor: '#4ade8020'},
  optionText: {fontSize: 15, color: '#888'},
  optionTextActive: {color: '#4ade80', fontWeight: '700'},
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  appRowActive: {borderColor: '#4ade80'},
  appName: {fontSize: 16, color: '#fff', fontWeight: '600'},
  toggle: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  toggleActive: {backgroundColor: '#4ade80'},
  toggleText: {fontSize: 13, fontWeight: '700', color: '#000'},
});
