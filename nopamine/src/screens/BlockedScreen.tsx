import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import MathChallenge from '@components/MathChallenge';

export default function BlockedScreen() {
  const {cooldownUntil, clearBlock} = useTimerStore();
  const [remaining, setRemaining] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);

  useEffect(() => {
    const update = () => {
      if (!cooldownUntil) return;
      const diff = cooldownUntil - Date.now();
      if (diff <= 0) {
        clearBlock();
        return;
      }
      setRemaining(diff);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil, clearBlock]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <View style={styles.container}>
      {showChallenge && (
        <MathChallenge
          onSolve={() => {
            setShowChallenge(false);
            clearBlock();
          }}
          onCancel={() => setShowChallenge(false)}
        />
      )}

      <Text style={styles.emoji}>🚫</Text>
      <Text style={styles.title}>오늘 시간을 다 썼어요</Text>
      <Text style={styles.subtitle}>뇌에게 쉬는 시간을 주세요</Text>

      {remaining > 0 && (
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>재접근까지</Text>
          <Text style={styles.timer}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.unlockButton} onPress={() => setShowChallenge(true)}>
        <Text style={styles.unlockText}>수학 문제 풀고 해제하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0f0f0f',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  emoji: {fontSize: 72, marginBottom: 24},
  title: {fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 12},
  subtitle: {fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 48},
  timerBox: {alignItems: 'center', marginBottom: 40},
  timerLabel: {fontSize: 14, color: '#666', marginBottom: 8},
  timer: {fontSize: 56, fontWeight: '800', color: '#f87171', letterSpacing: 2},
  unlockButton: {
    borderWidth: 1, borderColor: '#333',
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24,
  },
  unlockText: {fontSize: 14, color: '#555'},
});
