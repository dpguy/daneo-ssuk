// SpellingScreen — letter-by-letter spelling practice for a word or a list
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOCK_WORDS, Word, getWordById } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ── helpers ───────────────────────────────────────────────────────────────────

const ALPHA_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

function useShake() {
  const anim = useRef(new Animated.Value(0)).current;
  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [anim]);
  return { anim, shake };
}

// ── Letter box ────────────────────────────────────────────────────────────────

type LetterState = "empty" | "correct" | "active" | "wrong-flash";

function LetterBox({
  char,
  state,
  isSpecial,
}: {
  char: string;
  state: LetterState;
  isSpecial?: boolean; // space / hyphen shown as-is
}) {
  const colors = useColors();
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === "wrong-flash") {
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: false }),
        Animated.timing(flash, { toValue: 0, duration: 180, useNativeDriver: false }),
      ]).start();
    }
  }, [state]);

  const bg =
    isSpecial
      ? "transparent"
      : state === "correct"
      ? colors.primary + "33"
      : state === "active"
      ? colors.accent + "22"
      : colors.secondary;

  const borderColor =
    isSpecial
      ? "transparent"
      : state === "correct"
      ? colors.primary
      : state === "active"
      ? colors.accent
      : state === "wrong-flash"
      ? colors.forgot
      : colors.border;

  const textColor =
    state === "correct" ? colors.primary : colors.foreground;

  return (
    <Animated.View
      style={[
        styles.letterBox,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: isSpecial ? 0 : 2,
          borderRadius: 8,
          opacity: state === "wrong-flash" ? flash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.letterChar,
          {
            color: state === "correct" ? textColor : state === "active" ? colors.accent : colors.mutedForeground,
            fontFamily: "NotoSansKR_700Bold",
          },
        ]}
      >
        {isSpecial ? char : state === "correct" ? char.toUpperCase() : state === "active" ? "_" : ""}
      </Text>
    </Animated.View>
  );
}

// ── Key button ────────────────────────────────────────────────────────────────

