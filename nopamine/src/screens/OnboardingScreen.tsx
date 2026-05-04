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
    emoji: '📊',
    title: '사용량 접근 권한',
    desc: '앱별 사용 시간을 측정하기 위해 필요해요.',
    guide: '설정 → 앱 → 특별한 앱 접근 권한 → 사용량 데이터 접근',
    action: openUsageSettings,
  },
  {
    key: 'overlay' as keyof PermissionStatus,
    emoji: '🖥️',
    title: '다른 앱 위에 표시',
    desc: '시간 초과 시 차단 화면을 띄우기 위해 필요해요.',
    guide: '설정 → 앱 → 특별한 앱 접근 권한 → 다른 앱 위에 표시',
    action: openOverlaySettings,
  },
  {
    key: 'accessibility' as keyof PermissionStatus,
    emoji: '♿',
    title: '접근성 서비스',
    desc: '현재 실행 중인 앱을 감지하기 위해 필요해요.',
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
      <View style={styles.heroWrap}>
        <Text style={styles.heroText}>✦</Text>
      </View>
      <Text style={styles.title}>권한 설정</Text>
      <Text style={styles.subtitle}>
        Nopamine이 제대로 작동하려면{'\n'}아래 3가지 권한이 필요해요 🙌
      </Text>

      {STEPS.map(step => {
        const granted = status[step.key];
        return (
          <View key={step.key} style={[styles.card, granted && styles.cardDone]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardEmoji}>{step.emoji}</Text>
                <Text style={styles.cardTitle}>{step.title}</Text>
              </View>
              <View style={[styles.badge, granted ? styles.badgeDone : styles.badgePending]}>
                <Text style={[styles.badgeText, granted ? styles.badgeTextDone : styles.badgeTextPending]}>
                  {granted ? '완료 ✓' : '필요'}
                </Text>
              </View>
            </View>
            <Text style={styles.desc}>{step.desc}</Text>
            <Text style={styles.guide}>{step.guide}</Text>
            {!granted && (
              <TouchableOpacity style={styles.button} onPress={step.action}>
                <Text style={styles.buttonText}>설정 열기 →</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {allGranted && (
        <TouchableOpacity style={styles.startButton} onPress={() => navigation.replace('Home')}>
          <Text style={styles.startButtonText}>시작하기 🚀</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F6F4FF', padding: 24},
  heroWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  heroText: {fontSize: 28, color: '#7C3AED', fontWeight: '800'},
  title: {fontSize: 28, fontWeight: '800', color: '#1F0A3A', marginBottom: 8},
  subtitle: {fontSize: 15, color: '#9CA3AF', lineHeight: 24, marginBottom: 28},
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    elevation: 1,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8,
  },
  cardDone: {borderColor: '#10B981', backgroundColor: '#F0FDF4'},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
  cardTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  cardEmoji: {fontSize: 18},
  cardTitle: {fontSize: 16, fontWeight: '700', color: '#1F0A3A'},
  badge: {borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5},
  badgePending: {backgroundColor: '#FFF1F2'},
  badgeDone: {backgroundColor: '#DCFCE7'},
  badgeText: {fontSize: 12, fontWeight: '700'},
  badgeTextPending: {color: '#F43F5E'},
  badgeTextDone: {color: '#10B981'},
  desc: {fontSize: 14, color: '#6B7280', marginBottom: 6, lineHeight: 20},
  guide: {fontSize: 12, color: '#D1D5DB', lineHeight: 18, marginBottom: 10},
  button: {
    backgroundColor: '#F3F0FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  buttonText: {fontSize: 14, color: '#7C3AED', fontWeight: '700'},
  startButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#7C3AED', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 10,
  },
  startButtonText: {fontSize: 16, fontWeight: '800', color: '#fff'},
});
