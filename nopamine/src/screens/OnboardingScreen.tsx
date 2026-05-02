import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  AppState,
} from 'react-native';
import {
  checkAllPermissions,
  openAccessibilitySettings,
  openOverlaySettings,
  openUsageSettings,
  PermissionStatus,
} from '@modules/permissionManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const STEPS = [
  {
    key: 'usage' as keyof PermissionStatus,
    title: '사용량 접근 권한',
    desc: '앱별 사용 시간을 측정하기 위해 필요합니다.',
    guide: '설정 → 앱 → 특별한 앱 접근 권한 → 사용량 데이터 접근',
    action: openUsageSettings,
  },
  {
    key: 'overlay' as keyof PermissionStatus,
    title: '다른 앱 위에 표시',
    desc: '시간 초과 시 차단 화면을 표시하기 위해 필요합니다.',
    guide: '설정 → 앱 → 특별한 앱 접근 권한 → 다른 앱 위에 표시',
    action: openOverlaySettings,
  },
  {
    key: 'accessibility' as keyof PermissionStatus,
    title: '접근성 서비스',
    desc: '현재 실행 중인 앱을 감지하기 위해 필요합니다.',
    guide: '설정 → 접근성 → 설치된 앱 → Nopamine → 켜기',
    action: openAccessibilitySettings,
  },
];

export default function OnboardingScreen({navigation}: Props) {
  const [status, setStatus] = useState<PermissionStatus>({
    usage: false,
    overlay: false,
    accessibility: false,
  });

  const refresh = useCallback(async () => {
    const s = await checkAllPermissions();
    setStatus(s);
    if (s.usage && s.overlay && s.accessibility) {
      await AsyncStorage.setItem('@nopamine:onboarded', 'true');
      navigation.replace('Home');
    }
  }, [navigation]);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const allGranted = status.usage && status.overlay && status.accessibility;

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>iOS 설정</Text>
        <Text style={styles.desc}>iOS는 Screen Time API를 사용합니다.{'\n'}추후 지원 예정입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>권한 설정</Text>
      <Text style={styles.subtitle}>
        Nopamine이 앱을 차단하려면{'\n'}아래 3가지 권한이 필요합니다.
      </Text>

      {STEPS.map(step => {
        const granted = status[step.key];
        return (
          <View key={step.key} style={[styles.card, granted && styles.cardDone]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{step.title}</Text>
              <Text style={granted ? styles.badgeDone : styles.badgePending}>
                {granted ? '완료' : '필요'}
              </Text>
            </View>
            <Text style={styles.desc}>{step.desc}</Text>
            <Text style={styles.guide}>{step.guide}</Text>
            {!granted && (
              <TouchableOpacity style={styles.button} onPress={step.action}>
                <Text style={styles.buttonText}>설정 열기</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {allGranted && (
        <TouchableOpacity style={styles.startButton} onPress={() => navigation.replace('Home')}>
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f0f0f', padding: 24},
  title: {fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8},
  subtitle: {fontSize: 15, color: '#888', lineHeight: 22, marginBottom: 28},
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardDone: {borderColor: '#4ade80'},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  cardTitle: {fontSize: 16, fontWeight: '700', color: '#fff'},
  badgePending: {fontSize: 12, color: '#f87171', fontWeight: '700'},
  badgeDone: {fontSize: 12, color: '#4ade80', fontWeight: '700'},
  desc: {fontSize: 14, color: '#aaa', marginBottom: 6},
  guide: {fontSize: 12, color: '#555', lineHeight: 18, marginBottom: 10},
  button: {
    backgroundColor: '#222',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  buttonText: {fontSize: 14, color: '#fff', fontWeight: '600'},
  startButton: {
    backgroundColor: '#4ade80',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {fontSize: 16, fontWeight: '800', color: '#000'},
});