function KeyBtn({
  label,
  onPress,
  disabled,
  color,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.keyBtn,
        {
          backgroundColor: color
            ? color + "22"
            : pressed
            ? colors.primary + "22"
            : colors.secondary,
          borderColor: color ? color + "55" : colors.border,
          opacity: disabled ? 0.35 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.keyLabel,
          { color: color ?? colors.foreground, fontFamily: "NotoSansKR_700Bold" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

type Stage = "spelling" | "correct" | "done";

export default function SpellingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, ids } = useLocalSearchParams<{ id?: string; ids?: string }>();
  const { reviews } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Build word queue
  const wordQueue: Word[] = (() => {
    if (ids) {
      return ids
        .split(",")
        .map((wid) => MOCK_WORDS.find((w) => w.id === wid))
        .filter(Boolean) as Word[];
    }
    if (id) {
      const w = getWordById(id);
      return w ? [w] : [];
    }
    // All learned words
    return reviews
      .map((r) => MOCK_WORDS.find((w) => w.id === r.wordId))
      .filter(Boolean) as Word[];
  })();

  const [queueIdx, setQueueIdx] = useState(0);
  const [stage, setStage] = useState<Stage>("spelling");
  const [typed, setTyped] = useState<string[]>([]); // correctly typed letters so far
  const [wrongFlash, setWrongFlash] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const { anim: shakeAnim, shake } = useShake();

  const currentWord = wordQueue[queueIdx];
  const total = wordQueue.length;

  // Letters of the word (skip spaces & hyphens — show as-is)
  const wordLetters = currentWord ? currentWord.word.toUpperCase().split("") : [];
  const typableIndices = wordLetters
    .map((c, i) => (/[A-Z]/.test(c) ? i : -1))
    .filter((i) => i >= 0);
  const currentTypablePos = typed.length; // how many typable letters filled
  const currentAbsPos =
    typableIndices[currentTypablePos] ?? wordLetters.length;
  const isWordDone = typed.length === typableIndices.length;

  const resetForWord = (word: Word) => {
    setTyped([]);
    setStage("spelling");
    setWrongFlash(false);
    setHintShown(false);
  };

  const handleKey = (letter: string) => {
    if (stage !== "spelling" || isWordDone || !currentWord) return;

    const expected = wordLetters[currentAbsPos];
    if (letter.toUpperCase() === expected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newTyped = [...typed, letter.toUpperCase()];
      setTyped(newTyped);
      setWrongFlash(false);

      if (newTyped.length === typableIndices.length) {
        // Word complete
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStage("correct");
        setCorrectCount((c) => c + 1);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWrongFlash(true);
      shake();
      setTimeout(() => setWrongFlash(false), 400);
    }
  };

  const handleBackspace = () => {
    if (typed.length === 0) return;
    setTyped((prev) => prev.slice(0, -1));
  };

  const handleNext = () => {
    if (queueIdx + 1 < total) {
      setQueueIdx((i) => i + 1);
      resetForWord(wordQueue[queueIdx + 1]);
    } else {
      setStage("done");
    }
  };

  const handleHint = () => {
    if (hintShown || typed.length > 0) return;
    setHintShown(true);
    // Auto-type the first letter
    handleKey(wordLetters[typableIndices[0]]);
  };

  const handleGoQuiz = () => {
    const learnedIds = reviews.map((r) => r.wordId).join(",");
    if (learnedIds) {
      router.replace({ pathname: "/quiz", params: { ids: learnedIds } });
    } else {
      router.back();
    }
  };

  if (!currentWord && stage !== "done") {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            연습할 단어가 없습니다.{"\n"}먼저 단어를 학습하세요.
          </Text>
        </View>
      </View>
    );
  }

  // ── Done screen ─────────────────────────────────────────────────────────────
  if (stage === "done") {
    return (
      <View
        style={[
          styles.screen,
          styles.doneScreen,
          { backgroundColor: colors.background, paddingBottom: botPad + 24 },
        ]}
      >
        <View
          style={[styles.doneCircle, { backgroundColor: colors.primary + "22" }]}
        >
          <Ionicons name="star" size={56} color={colors.accent} />
        </View>
        <Text style={[styles.doneTitle, { color: colors.foreground }]}>
          스펠링 완료!
        </Text>
        <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
          {correctCount} / {total}개 정확히 입력했습니다
        </Text>

        {/* Score bar */}
        <View style={[styles.scoreBarWrap, { backgroundColor: colors.secondary }]}>
          <View
            style={[
              styles.scoreBarFill,
              {
                width: `${(correctCount / total) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        <TouchableOpacity
          onPress={handleGoQuiz}
          style={[
            styles.quizBtn,
            { backgroundColor: colors.primary, borderRadius: colors.radius },
          ]}
        >
          <Ionicons name="shuffle" size={20} color="#fff" />
          <Text style={styles.quizBtnText}>랜덤 퀴즈로 확인하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backLink}
        >
          <Text style={[styles.backLinkText, { color: colors.mutedForeground }]}>
            홈으로 돌아가기
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = queueIdx / total;

  // ── Letter boxes ─────────────────────────────────────────────────────────────
  // Track which typable index we're at
  let typableCount = 0;
  const letterBoxes = wordLetters.map((char, i) => {
    const isTypable = /[A-Z]/.test(char);
    if (!isTypable) {
      return { char, state: "empty" as LetterState, isSpecial: true };
    }
    const myTypableIdx = typableCount++;
    const alreadyTyped = myTypableIdx < typed.length;
    const isActive = myTypableIdx === typed.length && stage === "spelling";
    const flashThis = wrongFlash && isActive;

    return {
      char,
      state: alreadyTyped
        ? ("correct" as LetterState)
        : flashThis
        ? ("wrong-flash" as LetterState)
        : isActive
        ? ("active" as LetterState)
        : ("empty" as LetterState),
      isSpecial: false,
    };
  });

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.background }]}
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          스펠링 연습
        </Text>
        <Text style={[styles.counter, { color: colors.mutedForeground }]}>
          {queueIdx + 1} / {total}
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

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: botPad + 220 },
        ]}
        scrollEnabled={false}
        keyboardShouldPersistTaps="always"
      >
        {/* Stage: correct banner */}
        {stage === "correct" && (
          <View
            style={[
              styles.correctBanner,
              {
                backgroundColor: colors.primary + "18",
                borderColor: colors.primary + "44",
                borderRadius: colors.radius,
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={[styles.correctText, { color: colors.primary }]}>
              정확해요!
            </Text>
          </View>
        )}

        {/* Meaning */}
        <View
          style={[
            styles.meaningBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.meaningLabel, { color: colors.mutedForeground }]}>
            뜻
          </Text>
          <Text style={[styles.meaningText, { color: colors.foreground }]}>
            {currentWord?.meaning}
          </Text>
          {stage === "correct" && (
            <Text style={[styles.wordReveal, { color: colors.primary }]}>
              {currentWord?.word}
            </Text>
          )}
        </View>

        {/* Letter boxes */}
        <Animated.View
          style={[
            styles.letterRow,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {letterBoxes.map((lb, i) => (
            <LetterBox
              key={i}
              char={lb.char}
              state={lb.state}
              isSpecial={lb.isSpecial}
            />
          ))}
        </Animated.View>

        {/* Hint */}
        {stage === "spelling" && typed.length === 0 && (
          <TouchableOpacity onPress={handleHint} style={styles.hintBtn}>
            <Ionicons name="bulb-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
              {hintShown ? "힌트 사용됨" : "첫 글자 힌트"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Next button after correct */}
        {stage === "correct" && (
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.nextBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius },
            ]}
          >
            <Text style={styles.nextBtnText}>
              {queueIdx + 1 < total ? "다음 단어" : "결과 보기"}
            </Text>
            <Ionicons
              name={queueIdx + 1 < total ? "arrow-forward" : "checkmark"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Keyboard */}
      {stage === "spelling" && (
        <View
          style={[
            styles.keyboard,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: botPad + 8,
            },
          ]}
        >
          {ALPHA_ROWS.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((k) => (
                <KeyBtn key={k} label={k} onPress={() => handleKey(k)} />
              ))}
              {ri === 2 && (
                <KeyBtn
                  label="⌫"
                  onPress={handleBackspace}
                  color={colors.mutedForeground}
                />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
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
  progressTrack: { height: 3, width: "100%" },
  progressFill: { height: 3 },
  content: {
    padding: 20,
    gap: 16,
    alignItems: "center",
  },
  correctBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    width: "100%",
  },
  correctText: { fontSize: 15, fontFamily: "NotoSansKR_600SemiBold" },
  meaningBox: {
    width: "100%",
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  meaningLabel: { fontSize: 11, fontFamily: "NotoSansKR_500Medium" },
  meaningText: { fontSize: 22, fontFamily: "NotoSansKR_700Bold", textAlign: "center" },
  wordReveal: { fontSize: 15, fontFamily: "NotoSansKR_400Regular", marginTop: 4 },
  letterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  letterBox: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  letterChar: { fontSize: 20 },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 8,
  },
  hintText: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
    width: "100%",
    justifyContent: "center",
  },
  nextBtnText: { fontSize: 16, fontFamily: "NotoSansKR_700Bold", color: "#fff" },
  // Keyboard
  keyboard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 4,
    gap: 6,
  },
  keyRow: { flexDirection: "row", justifyContent: "center", gap: 4 },
  keyBtn: {
    minWidth: 30,
    height: 44,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    maxWidth: 44,
  },
  keyLabel: { fontSize: 15 },
  // Done screen
  doneScreen: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 40,
  },
  doneCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  doneTitle: { fontSize: 26, fontFamily: "NotoSansKR_700Bold", letterSpacing: -0.5 },
  doneSub: { fontSize: 15, fontFamily: "NotoSansKR_400Regular" },
  scoreBarWrap: { width: "100%", height: 10, borderRadius: 5, overflow: "hidden" },
  scoreBarFill: { height: 10, borderRadius: 5 },
  quizBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 8,
    width: "100%",
    justifyContent: "center",
  },
  quizBtnText: { fontSize: 16, fontFamily: "NotoSansKR_700Bold", color: "#fff" },
  backLink: { padding: 10 },
  backLinkText: { fontSize: 14, fontFamily: "NotoSansKR_400Regular" },
  // Empty / center
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: {
    fontSize: 15,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
});
