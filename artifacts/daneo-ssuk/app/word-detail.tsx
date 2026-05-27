// WordDetailScreen — full word info with difficulty, pronunciation, related words
// Handles both words found in the dataset (by id) and unmatched words from camera scan
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EditCustomWordModal, CustomWordFields } from "@/components/EditCustomWordModal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SpeechBar } from "@/components/SpeechBar";
import { WordInfoCard } from "@/components/WordInfoCard";
import { Word } from "@/constants/mockData";
import {
  getLevelLabel,
  getRelatedWords,
} from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { SpeechSpeed, useSpeech } from "@/hooks/useSpeech";

export default function WordDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // `word` param is passed for unmatched camera words that aren't in the dataset
  const { id, word: wordParam } = useLocalSearchParams<{ id: string; word?: string }>();
  const { isWordSaved, saveWord, unsaveWord, addReview, findWord } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { isSpeaking, speechError, speed, setSpeed, toggle, replay, stop } = useSpeech();

  // Use findWord so custom words (saved by the user) are also resolved
  const word = findWord(id ?? "");
  const saved = isWordSaved(id ?? "");

  // Stop speech when leaving the screen
  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  // ── Fallback screen for words not in the dataset ─────────────────────────────
  if (!word) {
    const unknownWord = wordParam || id || "알 수 없음";
    return (
      <UnknownWordScreen
        word={unknownWord}
        colors={colors}
        topPad={topPad}
        onBack={() => router.back()}
        isSpeaking={isSpeaking}
        speechError={speechError}
        speed={speed}
        onToggle={() => toggle(unknownWord)}
        onSpeedChange={setSpeed}
        onReplay={replay}
      />
    );
  }

  const relatedWords = getRelatedWords(word);

  const levelColor =
    word.level === "elementary"
      ? colors.primary
      : word.level === "middle"
      ? colors.info
      : colors.hard;

  const levelLabel = getLevelLabel(word.level);
  // Custom words show "내 단어장" badge instead of grade/unit info
  const diffLabel = word.isCustom
    ? "내 단어장"
    : `${levelLabel} · ${word.grade}학년 ${word.unit}단원`;

  const handleBookmark = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (saved) await unsaveWord(word.id);
    else await saveWord(word.id);
  };

  const handleStartMemorize = async () => {
    // Ensure word is in the review queue before navigating to memorization
    await addReview(word.id);
    router.push({ pathname: "/memorization", params: { id: word.id } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View
          style={[
            styles.diffBadge,
            { backgroundColor: levelColor + "18", borderColor: levelColor + "44" },
          ]}
        >
          <View style={[styles.diffDot, { backgroundColor: levelColor }]} />
          <Text style={[styles.diffText, { color: levelColor }]}>{diffLabel}</Text>
        </View>
        <TouchableOpacity onPress={handleBookmark} hitSlop={12}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={24}
            color={saved ? colors.accent : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Word hero */}
        <View style={styles.hero}>
          <Text style={[styles.mainWord, { color: colors.foreground }]}>{word.word}</Text>

          {/* SpeechBar — tap to play/stop, speed 0.8/1.0/1.2, replay */}
          <SpeechBar
            pronunciation={word.pronunciation}
            isSpeaking={isSpeaking}
            speechError={speechError}
            speed={speed}
            onToggle={() => toggle(word.word)}
            onSpeedChange={setSpeed}
            onReplay={replay}
          />

          {/* Meaning box */}
          <View
            style={[
              styles.meaningBox,
              {
                backgroundColor: colors.primary + "0D",
                borderRadius: colors.radius,
                borderColor: colors.primary + "33",
              },
            ]}
          >
            <Text style={[styles.meaningText, { color: colors.foreground }]}>{word.meaning}</Text>
          </View>
        </View>

        {/* Info cards */}
        <View style={styles.cards}>
          <WordInfoCard
            title="예문"
            content={word.example}
            highlight={word.exampleKorean}
            color={colors.primary}
          />
          <WordInfoCard
            title="관용구"
            content={word.idiom}
            highlight={word.idiomMeaning}
            color={colors.info}
          />
          <WordInfoCard
            title="암기 팁"
            content={word.memoryTip}
            color={colors.accent}
          />
        </View>

        {/* Related words */}
        {relatedWords.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={[styles.relatedTitle, { color: colors.foreground }]}>관련 단어</Text>
            <View style={styles.relatedList}>
              {relatedWords.map((rw) => (
                <TouchableOpacity
                  key={rw.id}
                  onPress={() =>
                    router.push({ pathname: "/word-detail", params: { id: rw.id } })
                  }
                  activeOpacity={0.8}
                  style={[
                    styles.relatedCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <View style={styles.relatedLeft}>
                    <Text style={[styles.relatedWord, { color: colors.foreground }]}>
                      {rw.word}
                    </Text>
                    <Text style={[styles.relatedMeaning, { color: colors.mutedForeground }]}>
                      {rw.meaning}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.relatedLevelBadge,
                      {
                        backgroundColor:
                          rw.level === "elementary"
                            ? colors.primary + "22"
                            : rw.level === "middle"
                            ? colors.info + "22"
                            : colors.hard + "22",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.relatedLevelText,
                        {
                          color:
                            rw.level === "elementary"
                              ? colors.primary
                              : rw.level === "middle"
                              ? colors.info
                              : colors.hard,
                        },
                      ]}
                    >
                      {getLevelLabel(rw.level)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom action bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 12,
          },
        ]}
      >
        <View style={styles.bottomRow}>
          <PrimaryButton
            title={saved ? "저장됨" : "저장하기"}
            onPress={handleBookmark}
            variant={saved ? "secondary" : "ghost"}
            style={styles.saveBtn}
          />
          <PrimaryButton
            title="암기 시작"
            onPress={handleStartMemorize}
            style={styles.memorizeBtn}
          />
        </View>
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/spelling", params: { id: word.id } })
          }
          style={[
            styles.spellingBtn,
            {
              borderColor: colors.primary + "55",
              backgroundColor: colors.primary + "0D",
              borderRadius: colors.radius,
            },
          ]}
        >
          <Ionicons name="text" size={16} color={colors.primary} />
          <Text style={[styles.spellingBtnText, { color: colors.primary }]}>
            스펠링 연습
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Fallback screen for unmatched words ──────────────────────────────────────
function UnknownWordScreen({
  word,
  colors,
  topPad,
  onBack,
  isSpeaking,
  speechError,
  speed,
  onToggle,
  onSpeedChange,
  onReplay,
}: {
  word: string;
  colors: ReturnType<typeof useColors>;
  topPad: number;
  onBack: () => void;
  isSpeaking: boolean;
  speechError: boolean;
  speed: SpeechSpeed;
  onToggle: () => void;
  onSpeedChange: (s: SpeechSpeed) => void;
  onReplay: () => void;
}) {
  const router = useRouter();
  const { saveCustomWord } = useApp();
  const [editVisible, setEditVisible] = useState(false);

  /** Opens the edit modal so the user can fill in meaning, example, and memory tip. */
  const handleSaveCustom = () => setEditVisible(true);

  /**
   * Called when the user confirms in EditCustomWordModal.
   * Builds a full Word object with sensible defaults, saves it to custom_words
   * and the review schedule, then replaces this screen with the full Word Detail.
   */
  const handleModalSave = async (fields: CustomWordFields) => {
    const newId = `custom_${Date.now()}`;
    const newWord: Word = {
      id: newId,
      word,
      pronunciation: "",
      meaning: fields.meaning.trim() || "뜻을 직접 입력해 주세요",
      example: fields.example.trim() || "I want to learn this word.",
      exampleKorean: fields.exampleKorean.trim() || "나는 이 단어를 배우고 싶다.",
      idiom: "",
      idiomMeaning: "",
      memoryTip: fields.memoryTip.trim() || "직접 뜻을 입력하면 더 오래 기억할 수 있어요.",
      difficulty: "custom",
      level: "elementary",
      grade: 0,
      unit: 0,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    await saveCustomWord(newWord);
    setEditVisible(false);
    // Replace this screen with the full Word Detail for the newly saved custom word
    router.replace({ pathname: "/word-detail", params: { id: newId } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View
          style={[
            styles.diffBadge,
            { backgroundColor: colors.mutedForeground + "18", borderColor: colors.mutedForeground + "44" },
          ]}
        >
          <View style={[styles.diffDot, { backgroundColor: colors.mutedForeground }]} />
          <Text style={[styles.diffText, { color: colors.mutedForeground }]}>미등록 단어</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Word hero */}
        <View style={styles.hero}>
          <Text style={[styles.mainWord, { color: colors.foreground }]}>{word}</Text>

          {/* TTS still works for unmatched words */}
          <SpeechBar
            pronunciation=""
            isSpeaking={isSpeaking}
            speechError={speechError}
            speed={speed}
            onToggle={onToggle}
            onSpeedChange={onSpeedChange}
            onReplay={onReplay}
          />
        </View>

        {/* Not in dataset notice */}
        <View
          style={[
            styles.unknownCard,
            {
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Ionicons name="help-circle-outline" size={40} color={colors.mutedForeground} />
          <Text style={[styles.unknownTitle, { color: colors.foreground }]}>
            아직 단어장에 없는 단어입니다
          </Text>
          <Text style={[styles.unknownSub, { color: colors.mutedForeground }]}>
            "{word}"은 현재 단어쑥 데이터베이스에 등록되어 있지 않습니다.{"\n"}
            커스텀 단어로 직접 추가하거나, 업데이트를 기다려주세요.
          </Text>
        </View>

        {/* Suggestions */}
        <View
          style={[
            styles.suggestionCard,
            {
              backgroundColor: colors.primary + "0D",
              borderColor: colors.primary + "33",
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.suggestionTitle, { color: colors.foreground }]}>
            💡 이 단어에 대해 더 알아보려면
          </Text>
          <Text style={[styles.suggestionText, { color: colors.mutedForeground }]}>
            • 발음 버튼을 눌러 원어민 발음을 들어보세요{"\n"}
            • 영어 사전 앱에서 뜻을 찾아보세요{"\n"}
            • 커스텀 단어로 추가해 직접 관리하세요
          </Text>
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === "web" ? 34 : 12,
          },
        ]}
      >
        <PrimaryButton
          title="커스텀 단어로 저장하기"
          onPress={handleSaveCustom}
        />
      </View>

      {/* Edit modal — shown when the user taps the save button */}
      <EditCustomWordModal
        visible={editVisible}
        wordText={word}
        onSave={handleModalSave}
        onClose={() => setEditVisible(false)}
      />
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
  diffBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
  },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  diffText: { fontSize: 12, fontFamily: "NotoSansKR_600SemiBold" },
  content: { padding: 20, gap: 20 },
  hero: { alignItems: "center", gap: 14, paddingVertical: 8 },
  mainWord: {
    fontSize: 40,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -2,
    textAlign: "center",
  },
  meaningBox: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
    width: "100%",
    alignItems: "center",
  },
  meaningText: { fontSize: 22, fontFamily: "NotoSansKR_700Bold", textAlign: "center" },
  cards: { gap: 10 },
  relatedSection: { gap: 12 },
  relatedTitle: { fontSize: 17, fontFamily: "NotoSansKR_700Bold" },
  relatedList: { gap: 8 },
  relatedCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  relatedLeft: { flex: 1, gap: 2 },
  relatedWord: { fontSize: 16, fontFamily: "NotoSansKR_600SemiBold" },
  relatedMeaning: { fontSize: 13, fontFamily: "NotoSansKR_400Regular" },
  relatedLevelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  relatedLevelText: { fontSize: 11, fontFamily: "NotoSansKR_700Bold" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bottomRow: { flexDirection: "row", gap: 10 },
  saveBtn: { flex: 1 },
  memorizeBtn: { flex: 2 },
  spellingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    paddingVertical: 10,
  },
  spellingBtnText: { fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },
  // Unknown word styles
  unknownCard: {
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  unknownTitle: { fontSize: 17, fontFamily: "NotoSansKR_700Bold", textAlign: "center" },
  unknownSub: {
    fontSize: 14,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  suggestionCard: {
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  suggestionTitle: { fontSize: 15, fontFamily: "NotoSansKR_600SemiBold" },
  suggestionText: { fontSize: 13, fontFamily: "NotoSansKR_400Regular", lineHeight: 22 },
});
