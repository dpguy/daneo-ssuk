// WordDetailScreen — full word info with difficulty, pronunciation, related words
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { WordInfoCard } from "@/components/WordInfoCard";
import {
  getLevelLabel,
  getRelatedWords,
  getWordById,
} from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function WordDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isWordSaved, saveWord, unsaveWord, addReview } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const word = getWordById(id ?? "");
  const saved = isWordSaved(id ?? "");

  if (!word) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 20 }}>단어를 찾을 수 없습니다.</Text>
      </View>
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
  const diffLabel = `${levelLabel} · ${word.grade}학년 ${word.unit}단원`;

  const handleBookmark = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (saved) await unsaveWord(word.id);
    else await saveWord(word.id);
  };

  const handleStartMemorize = async () => {
    await addReview(word.id);
    router.push({ pathname: "/memorization", params: { id: word.id } });
  };

  const handlePronunciation = () => {
    Alert.alert("발음", `${word.word}\n${word.pronunciation}`, [{ text: "확인" }]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        {/* Difficulty badge */}
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

          {/* Pronunciation row */}
          <TouchableOpacity
            onPress={handlePronunciation}
            style={[
              styles.pronRow,
              { backgroundColor: colors.secondary, borderRadius: colors.radius },
            ]}
          >
            <Ionicons name="volume-high" size={18} color={colors.primary} />
            <Text style={[styles.pronText, { color: colors.mutedForeground }]}>
              {word.pronunciation}
            </Text>
            <View style={[styles.listenBadge, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.listenText, { color: colors.primary }]}>듣기</Text>
            </View>
          </TouchableOpacity>

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
  pronRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "100%",
  },
  pronText: { flex: 1, fontSize: 15, fontFamily: "NotoSansKR_400Regular" },
  listenBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  listenText: { fontSize: 11, fontFamily: "NotoSansKR_600SemiBold" },
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
});
