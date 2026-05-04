import React, {useState, useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput} from 'react-native';

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
  const problem = useMemo(generateProblem, []);
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
        <View style={styles.badgeWrap}>
          <Text style={styles.badge}>🧮 수학 챌린지</Text>
        </View>
        <Text style={styles.title}>잠금 해제</Text>
        <Text style={styles.desc}>정답을 맞히면 쿨다운을 건너뛸 수 있어요!</Text>

        <View style={styles.questionBox}>
          <Text style={styles.question}>{problem.question}</Text>
        </View>

        <TextInput
          style={[styles.input, wrong && styles.inputWrong]}
          keyboardType="number-pad"
          value={input}
          onChangeText={setInput}
          placeholder="정답 입력"
          placeholderTextColor="#D1D5DB"
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        {wrong && <Text style={styles.wrongText}>😅 틀렸어요, 다시 시도해봐요!</Text>}

        <TouchableOpacity style={styles.button} onPress={submit}>
          <Text style={styles.buttonText}>확인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 100,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 28, padding: 28,
    width: '88%', alignItems: 'center',
    elevation: 8,
    shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.15, shadowRadius: 24,
  },
  badgeWrap: {marginBottom: 16},
  badge: {
    fontSize: 13, color: '#7C3AED', fontWeight: '700',
    backgroundColor: '#F3F0FF', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, overflow: 'hidden',
  },
  title: {fontSize: 22, fontWeight: '800', color: '#1F0A3A', marginBottom: 8},
  desc: {fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 24, lineHeight: 18},
  questionBox: {
    backgroundColor: '#F6F4FF', borderRadius: 18, paddingVertical: 20,
    paddingHorizontal: 32, marginBottom: 24, width: '100%', alignItems: 'center',
  },
  question: {fontSize: 38, fontWeight: '800', color: '#7C3AED'},
  input: {
    width: '100%', backgroundColor: '#F9FAFB', borderRadius: 16,
    padding: 16, fontSize: 24, color: '#1F0A3A', textAlign: 'center',
    borderWidth: 1.5, borderColor: '#E9E6FF', marginBottom: 8,
  },
  inputWrong: {borderColor: '#F43F5E', backgroundColor: '#FFF1F2'},
  wrongText: {fontSize: 13, color: '#F43F5E', marginBottom: 12},
  button: {
    backgroundColor: '#7C3AED', borderRadius: 16,
    paddingVertical: 16, width: '100%',
    alignItems: 'center', marginTop: 16,
    elevation: 3,
    shadowColor: '#7C3AED', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 10,
  },
  buttonText: {fontSize: 16, fontWeight: '800', color: '#fff'},
  cancelButton: {marginTop: 14, padding: 8},
  cancelText: {fontSize: 14, color: '#D1D5DB'},
});
