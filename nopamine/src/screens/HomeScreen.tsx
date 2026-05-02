import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import {useAppStore} from '@store/appStore';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({navigation}: Props) {
  const {allowedMinutes, usedMinutes, isBlocked, cooldownUntil, resetIfNewDay} = useTimerStore();
  const {getEnabledApps} = useAppStore();

  useEffect(() => {
    resetIfNewDay();
  }, [resetIfNewDay]);

  const remainingMinutes = Math.max(0, allowedMinutes - usedMinutes);
  const enabledApps = getEnabledApps();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 현황</Text>

      <View style={styles.card}>
        <Text style={styles.label}>남은 시간</Text>
        <Text style={[styles.timer, isBlocked && styles.timerBlocked]}>
          {isBlocked ? '차단됨' : `${remainingMinutes}분`}
        </Text>
        {isBlocked && cooldownUntil && (
          <Text style={styles.cooldownText}>
            {Math.ceil((cooldownUntil - Date.now()) / 60000)}분 후 해제
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>사용 / 허용</Text>
        <Text style={styles.usage}>
          {usedMinutes}분 / {allowedMinutes}분
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>차단 중인 앱</Text>
        {enabledApps.map(app => (
          <Text key={app.id} style={styles.appName}>
            • {app.name}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Setup')}>
        <Text style={styles.buttonText}>설정 변경</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Stats')}>
        <Text style={styles.buttonSecondaryText}>통계 보기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f0f0f', padding: 24},
  title: {fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 24},
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  label: {fontSize: 13, color: '#888', marginBottom: 8},
  timer: {fontSize: 48, fontWeight: '800', color: '#4ade80'},
  timerBlocked: {color: '#f87171'},
  cooldownText: {fontSize: 14, color: '#f87171', marginTop: 4},
  usage: {fontSize: 24, fontWeight: '600', color: '#fff'},
  appName: {fontSize: 16, color: '#ccc', marginTop: 4},
  button: {
    backgroundColor: '#4ade80',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {fontSize: 16, fontWeight: '700', color: '#000'},
  buttonSecondary: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  buttonSecondaryText: {fontSize: 16, fontWeight: '600', color: '#888'},
});
