// SpellingScreen — letter-by-letter spelling + wrong review + 4-choice meaning quiz
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

import { MOCK_WORDS, Word } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ALPHA_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const WRONG_THRESHOLD = 3; // show review panel after this many wrong taps

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildMeaningOptions(correct: Word): string[] {
  const distractors = MOCK_WORDS.filter((w) => w.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((w) => w.meaning);
  return shuffle([correct.meaning, ...distractors]);
}

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
  isSpecial?: boolean;
}) {
  const colors = useColors();
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === "wrong-flash") {
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: false }),
        Animated.timing(flash, { toValue: 0, duration: 200, useNativeDriver: false }),
      ]).start();
    }
  }, [state]);

  const bg = isSpecial
    ? "transparent"
    : state === "correct"
    ? colors.primary + "33"
    : state === "active"
    ? colors.accent + "22"
    : colors.secondary;

  const borderColor = isSpecial
    ? "transparent"
    : state === "correct"
    ? colors.primary
    : state === "active"
    ? colors.accent
    : state === "wrong-flash"
    ? colors.forgot
    : colors.border;

  return (
    <Animated.View
      style={[
        styles.letterBox,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: isSpecial ? 0 : 2,
          borderRadius: 8,
          opacity:
            state === "wrong-flash"
              ? flash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] })
              : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.letterChar,
          {
            color:
              state === "correct"
                ? colors.primary
                : state === "active"
                ? colors.accent
                : colors.mutedForeground,
            fontFamily: "NotoSansKR_700Bold",
          },
        ]}
      >
        {isSpecial
          ? char
          : state === "correct"
          ? char.toUpperCase()
          : state === "active"
          ? "_"
          : ""}
      </Text>
    </Animated.View>
  );
}

// ── Key button ────────────────────────────────────────────────────────────────

