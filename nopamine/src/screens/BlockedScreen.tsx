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

      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>🌙</Text>
      </View>
      <Text style={styles.title}>잠깐, 쉬어가요!</Text>
      <Text style={styles.subtitle}>지금은 뇌가 충전하는 시간이에요 🧠✨</Text>

      {remaining > 0 && (
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>해제까지 남은 시간</Text>
          <Text style={styles.timer}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <Text style={styles.timerHint}>잠깐의 여유가 집중력을 높여줘요</Text>
        </View>
      )}

      <TouchableOpacity style={styles.unlockButton} onPress={() => setShowChallenge(true)}>
        <Text style={styles.unlockText}>🧮 수학 문제 풀고 해제하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F6F4FF',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  emojiWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  emoji: {fontSize: 52},
  title: {fontSize: 28, fontWeight: '800', color: '#1F0A3A', textAlign: 'center', marginBottom: 12},
  subtitle: {fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginBottom: 48, lineHeight: 24},
  timerBox: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    alignItems: 'center', marginBottom: 40, width: '100%',
    elevation: 2,
    shadowColor: '#F43F5E', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 16,
  },
  timerLabel: {fontSize: 13, color: '#9CA3AF', marginBottom: 10, fontWeight: '600'},
  timer: {fontSize: 60, fontWeight: '800', color: '#F43F5E', letterSpacing: 2, marginBottom: 10},
  timerHint: {fontSize: 13, color: '#D1D5DB'},
  unlockButton: {
    backgroundColor: '#fff', borderRadius: 18,
    paddingVertical: 16, paddingHorizontal: 28,
    elevation: 1,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8,
  },
  unlockText: {fontSize: 15, color: '#7C3AED', fontWeight: '700'},
});
