import React, {useMemo, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import {colors, metrics, shadows} from '@theme/ui';

interface Props {
  onSolve: () => void;
  onCancel: () => void;
}

function generateProblem(): {question: string; answer: number} {
  const a = Math.floor(Math.random() * 20) + 10;
  const b = Math.floor(Math.random() * 20) + 10;
  const ops = ['+', '-', '×'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let answer: number;
  let question: string;
  switch (op) {
    case '+':
      answer = a + b;
      question = `${a} + ${b} = ?`;
      break;
    case '-':
      answer = a - b;
      question = `${a + b} - ${b} = ?`;
      break;
    case '×':
      answer = a * b;
      question = `${a} × ${b} = ?`;
      break;
  }
  return {question, answer};
}

export default function MathChallenge({onSolve, onCancel}: Props) {
  const problem = useMemo(() => generateProblem(), []);
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  const submit = () => {
    if (parseInt(input, 10) === problem.answer) {
      onSolve();
    } else {
      setWrong(true);
      setInput('');
      setTimeout(() => setWrong(false), 800);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>challenge</Text>
        <Text style={styles.title}>잠금 해제 문제</Text>
        <Text style={styles.desc}>정답을 맞히면 쿨다운 없이 바로 돌아갈 수 있습니다.</Text>

        <View style={styles.questionBox}>
          <Text style={styles.question}>{problem.question}</Text>
        </View>

        <TextInput
          style={[styles.input, wrong && styles.inputWrong]}
          keyboardType="number-pad"
          value={input}
          onChangeText={setInput}
          placeholder="정답 입력"
          placeholderTextColor={colors.textFaint}
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        {wrong && <Text style={styles.wrongText}>정답이 아닙니다. 다시 입력해 주세요.</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={submit}>
          <Text style={styles.primaryButtonText}>확인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
          <Text style={styles.secondaryButtonText}>취소</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentStrong,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  title: {fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 8},
  desc: {fontSize: 14, lineHeight: 21, color: colors.textMuted, marginBottom: 20},
  questionBox: {
    borderRadius: 22,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    marginBottom: 18,
  },
  question: {fontSize: 40, fontWeight: '800', color: colors.text, letterSpacing: -1.2},
  input: {
    borderRadius: 18,
    padding: 16,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputWrong: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  wrongText: {marginTop: 10, fontSize: 13, color: colors.danger},
  primaryButton: {
    marginTop: 18,
    backgroundColor: colors.text,
    borderRadius: metrics.buttonRadius,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {fontSize: 16, fontWeight: '800', color: colors.white},
  secondaryButton: {
    marginTop: 10,
    borderRadius: metrics.buttonRadius,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  secondaryButtonText: {fontSize: 15, fontWeight: '700', color: colors.text},
});
