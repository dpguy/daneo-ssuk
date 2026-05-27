// MemorizationScreen — flashcard with spaced repetition buttons
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FlashCard } from "@/components/FlashCard";
import { MOCK_WORDS, getWordById } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useSpeech } from "@/hooks/useSpeech";

type Difficulty = "easy" | "hard" | "forgot";

export default function MemorizationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const { updateReview, getTodayReviews, addReview } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { isSpeaking, speechError, speed, setSpeed, speak, replay, stop } = useSpeech();

  // If mode is "review", show the full today's review queue
  const reviewQueue = mode === "review"
    ? getTodayReviews().map((r) => MOCK_WORDS.find((w) => w.id === r.wordId)).filter(Boolean)
    : null;

  const [queueIndex, setQueueIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const prevWordId = useRef<string | null>(null);

  const currentWord = reviewQueue
    ? reviewQueue[queueIndex]
    : getWordById(id ?? "");

  // Auto-play pronunciation when word changes
  useEffect(() => {
    if (!currentWord) return;
    if (prevWordId.current === currentWord.id) return;
    prevWordId.current = currentWord.id;
    // Small delay so the card renders before speech starts
    const t = setTimeout(() => {
      speak(currentWord.word);
    }, 300);
    return () => clearTimeout(t);
  }, [currentWord?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  const handleDifficulty = async (diff: Difficulty) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stop();
    if (currentWord) {
      await updateReview(currentWord.id, diff);
    }

    if (reviewQueue) {
      const nextIndex = queueIndex + 1;
      if (nextIndex < reviewQueue.length) {
        setQueueIndex(nextIndex);
        setFlipped(false);
      } else {
        setDone(true);
      }
    } else {
      setDone(true);
    }
  };

  if (!currentWord && !done) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 20 }}>단어를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const total = reviewQueue ? reviewQueue.length : 1;
  const progress = reviewQueue ? queueIndex / total : 0;

  if (done) {
    const practicedIds = reviewQueue
      ? reviewQueue.map((w) => w!.id).join(",")
      : id ?? "";

    return (
      <View style={[styles.screen, styles.doneScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.doneCircle, { backgroundColor: colors.primary + "22" }]}>
          <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
        </View>
        <Text style={[styles.doneTitle, { color: colors.foreground }]}>학습 완료!</Text>
        <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
          {total}개 단어를 학습했습니다
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/spelling", params: { ids: practicedIds } })
          }
          style={[
            styles.spellingBtn,
            { backgroundColor: colors.accent + "22", borderColor: colors.accent + "55", borderRadius: colors.radius },
          ]}
        >
          <Ionicons name="text" size={18} color={colors.accent} />
          <Text style={[styles.spellingBtnText, { color: colors.accent }]}>
            스펠링 연습하기
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/quiz", params: { ids: practicedIds } })
          }
          style={[
            styles.quizBtn,
            { backgroundColor: colors.primary, borderRadius: colors.radius },
          ]}
        >
          <Ionicons name="shuffle" size={18} color="#fff" />
          <Text style={styles.quizBtnText}>랜덤 퀴즈로 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.doneBtn}>
          <Text style={[styles.doneBtnText, { color: colors.mutedForeground }]}>나중에</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => { stop(); router.back(); }} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {mode === "review" ? "복습" : "암기"}
        </Text>
        <Text style={[styles.counter, { color: colors.mutedForeground }]}>
          {reviewQueue ? `${queueIndex + 1} / ${total}` : "1 / 1"}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%` as any,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>

      <View style={styles.content}>
        {/* Flashcard with embedded speech controls */}
        {currentWord && (
          <FlashCard
            word={currentWord}
            onFlip={setFlipped}
            speechProps={{
              isSpeaking,
              speechError,
              speed,
              onToggle: () => currentWord && (isSpeaking ? stop() : speak(currentWord.word)),
              onSpeedChange: setSpeed,
              onReplay: replay,
            }}
          />
        )}

        {/* Hint */}
        {!flipped && (
          <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>
            카드를 탭하면 의미가 나옵니다
          </Text>
        )}

        {/* Spaced repetition buttons — shown after flip */}
        {flipped && (
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={() => handleDifficulty("forgot")}
              style={[styles.diffBtn, { backgroundColor: colors.forgot + "18", borderColor: colors.forgot + "55", borderRadius: colors.radius }]}
            >
              <Ionicons name="close-circle" size={20} color={colors.forgot} />
              <Text style={[styles.diffLabel, { color: colors.forgot }]}>모름</Text>
              <Text style={[styles.diffInterval, { color: colors.forgot + "88" }]}>1일</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDifficulty("hard")}
              style={[styles.diffBtn, { backgroundColor: colors.hard + "18", borderColor: colors.hard + "55", borderRadius: colors.radius }]}
            >
              <Ionicons name="alert-circle" size={20} color={colors.hard} />
              <Text style={[styles.diffLabel, { color: colors.hard }]}>어려움</Text>
              <Text style={[styles.diffInterval, { color: colors.hard + "88" }]}>3일</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDifficulty("easy")}
              style={[styles.diffBtn, { backgroundColor: colors.easy + "18", borderColor: colors.easy + "55", borderRadius: colors.radius }]}
            >
              <Ionicons name="checkmark-circle" size={20} color={colors.easy} />
              <Text style={[styles.diffLabel, { color: colors.easy }]}>쉬움</Text>
              <Text style={[styles.diffInterval, { color: colors.easy + "88" }]}>7일+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  headerTitle: {
    fontSize: 17,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  counter: {
    fontSize: 14,
    fontFamily: "NotoSansKR_500Medium",
  },
  progressTrack: {
    height: 3,
    width: "100%",
  },
  progressFill: {
    height: 3,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
    justifyContent: "center",
  },
  tapHint: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
  },
  diffBtn: {
    flex: 1,
    borderWidth: 1.5,
    alignItems: "center",
    padding: 12,
    gap: 4,
  },
  diffLabel: {
    fontSize: 13,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  diffInterval: {
    fontSize: 11,
    fontFamily: "NotoSansKR_400Regular",
  },
  doneScreen: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 40,
  },
  doneCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  doneTitle: {
    fontSize: 28,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -0.5,
  },
  doneSub: {
    fontSize: 15,
    fontFamily: "NotoSansKR_400Regular",
  },
  doneBtn: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    marginTop: 4,
  },
  doneBtnText: {
    fontSize: 15,
    fontFamily: "NotoSansKR_400Regular",
  },
  spellingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    paddingHorizontal: 28,
    paddingVertical: 13,
    width: "100%",
  },
  spellingBtnText: {
    fontSize: 15,
    fontFamily: "NotoSansKR_700Bold",
  },
  quizBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    width: "100%",
  },
  quizBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "NotoSansKR_700Bold",
  },
});
