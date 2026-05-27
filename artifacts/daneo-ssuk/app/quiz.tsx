// QuizScreen — random order, type the word, check answer
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOCK_WORDS, Word } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ── helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

// ── Result dot ────────────────────────────────────────────────────────────────

function ResultDot({ result }: { result: "correct" | "wrong" | null }) {
  const colors = useColors();
  if (result === null) return <View style={[styles.dot, { backgroundColor: colors.secondary }]} />;
  return (
    <View
      style={[
        styles.dot,
        { backgroundColor: result === "correct" ? colors.primary : colors.forgot },
      ]}
    />
  );
}

type AnswerState = "idle" | "correct" | "wrong" | "show";

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  const { reviews } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Build quiz words
  const quizWords: Word[] = useMemo(() => {
    let wordList: Word[];
    if (ids) {
      wordList = ids
        .split(",")
        .map((wid) => MOCK_WORDS.find((w) => w.id === wid))
        .filter(Boolean) as Word[];
    } else {
      wordList = reviews
        .map((r) => MOCK_WORDS.find((w) => w.id === r.wordId))
        .filter(Boolean) as Word[];
    }
    return shuffle(wordList);
  }, []);

  const [qIdx, setQIdx] = useState(0);
  const [input, setInput] = useState("");
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [results, setResults] = useState<Array<"correct" | "wrong">>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentWord = quizWords[qIdx];
  const total = quizWords.length;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 7, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -7, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = () => {
    if (!currentWord || answerState !== "idle") return;
    Keyboard.dismiss();

    const correct = normalize(input) === normalize(currentWord.word);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAnswerState("correct");
      setResults((prev) => [...prev, "correct"]);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shake();
      setAnswerState("wrong");
      setResults((prev) => [...prev, "wrong"]);
    }
  };

  const handleNext = () => {
    Speech.stop();
    if (qIdx + 1 < total) {
      setQIdx((i) => i + 1);
      setInput("");
      setAnswerState("idle");
      setShowHint(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setQuizDone(true);
    }
  };

  const handleSpeak = (word: string) => {
    console.log(`Speaking word: ${word}`);
    Speech.stop();
    setTimeout(() => {
      Speech.speak(word, {
        language: "en-US",
        rate: 0.85,
        pitch: 1.0,
        onDone: () => console.log("Speech finished"),
        onError: () => console.log("Speech error"),
      });
    }, 50);
  };

  const handleSkip = () => {
    setResults((prev) => [...prev, "wrong"]);
    handleNext();
  };

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            퀴즈를 풀 단어가 없습니다.{"\n"}먼저 단어를 학습하세요.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          >
            <Text style={styles.backBtnText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Done screen ──────────────────────────────────────────────────────────────
  if (quizDone) {
    const correctCount = results.filter((r) => r === "correct").length;
    const pct = Math.round((correctCount / total) * 100);
    const grade = pct >= 90 ? "A" : pct >= 70 ? "B" : pct >= 50 ? "C" : "D";
    const gradeColor =
      pct >= 90 ? colors.primary : pct >= 70 ? colors.easy : pct >= 50 ? colors.accent : colors.forgot;

    return (
      <View
        style={[
          styles.screen,
          styles.doneScreen,
          { backgroundColor: colors.background, paddingBottom: botPad + 24 },
        ]}
      >
        {/* Grade circle */}
        <View style={[styles.gradeCircle, { borderColor: gradeColor, backgroundColor: gradeColor + "18" }]}>
          <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
        </View>

        <Text style={[styles.doneTitle, { color: colors.foreground }]}>퀴즈 완료!</Text>
        <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
          {total}문제 중{" "}
          <Text style={{ color: colors.primary, fontFamily: "NotoSansKR_700Bold" }}>
            {correctCount}개
          </Text>{" "}
          정답
        </Text>

        {/* Score bar */}
        <View style={[styles.scoreBarWrap, { backgroundColor: colors.secondary }]}>
          <View
            style={[styles.scoreBarFill, { width: `${pct}%`, backgroundColor: gradeColor }]}
          />
        </View>
        <Text style={[styles.pctText, { color: gradeColor }]}>{pct}%</Text>

        {/* Result dots */}
        <View style={styles.dotRow}>
          {results.map((r, i) => (
            <View
              key={i}
              style={[
                styles.resultDot,
                { backgroundColor: r === "correct" ? colors.primary : colors.forgot },
              ]}
            />
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity
          onPress={() => {
            setQIdx(0);
            setInput("");
            setAnswerState("idle");
            setResults([]);
            setQuizDone(false);
            setShowHint(false);
          }}
          style={[styles.actionBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>다시 풀기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.actionBtnGhost, { borderColor: colors.border, borderRadius: colors.radius }]}
        >
          <Text style={[styles.actionBtnGhostText, { color: colors.foreground }]}>홈으로</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Quiz question ────────────────────────────────────────────────────────────

  const isCorrect = answerState === "correct";
  const isWrong = answerState === "wrong";
  const progress = qIdx / total;

  // Hint: show first 2 letters
  const hintText = currentWord
    ? currentWord.word.slice(0, 2) + "_".repeat(Math.max(0, currentWord.word.length - 2))
    : "";

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>랜덤 퀴즈</Text>
        <Text style={[styles.counter, { color: colors.mutedForeground }]}>
          {qIdx + 1} / {total}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>

      {/* Result mini dots */}
      <View style={styles.miniDotRow}>
        {quizWords.map((_, i) => (
          <View
            key={i}
            style={[
              styles.miniDot,
              {
                backgroundColor:
                  i < results.length
                    ? results[i] === "correct"
                      ? colors.primary
                      : colors.forgot
                    : i === qIdx
                    ? colors.accent
                    : colors.secondary,
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.content, { paddingBottom: botPad + 24 }]}>
        {/* Meaning box */}
        <View
          style={[
            styles.meaningCard,
            {
              backgroundColor: colors.card,
              borderColor:
                isCorrect
                  ? colors.primary
                  : isWrong
                  ? colors.forgot
                  : colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <View style={styles.meaningMeta}>
            <Text style={[styles.meaningLabel, { color: colors.mutedForeground }]}>
              다음 단어의 뜻은?
            </Text>
            <View
              style={[
                styles.levelBadge,
                {
                  backgroundColor:
                    currentWord.level === "elementary"
                      ? colors.primary + "22"
                      : currentWord.level === "middle"
                      ? colors.info + "22"
                      : colors.hard + "22",
                },
              ]}
            >
              <Text
                style={[
                  styles.levelText,
                  {
                    color:
                      currentWord.level === "elementary"
                        ? colors.primary
                        : currentWord.level === "middle"
                        ? colors.info
                        : colors.hard,
                  },
                ]}
              >
                {currentWord.level === "elementary"
                  ? "초등"
                  : currentWord.level === "middle"
                  ? "중등"
                  : "고등"}
              </Text>
            </View>
          </View>

          <Text style={[styles.meaningMain, { color: colors.foreground }]}>
            {currentWord.meaning}
          </Text>

          {showHint && (
            <Text style={[styles.hintChip, { color: colors.mutedForeground }]}>
              힌트: {hintText}
            </Text>
          )}

          {/* Feedback */}
          {isCorrect && (
            <View style={styles.feedbackRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={[styles.feedbackText, { color: colors.primary }]}>
                정답!
              </Text>
              <TouchableOpacity
                onPress={() => handleSpeak(currentWord.word)}
                hitSlop={12}
                style={[styles.speakBtn, { backgroundColor: colors.primary + "18" }]}
              >
                <Ionicons name="volume-high" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          {isWrong && (
            <View style={styles.feedbackRow}>
              <Ionicons name="close-circle" size={20} color={colors.forgot} />
              <Text style={[styles.feedbackText, { color: colors.forgot }]}>
                정답:{" "}
                <Text style={{ fontFamily: "NotoSansKR_700Bold" }}>
                  {currentWord.word}
                </Text>
              </Text>
              <TouchableOpacity
                onPress={() => handleSpeak(currentWord.word)}
                hitSlop={12}
                style={[styles.speakBtn, { backgroundColor: colors.forgot + "18" }]}
              >
                <Ionicons name="volume-high" size={16} color={colors.forgot} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Input */}
        <Animated.View
          style={[
            styles.inputWrap,
            {
              borderColor: isCorrect
                ? colors.primary
                : isWrong
                ? colors.forgot
                : colors.border,
              backgroundColor: isCorrect
                ? colors.primary + "0D"
                : isWrong
                ? colors.forgot + "0D"
                : colors.card,
              borderRadius: colors.radius,
              transform: [{ translateX: shakeAnim }],
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            placeholder="영어 단어를 입력하세요"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            returnKeyType="done"
            onSubmitEditing={answerState === "idle" ? handleSubmit : handleNext}
            editable={answerState === "idle"}
            style={[
              styles.textInput,
              {
                color: isCorrect
                  ? colors.primary
                  : isWrong
                  ? colors.forgot
                  : colors.foreground,
                fontFamily: "NotoSansKR_700Bold",
              },
            ]}
          />
          {answerState === "idle" && input.length > 0 && (
            <TouchableOpacity onPress={() => setInput("")} hitSlop={12}>
              <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
          {isCorrect && (
            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
          )}
          {isWrong && (
            <Ionicons name="close-circle" size={22} color={colors.forgot} />
          )}
        </Animated.View>

        {/* Hint button */}
        {answerState === "idle" && !showHint && (
          <TouchableOpacity
            onPress={() => setShowHint(true)}
            style={styles.hintBtn}
          >
            <Ionicons name="bulb-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.hintBtnText, { color: colors.mutedForeground }]}>
              힌트 보기 (앞 2글자)
            </Text>
          </TouchableOpacity>
        )}

        {/* Action buttons */}
        {answerState === "idle" ? (
          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleSkip}
              style={[
                styles.skipBtn,
                { borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
                모름 →
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={input.trim().length === 0}
              style={[
                styles.submitBtn,
                {
                  backgroundColor:
                    input.trim().length === 0
                      ? colors.secondary
                      : colors.primary,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Text
                style={[
                  styles.submitText,
                  { color: input.trim().length === 0 ? colors.mutedForeground : "#fff" },
                ]}
              >
                확인
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.nextBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius },
            ]}
          >
            <Text style={styles.nextBtnText}>
              {qIdx + 1 < total ? "다음 문제" : "결과 보기"}
            </Text>
            <Ionicons
              name={qIdx + 1 < total ? "arrow-forward" : "checkmark"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontFamily: "NotoSansKR_600SemiBold" },
  counter: { fontSize: 14, fontFamily: "NotoSansKR_500Medium" },
  progressTrack: { height: 3 },
  progressFill: { height: 3 },
  miniDotRow: {
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexWrap: "wrap",
  },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
  content: { flex: 1, padding: 20, gap: 14, justifyContent: "center" },
  // Meaning card
  meaningCard: { borderWidth: 1.5, padding: 20, gap: 10 },
  meaningMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  meaningLabel: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  levelText: { fontSize: 11, fontFamily: "NotoSansKR_700Bold" },
  meaningMain: { fontSize: 24, fontFamily: "NotoSansKR_700Bold", lineHeight: 32 },
  hintChip: { fontSize: 13, fontFamily: "NotoSansKR_500Medium", letterSpacing: 1 },
  feedbackRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  feedbackText: { fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },
  speakBtn: { padding: 6, borderRadius: 8 },
  // Input
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  textInput: { flex: 1, fontSize: 20, padding: 0 },
  hintBtn: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start" },
  hintBtnText: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },
  // Buttons
  btnRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  skipBtn: {
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: { fontSize: 14, fontFamily: "NotoSansKR_500Medium" },
  submitBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { fontSize: 16, fontFamily: "NotoSansKR_700Bold" },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 4,
  },
  nextBtnText: { fontSize: 16, fontFamily: "NotoSansKR_700Bold", color: "#fff" },
  // Done
  doneScreen: { alignItems: "center", justifyContent: "center", gap: 14, padding: 40 },
  gradeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeText: { fontSize: 44, fontFamily: "NotoSansKR_700Bold" },
  doneTitle: { fontSize: 24, fontFamily: "NotoSansKR_700Bold" },
  doneSub: { fontSize: 15, fontFamily: "NotoSansKR_400Regular" },
  scoreBarWrap: { width: "100%", height: 10, borderRadius: 5, overflow: "hidden" },
  scoreBarFill: { height: 10, borderRadius: 5 },
  pctText: { fontSize: 22, fontFamily: "NotoSansKR_700Bold" },
  dotRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  resultDot: { width: 12, height: 12, borderRadius: 6 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 8,
    width: "100%",
  },
  actionBtnText: { fontSize: 16, fontFamily: "NotoSansKR_700Bold", color: "#fff" },
  actionBtnGhost: {
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  actionBtnGhostText: { fontSize: 16, fontFamily: "NotoSansKR_600SemiBold" },
  // Empty
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 40 },
  emptyText: { fontSize: 15, fontFamily: "NotoSansKR_400Regular", textAlign: "center", lineHeight: 24 },
  backBtn: { paddingHorizontal: 28, paddingVertical: 13 },
  backBtnText: { fontSize: 16, fontFamily: "NotoSansKR_700Bold", color: "#fff" },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
