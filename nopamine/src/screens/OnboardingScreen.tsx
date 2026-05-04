import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  AppState,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  checkAllPermissions,
  openAccessibilitySettings,
  openOverlaySettings,
  openUsageSettings,
  PermissionStatus,
} from '@modules/permissionManager';
import {colors, metrics, shadows} from '@theme/ui';
import {RootStackParamList} from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const STEPS = [
  {
    key: 'usage' as keyof PermissionStatus,
    tag: '01',
    title: '사용량 접근',
    desc: '앱별 사용 시간을 추적하려면 필요합니다.',
    guide: '설정 > 앱 > 특별한 앱 접근 권한 > 사용량 데이터 접근',
    action: openUsageSettings,
  },
  {
    key: 'overlay' as keyof PermissionStatus,
    tag: '02',
    title: '화면 위 표시',
    desc: '시간이 끝나면 즉시 차단 화면을 띄웁니다.',
    guide: '설정 > 앱 > 특별한 앱 접근 권한 > 다른 앱 위에 표시',
    action: openOverlaySettings,
  },
  {
    key: 'accessibility' as keyof PermissionStatus,
    tag: '03',
    title: '접근성 서비스',
    desc: '현재 실행 중인 앱을 감지하기 위해 필요합니다.',
    guide: '설정 > 접근성 > 설치된 앱 > Nopamine',
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
    const next = await checkAllPermissions();
    setStatus(next);
    if (next.usage && next.overlay && next.accessibility) {
      await AsyncStorage.setItem('@nopamine:onboarded', 'true');
      navigation.replace('Home');
    }
  }, [navigation]);

  useEffect(() => {
    const bootstrapId = setTimeout(() => {
      refresh();
    }, 0);

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });

    return () => {
      clearTimeout(bootstrapId);
      sub.remove();
    };
  }, [refresh]);

  const allGranted = status.usage && status.overlay && status.accessibility;

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.unsupported}>
        <Text style={styles.unsupportedTitle}>iOS 준비 중</Text>
        <Text style={styles.unsupportedDesc}>현재는 Android 권한 흐름만 지원합니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>focus setup</Text>
        <Text style={styles.title}>집중을 위한 최소 설정</Text>
        <Text style={styles.subtitle}>
          처음 한 번만 권한을 허용하면, 그 다음부터는 자동으로 사용 시간을 관리합니다.
        </Text>
        <View style={styles.progressRow}>
          {STEPS.map(step => (
            <View
              key={step.key}
              style={[styles.progressDot, status[step.key] && styles.progressDotDone]}
            />
          ))}
        </View>
      </View>

      {STEPS.map(step => {
        const granted = status[step.key];
        return (
          <View key={step.key} style={[styles.card, granted && styles.cardDone]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTag}>{step.tag}</Text>
              <Text style={[styles.cardStatus, granted && styles.cardStatusDone]}>
                {granted ? 'Granted' : 'Required'}
              </Text>
            </View>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardDesc}>{step.desc}</Text>
            <Text style={styles.cardGuide}>{step.guide}</Text>
            {!granted && (
              <TouchableOpacity style={styles.inlineButton} onPress={step.action}>
                <Text style={styles.inlineButtonText}>설정 열기</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      <TouchableOpacity
        style={[styles.primaryButton, !allGranted && styles.primaryButtonDisabled]}
        disabled={!allGranted}
        onPress={() => navigation.replace('Home')}>
        <Text style={styles.primaryButtonText}>시작하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: metrics.screenPadding, paddingBottom: 40},
  unsupported: {
    flex: 1,
    backgroundColor: colors.background,
    padding: metrics.screenPadding,
    justifyContent: 'center',
  },
  unsupportedTitle: {fontSize: 30, fontWeight: '800', color: colors.text, marginBottom: 10},
  unsupportedDesc: {fontSize: 15, lineHeight: 22, color: colors.textMuted},
  hero: {
    paddingTop: 12,
    paddingBottom: 18,
    marginBottom: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentStrong,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  title: {fontSize: 34, lineHeight: 38, fontWeight: '800', color: colors.text, letterSpacing: -1.1},
  subtitle: {marginTop: 12, fontSize: 15, lineHeight: 24, color: colors.textMuted},
  progressRow: {flexDirection: 'row', gap: 8, marginTop: 18},
  progressDot: {
    flex: 1,
    height: 6,
    borderRadius: metrics.pillRadius,
    backgroundColor: colors.border,
  },
  progressDotDone: {backgroundColor: colors.accent},
  card: {
    backgroundColor: colors.card,
    borderRadius: metrics.cardRadius,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    ...shadows.soft,
  },
  cardDone: {
    backgroundColor: colors.successSoft,
    borderColor: '#CAE3D0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTag: {fontSize: 12, fontWeight: '800', color: colors.textFaint},
  cardStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: metrics.pillRadius,
  },
  cardStatusDone: {
    color: colors.success,
    backgroundColor: colors.white,
  },
  cardTitle: {fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 8},
  cardDesc: {fontSize: 15, lineHeight: 22, color: colors.textMuted, marginBottom: 10},
  cardGuide: {fontSize: 13, lineHeight: 20, color: colors.textFaint},
  inlineButton: {
    marginTop: 18,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: metrics.pillRadius,
    backgroundColor: colors.surfaceMuted,
  },
  inlineButtonText: {fontSize: 14, fontWeight: '700', color: colors.text},
  primaryButton: {
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: metrics.buttonRadius,
    paddingVertical: 18,
    alignItems: 'center',
    ...shadows.accent,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {fontSize: 16, fontWeight: '800', color: colors.white},
});