function KeyBtn({
  label,
  onPress,
  color,
}: {
  label: string;
  onPress: () => void;
  color?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.keyBtn,
        {
          backgroundColor: color
            ? color + "22"
            : pressed
            ? colors.primary + "22"
            : colors.secondary,
          borderColor: color ? color + "55" : colors.border,
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

// ── Meaning option button ─────────────────────────────────────────────────────

type OptionState = "idle" | "correct" | "wrong";

function MeaningOption({
  label,
  state,
  onPress,
  disabled,
}: {
  label: string;
  state: OptionState;
  onPress: () => void;
  disabled: boolean;
}) {
  const colors = useColors();
  const bg =
    state === "correct"
      ? colors.primary + "22"
      : state === "wrong"
      ? colors.forgot + "18"
      : colors.card;
  const border =
    state === "correct"
      ? colors.primary
      : state === "wrong"
      ? colors.forgot
      : colors.border;
  const textColor =
    state === "correct"
      ? colors.primary
      : state === "wrong"
      ? colors.forgot
      : colors.foreground;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[
        styles.optionBtn,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: 12,
        },
      ]}
    >
      {state !== "idle" && (
        <Ionicons
          name={state === "correct" ? "checkmark-circle" : "close-circle"}
          size={18}
          color={state === "correct" ? colors.primary : colors.forgot}
        />
      )}
      <Text style={[styles.optionText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Stages ────────────────────────────────────────────────────────────────────

type Stage = "spelling" | "review" | "meaning-quiz" | "quiz-result" | "done";

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SpellingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, ids } = useLocalSearchParams<{ id?: string; ids?: string }>();
  const { reviews, customWords } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Merge dataset words with user's custom words for all ID lookups
  const allWords = useMemo(() => [...MOCK_WORDS, ...customWords], [customWords]);

  // ── Build word queue ──────────────────────────────────────────────────────
  const wordQueue: Word[] = useMemo(() => {
    if (ids) {
      return ids
        .split(",")
        .map((wid) => allWords.find((w) => w.id === wid))
        .filter(Boolean) as Word[];
    }
    if (id) {
      const w = allWords.find((w) => w.id === id);
      return w ? [w] : [];
    }
    return reviews
      .map((r) => allWords.find((w) => w.id === r.wordId))
      .filter(Boolean) as Word[];
  }, [ids, id, reviews, allWords]);

  // ── Per-word state ────────────────────────────────────────────────────────
  const [queueIdx, setQueueIdx] = useState(0);
  const [stage, setStage] = useState<Stage>("spelling");
  const [typed, setTyped] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0); // resets each new position
  const [wrongFlash, setWrongFlash] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const { anim: shakeAnim, shake } = useShake();

  // ── Meaning quiz state ────────────────────────────────────────────────────
  const [meaningOptions, setMeaningOptions] = useState<string[]>([]);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [quizCorrect, setQuizCorrect] = useState(false);

  // ── Score ─────────────────────────────────────────────────────────────────
  const [spellingCorrectCount, setSpellingCorrectCount] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);

  const currentWord = wordQueue[queueIdx];
  const total = wordQueue.length;

  const wordLetters = currentWord ? currentWord.word.toUpperCase().split("") : [];
  const typableIndices = wordLetters
    .map((c, i) => (/[A-Z]/.test(c) ? i : -1))
    .filter((i) => i >= 0);
  const currentAbsPos = typableIndices[typed.length] ?? wordLetters.length;
  const isWordDone = typed.length === typableIndices.length;

  // ── Speech ────────────────────────────────────────────────────────────────
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

  // ── Reset for new word ────────────────────────────────────────────────────
  const resetForWord = () => {
    setTyped([]);
    setStage("spelling");
    setWrongFlash(false);
    setWrongAttempts(0);
    setHintShown(false);
    setSelectedMeaning(null);
    setQuizCorrect(false);
  };

  // ── Spelling input ────────────────────────────────────────────────────────
  const handleKey = (letter: string) => {
    if (stage !== "spelling" || isWordDone || !currentWord) return;

    const expected = wordLetters[currentAbsPos];
    if (letter.toUpperCase() === expected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newTyped = [...typed, letter.toUpperCase()];
      setTyped(newTyped);
      setWrongFlash(false);
      setWrongAttempts(0);

      if (newTyped.length === typableIndices.length) {
        // Spelling complete → go to meaning quiz
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSpellingCorrectCount((c) => c + 1);
        const opts = buildMeaningOptions(currentWord);
        setMeaningOptions(opts);
        setStage("meaning-quiz");
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWrongFlash(true);
      shake();
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setTimeout(() => setWrongFlash(false), 400);

      // After threshold wrong attempts → show review panel
      if (newAttempts >= WRONG_THRESHOLD) {
        setStage("review");
        setWrongAttempts(0);
      }
    }
  };

  const handleBackspace = () => {
    if (typed.length === 0) return;
    setTyped((prev) => prev.slice(0, -1));
    setWrongAttempts(0);
  };

  const handleHint = () => {
    if (hintShown || typed.length > 0) return;
    setHintShown(true);
    handleKey(wordLetters[typableIndices[0]]);
  };

  // ── Meaning quiz ──────────────────────────────────────────────────────────
  const handleMeaningSelect = (option: string) => {
    if (selectedMeaning !== null || !currentWord) return;
    setSelectedMeaning(option);
    const correct = option === currentWord.meaning;
    setQuizCorrect(correct);
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setQuizCorrectCount((c) => c + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setStage("quiz-result");
  };

  // ── Advance ───────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (queueIdx + 1 < total) {
      setQueueIdx((i) => i + 1);
      resetForWord();
    } else {
      setStage("done");
    }
  };

  // ── Go to quiz ────────────────────────────────────────────────────────────
  const handleGoQuiz = () => {
    const learnedIds = reviews.map((r) => r.wordId).join(",");
    if (learnedIds) {
      router.replace({ pathname: "/quiz", params: { ids: learnedIds } });
    } else {
      router.back();
    }
  };

  // ── Empty state ───────────────────────────────────────────────────────────
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

  // ── Done screen ───────────────────────────────────────────────────────────
  if (stage === "done") {
    return (
      <View
        style={[
          styles.screen,
          styles.doneScreen,
          { backgroundColor: colors.background, paddingBottom: botPad + 24 },
        ]}
      >
        <View style={[styles.doneCircle, { backgroundColor: colors.accent + "22" }]}>
          <Ionicons name="star" size={56} color={colors.accent} />
        </View>
        <Text style={[styles.doneTitle, { color: colors.foreground }]}>연습 완료!</Text>
        <View style={styles.doneStats}>
          <View style={[styles.doneStat, { backgroundColor: colors.primary + "18", borderRadius: 12 }]}>
            <Text style={[styles.doneStatVal, { color: colors.primary }]}>
              {spellingCorrectCount}/{total}
            </Text>
            <Text style={[styles.doneStatLabel, { color: colors.mutedForeground }]}>스펠링</Text>
          </View>
          <View style={[styles.doneStat, { backgroundColor: colors.accent + "18", borderRadius: 12 }]}>
            <Text style={[styles.doneStatVal, { color: colors.accent }]}>
              {quizCorrectCount}/{total}
            </Text>
            <Text style={[styles.doneStatLabel, { color: colors.mutedForeground }]}>뜻 퀴즈</Text>
          </View>
        </View>

        <View style={[styles.scoreBarWrap, { backgroundColor: colors.secondary }]}>
          <View
            style={[
              styles.scoreBarFill,
              {
                width: `${((spellingCorrectCount + quizCorrectCount) / (total * 2)) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        <TouchableOpacity
          onPress={handleGoQuiz}
          style={[styles.quizBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
        >
          <Ionicons name="shuffle" size={20} color="#fff" />
          <Text style={styles.quizBtnText}>랜덤 퀴즈로 확인하기</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={[styles.backLinkText, { color: colors.mutedForeground }]}>
            홈으로 돌아가기
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Letter boxes ──────────────────────────────────────────────────────────
  let typableCount = 0;
  const letterBoxes = wordLetters.map((char, i) => {
    const isTypable = /[A-Z]/.test(char);
    if (!isTypable) return { char, state: "empty" as LetterState, isSpecial: true };
    const myIdx = typableCount++;
    const filled = myIdx < typed.length;
    const isActive = myIdx === typed.length && stage === "spelling";
    const flash = wrongFlash && isActive;
    return {
      char,
      state: filled
        ? ("correct" as LetterState)
        : flash
        ? ("wrong-flash" as LetterState)
        : isActive
        ? ("active" as LetterState)
        : ("empty" as LetterState),
      isSpecial: false,
    };
  });

  const progress = queueIdx / total;
  const isQuizDone = stage === "quiz-result";
  const isReview = stage === "review";
  const isMeaningQuiz = stage === "meaning-quiz" || isQuizDone;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isMeaningQuiz ? "뜻 퀴즈" : isReview ? "복습" : "스펠링 연습"}
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

      {/* ── REVIEW PANEL (오답 3회) ─────────────────────────────────────────── */}
      {isReview && currentWord && (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: botPad + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Wrong banner */}
          <View
            style={[
              styles.wrongBanner,
              { backgroundColor: colors.forgot + "18", borderColor: colors.forgot + "44", borderRadius: colors.radius },
            ]}
          >
            <Ionicons name="close-circle" size={20} color={colors.forgot} />
            <Text style={[styles.wrongBannerText, { color: colors.forgot }]}>
              틀렸어요! 단어를 다시 확인하세요
            </Text>
          </View>

          {/* Word reveal card */}
          <View
            style={[
              styles.reviewCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>단어</Text>
            <Text style={[styles.reviewWord, { color: colors.primary }]}>
              {currentWord.word}
            </Text>
            <View style={styles.pronRow}>
              <Text style={[styles.reviewPron, { color: colors.mutedForeground }]}>
                {currentWord.pronunciation}
              </Text>
              <TouchableOpacity
                onPress={() => handleSpeak(currentWord.word)}
                hitSlop={12}
                style={[styles.pronSpeakBtn, { backgroundColor: colors.primary + "18" }]}
              >
                <Ionicons name="volume-high" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>뜻</Text>
            <Text style={[styles.reviewMeaning, { color: colors.foreground }]}>
              {currentWord.meaning}
            </Text>
          </View>

          {/* Memory tip */}
          <View
            style={[
              styles.tipCard,
              { backgroundColor: colors.accent + "14", borderColor: colors.accent + "44", borderRadius: colors.radius },
            ]}
          >
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={16} color={colors.accent} />
              <Text style={[styles.tipTitle, { color: colors.accent }]}>암기 팁</Text>
            </View>
            <Text style={[styles.tipText, { color: colors.foreground }]}>
              {currentWord.memoryTip}
            </Text>
          </View>

          {/* Try again button */}
          <TouchableOpacity
            onPress={() => {
              setTyped([]);
              setWrongAttempts(0);
              setWrongFlash(false);
              setStage("spelling");
            }}
            style={[
              styles.retryBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius },
            ]}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryBtnText}>다시 시도</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── MEANING QUIZ ───────────────────────────────────────────────────── */}
      {isMeaningQuiz && currentWord && (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: botPad + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Correct spelling banner */}
          <View
            style={[
              styles.correctBanner,
              { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44", borderRadius: colors.radius },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={[styles.correctText, { color: colors.primary }]}>
              스펠링 정확해요!
            </Text>
          </View>

          {/* Word display */}
          <View
            style={[
              styles.quizWordCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            <Text style={[styles.quizWordLabel, { color: colors.mutedForeground }]}>
              이 단어의 뜻은?
            </Text>
            <Text style={[styles.quizWord, { color: colors.foreground }]}>
              {currentWord.word}
            </Text>
            <View style={styles.pronRow}>
              <Text style={[styles.quizPron, { color: colors.mutedForeground }]}>
                {currentWord.pronunciation}
              </Text>
              <TouchableOpacity
                onPress={() => handleSpeak(currentWord.word)}
                hitSlop={12}
                style={[styles.pronSpeakBtn, { backgroundColor: colors.primary + "18" }]}
              >
                <Ionicons name="volume-high" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 4 meaning options */}
          <View style={styles.optionsList}>
            {meaningOptions.map((opt, i) => {
              let state: OptionState = "idle";
              if (selectedMeaning !== null) {
                if (opt === currentWord.meaning) state = "correct";
                else if (opt === selectedMeaning) state = "wrong";
              }
              return (
                <MeaningOption
                  key={i}
                  label={opt}
                  state={state}
                  onPress={() => handleMeaningSelect(opt)}
                  disabled={selectedMeaning !== null}
                />
              );
            })}
          </View>

          {/* Result feedback + next button */}
          {isQuizDone && (
            <>
              <View
                style={[
                  styles.resultFeedback,
                  {
                    backgroundColor: quizCorrect ? colors.primary + "14" : colors.forgot + "14",
                    borderColor: quizCorrect ? colors.primary + "44" : colors.forgot + "44",
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <Ionicons
                  name={quizCorrect ? "checkmark-circle" : "close-circle"}
                  size={22}
                  color={quizCorrect ? colors.primary : colors.forgot}
                />
                <Text
                  style={[
                    styles.resultFeedbackText,
                    { color: quizCorrect ? colors.primary : colors.forgot },
                  ]}
                >
                  {quizCorrect ? "정답입니다!" : `정답: ${currentWord.meaning}`}
                </Text>
              </View>

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
            </>
          )}
        </ScrollView>
      )}

      {/* ── SPELLING STAGE ─────────────────────────────────────────────────── */}
      {stage === "spelling" && (
        <>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: botPad + 220 }]}
            scrollEnabled={false}
            keyboardShouldPersistTaps="always"
          >
            {/* Wrong attempt counter hint */}
            {wrongAttempts > 0 && (
              <View
                style={[
                  styles.attemptsBar,
                  { backgroundColor: colors.forgot + "14", borderRadius: colors.radius },
                ]}
              >
                <Text style={[styles.attemptsText, { color: colors.forgot }]}>
                  오답 {wrongAttempts}/{WRONG_THRESHOLD} — {WRONG_THRESHOLD - wrongAttempts}번 더 틀리면 복습 힌트를 드릴게요
                </Text>
              </View>
            )}

            {/* Meaning */}
            <View
              style={[
                styles.meaningBox,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <Text style={[styles.meaningLabel, { color: colors.mutedForeground }]}>뜻</Text>
              <Text style={[styles.meaningText, { color: colors.foreground }]}>
                {currentWord?.meaning}
              </Text>
            </View>

            {/* Letter boxes */}
            <Animated.View
              style={[styles.letterRow, { transform: [{ translateX: shakeAnim }] }]}
            >
              {letterBoxes.map((lb, i) => (
                <LetterBox key={i} char={lb.char} state={lb.state} isSpecial={lb.isSpecial} />
              ))}
            </Animated.View>

            {/* Hint button */}
            {typed.length === 0 && (
              <TouchableOpacity onPress={handleHint} style={styles.hintBtn}>
                <Ionicons name="bulb-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
                  {hintShown ? "힌트 사용됨" : "첫 글자 힌트"}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Custom keyboard */}
          <View
            style={[
              styles.keyboard,
              { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: botPad + 8 },
            ]}
          >
            {ALPHA_ROWS.map((row, ri) => (
              <View key={ri} style={styles.keyRow}>
                {row.map((k) => (
                  <KeyBtn key={k} label={k} onPress={() => handleKey(k)} />
                ))}
                {ri === 2 && (
                  <KeyBtn label="⌫" onPress={handleBackspace} color={colors.mutedForeground} />
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
  content: { padding: 20, gap: 14, alignItems: "center" },

  // Wrong banner
  wrongBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    width: "100%",
  },
  wrongBannerText: { flex: 1, fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },

  // Review card
  reviewCard: {
    width: "100%",
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  reviewLabel: { fontSize: 11, fontFamily: "NotoSansKR_500Medium" },
  reviewWord: { fontSize: 32, fontFamily: "NotoSansKR_700Bold", letterSpacing: -1 },
  reviewPron: { fontSize: 14, fontFamily: "NotoSansKR_400Regular" },
  pronRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pronSpeakBtn: { padding: 6, borderRadius: 8 },
  reviewDivider: { width: "100%", height: 1, marginVertical: 8 },
  reviewMeaning: { fontSize: 20, fontFamily: "NotoSansKR_700Bold", textAlign: "center" },

  // Tip card
  tipCard: {
    width: "100%",
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  tipTitle: { fontSize: 13, fontFamily: "NotoSansKR_700Bold" },
  tipText: { fontSize: 13, fontFamily: "NotoSansKR_400Regular", lineHeight: 20 },

  // Retry button
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    width: "100%",
  },
  retryBtnText: { fontSize: 16, fontFamily: "NotoSansKR_700Bold", color: "#fff" },

  // Correct banner
  correctBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    width: "100%",
  },
  correctText: { fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },

  // Quiz word card
  quizWordCard: {
    width: "100%",
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  quizWordLabel: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },
  quizWord: { fontSize: 30, fontFamily: "NotoSansKR_700Bold", letterSpacing: -1 },
  quizPron: { fontSize: 13, fontFamily: "NotoSansKR_400Regular" },

  // Options
  optionsList: { width: "100%", gap: 10 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: "100%",
  },
  optionText: { flex: 1, fontSize: 15, fontFamily: "NotoSansKR_600SemiBold" },

  // Result feedback
  resultFeedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
  },
  resultFeedbackText: { flex: 1, fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },

  // Next button
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    width: "100%",
  },
  nextBtnText: { fontSize: 16, fontFamily: "NotoSansKR_700Bold", color: "#fff" },

  // Spelling stage
  attemptsBar: { paddingHorizontal: 14, paddingVertical: 8, width: "100%" },
  attemptsText: { fontSize: 12, fontFamily: "NotoSansKR_400Regular", textAlign: "center" },
  meaningBox: { width: "100%", borderWidth: 1, padding: 20, alignItems: "center", gap: 4 },
  meaningLabel: { fontSize: 11, fontFamily: "NotoSansKR_500Medium" },
  meaningText: { fontSize: 22, fontFamily: "NotoSansKR_700Bold", textAlign: "center" },
  letterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  letterBox: { width: 36, height: 44, alignItems: "center", justifyContent: "center" },
  letterChar: { fontSize: 20 },
  hintBtn: { flexDirection: "row", alignItems: "center", gap: 5, padding: 8 },
  hintText: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },

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
    height: 44,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    maxWidth: 44,
  },
  keyLabel: { fontSize: 15 },

  // Done screen
  doneScreen: { alignItems: "center", justifyContent: "center", gap: 16, padding: 40 },
  doneCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  doneTitle: { fontSize: 26, fontFamily: "NotoSansKR_700Bold", letterSpacing: -0.5 },
  doneStats: { flexDirection: "row", gap: 14 },
  doneStat: { padding: 16, alignItems: "center", gap: 4, minWidth: 80 },
  doneStatVal: { fontSize: 22, fontFamily: "NotoSansKR_700Bold" },
  doneStatLabel: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },
  scoreBarWrap: { width: "100%", height: 10, borderRadius: 5, overflow: "hidden" },
  scoreBarFill: { height: 10, borderRadius: 5 },
  quizBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 4,
    width: "100%",
  },
  quizBtnText: { fontSize: 16, fontFamily: "NotoSansKR_700Bold", color: "#fff" },
  backLink: { padding: 10 },
  backLinkText: { fontSize: 14, fontFamily: "NotoSansKR_400Regular" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: {
    fontSize: 15,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
});
