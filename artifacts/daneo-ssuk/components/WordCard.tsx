import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Word } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  word: Word;
  showBookmark?: boolean;
  compact?: boolean;
}

export function WordCard({ word, showBookmark = true, compact = false }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { isWordSaved, saveWord, unsaveWord } = useApp();
  const saved = isWordSaved(word.id);

  const handleBookmark = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (saved) await unsaveWord(word.id);
    else await saveWord(word.id);
  };

  const levelColor =
    word.level === "elementary"
      ? "#5BC878"
      : word.level === "middle"
      ? "#5B9ED6"
      : "#E88B5B";

  const levelLabel =
    word.level === "elementary" ? "초등" : word.level === "middle" ? "중학" : "고등";

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/word-detail", params: { id: word.id } })}
      activeOpacity={0.82}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
        compact && styles.compact,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.wordRow}>
            <Text style={[styles.word, { color: colors.foreground }]}>{word.word}</Text>
            <View style={[styles.levelBadge, { backgroundColor: levelColor + "22" }]}>
              <Text style={[styles.levelText, { color: levelColor }]}>{levelLabel}</Text>
            </View>
          </View>
          <Text style={[styles.pronunciation, { color: colors.mutedForeground }]}>
            {word.pronunciation}
          </Text>
          <Text style={[styles.meaning, { color: colors.foreground }]}>{word.meaning}</Text>
          {!compact && (
            <Text style={[styles.example, { color: colors.mutedForeground }]} numberOfLines={2}>
              {word.example}
            </Text>
          )}
        </View>
        {showBookmark && (
          <TouchableOpacity onPress={handleBookmark} style={styles.bookmark} hitSlop={12}>
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={22}
              color={saved ? colors.accent : colors.mutedForeground}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  compact: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  left: {
    flex: 1,
    gap: 4,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  word: {
    fontSize: 20,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -0.5,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  levelText: {
    fontSize: 11,
    fontFamily: "NotoSansKR_700Bold",
  },
  pronunciation: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
  },
  meaning: {
    fontSize: 15,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  example: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
    marginTop: 2,
    lineHeight: 18,
  },
  bookmark: {
    padding: 4,
    marginLeft: 8,
  },
});
