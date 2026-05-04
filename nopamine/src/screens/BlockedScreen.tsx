import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTimerStore} from '@store/timerStore';
import MathChallenge from '@components/MathChallenge';
import {colors, metrics, shadows} from '@theme/ui';

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

      <View style={styles.panel}>
        <Text style={styles.eyebrow}>cooldown</Text>
        <Text style={styles.title}>지금은 잠깐 멈추는 시간</Text>
        <Text style={styles.subtitle}>
          즉시 다시 열기보다, 흐름을 끊고 숨을 고르는 데 집중합니다.
        </Text>

        {remaining > 0 && (
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>남은 시간</Text>
            <Text style={styles.timer}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
            <Text style={styles.timerHint}>짧은 휴식이 다음 집중을 더 길게 만듭니다.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={() => setShowChallenge(true)}>
          <Text style={styles.primaryButtonText}>수학 문제로 해제하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundStrong,
    justifyContent: 'center',
    padding: metrics.screenPadding,
  },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  title: {fontSize: 32, lineHeight: 36, fontWeight: '800', color: colors.text, letterSpacing: -1},
  subtitle: {
    marginTop: 12,
    marginBottom: 28,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted,
  },
  timerCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.dangerSoft,
    marginBottom: 18,
  },
  timerLabel: {fontSize: 13, fontWeight: '700', color: colors.danger, marginBottom: 10},
  timer: {fontSize: 56, fontWeight: '800', color: colors.text, letterSpacing: -2},
  timerHint: {marginTop: 10, fontSize: 14, color: colors.textMuted},
  primaryButton: {
    backgroundColor: colors.text,
    borderRadius: metrics.buttonRadius,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {fontSize: 16, fontWeight: '800', color: colors.white},
});
