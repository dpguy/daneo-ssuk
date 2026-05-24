// WordDetailScreen — English word, pronunciation, meaning, example, idiom, memory tip, bookmark, start memorization
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
import { getWordById } from "@/constants/mockData";
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

  const levelColor =
    word.level === "elementary"
      ? colors.primary
      : word.level === "middle"
      ? colors.info
      : colors.hard;

  const levelLabel =
    word.level === "elementary" ? "초등학교" : word.level === "middle" ? "중학교" : "고등학교";

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
    Alert.alert("발음 듣기", `"${word.word}" [${word.pronunciation}]`, [{ text: "확인" }]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={[styles.levelPill, { backgroundColor: levelColor + "22" }]}>
          <Text style={[styles.levelPillText, { color: levelColor }]}>
            {levelLabel} · {word.grade}학년 {word.unit}단원
          </Text>
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
        <View style={styles.wordHero}>
          <Text style={[styles.mainWord, { color: colors.foreground }]}>{word.word}</Text>
          <TouchableOpacity
            onPress={handlePronunciation}
            style={[styles.pronRow, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
          >
            <Ionicons name="volume-high" size={18} color={colors.primary} />
            <Text style={[styles.pronunciation, { color: colors.mutedForeground }]}>
              {word.pronunciation}
            </Text>
          </TouchableOpacity>
          <View style={[styles.meaningBox, { backgroundColor: colors.primary + "0D", borderRadius: colors.radius, borderColor: colors.primary + "33" }]}>
            <Text style={[styles.meaning, { color: colors.foreground }]}>{word.meaning}</Text>
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
      </ScrollView>

      {/* Bottom action */}
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
        <PrimaryButton
          title="저장하기"
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
  levelPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
  },
  levelPillText: {
    fontSize: 12,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  content: { padding: 20, gap: 20 },
  wordHero: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  mainWord: {
    fontSize: 42,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -2,
    textAlign: "center",
  },
  pronRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pronunciation: {
    fontSize: 15,
    fontFamily: "NotoSansKR_400Regular",
  },
  meaningBox: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1,
    width: "100%",
    alignItems: "center",
  },
  meaning: {
    fontSize: 22,
    fontFamily: "NotoSansKR_700Bold",
    textAlign: "center",
  },
  cards: { gap: 10 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  saveBtn: { flex: 1 },
  memorizeBtn: { flex: 2 },
});
