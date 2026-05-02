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
        <Text style={styles.title}>잠금 해제</Text>
        <Text style={styles.desc}>문제를 풀면 30분 쿨다운을 건너뛸 수 있어요.</Text>

        <Text style={styles.question}>{problem.question}</Text>

        <TextInput
          style={[styles.input, wrong && styles.inputWrong]}
          keyboardType="number-pad"
          value={input}
          onChangeText={setInput}
          placeholder="정답 입력"
          placeholderTextColor="#555"
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        {wrong && <Text style={styles.wrongText}>틀렸습니다. 다시 시도하세요.</Text>}

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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 100,
  },
  card: {
    backgroundColor: '#1a1a1a', borderRadius: 20, padding: 28,
    width: '88%', alignItems: 'center',
  },
  title: {fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8},
  desc: {fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 18},
  question: {fontSize: 36, fontWeight: '800', color: '#4ade80', marginBottom: 24},
  input: {
    width: '100%', backgroundColor: '#2a2a2a', borderRadius: 12,
    padding: 16, fontSize: 24, color: '#fff', textAlign: 'center',
    borderWidth: 1, borderColor: '#333', marginBottom: 8,
  },
  inputWrong: {borderColor: '#f87171'},
  wrongText: {fontSize: 13, color: '#f87171', marginBottom: 12},
  button: {
    backgroundColor: '#4ade80', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 40, marginTop: 16,
  },
  buttonText: {fontSize: 16, fontWeight: '800', color: '#000'},
  cancelButton: {marginTop: 12, padding: 8},
  cancelText: {fontSize: 14, color: '#555'},
});
