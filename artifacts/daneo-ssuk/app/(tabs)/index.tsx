// HomeScreen — today's progress, streak, quick scan, recent words
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProgressCard } from "@/components/ProgressCard";
import { WordCard } from "@/components/WordCard";
import { MOCK_WORDS } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { streak, totalLearned, todayCount, savedWords, getTodayReviews } = useApp();
  const todayReviews = getTodayReviews();
  const recentWords = MOCK_WORDS.slice(0, 3);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.appName, { color: colors.primary }]}>단어쑥</Text>
          <Text style={[styles.slogan, { color: colors.mutedForeground }]}>찍고, 보고, 기억된다.</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={[styles.avatarBtn, { backgroundColor: colors.primary + "22" }]}
        >
          <Ionicons name="person" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <ProgressCard
          label="오늘 학습"
          value={todayCount}
          subtitle="단어"
          color={colors.primary}
        />
        <View style={styles.statGap} />
        <ProgressCard
          label="연속 학습"
          value={`${streak}일`}
          subtitle="streak"
          color={colors.accent}
        />
        <View style={styles.statGap} />
        <ProgressCard
          label="전체"
          value={totalLearned}
          subtitle="단어"
          color={colors.info}
        />
      </View>

      {/* Review alert */}
      {todayReviews.length > 0 && (
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/review")}
          style={[styles.reviewAlert, { backgroundColor: colors.accent + "22", borderColor: colors.accent, borderRadius: colors.radius }]}
        >
          <Ionicons name="alarm" size={18} color={colors.accent} />
          <Text style={[styles.reviewAlertText, { color: colors.foreground }]}>
            오늘 복습할 단어 {todayReviews.length}개가 있습니다
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}

      {/* Quick scan CTA */}
      <TouchableOpacity
        onPress={() => router.push("/camera")}
        activeOpacity={0.88}
        style={[styles.scanCard, { borderRadius: colors.radius, overflow: "hidden" }]}
      >
        <LinearGradient
          colors={[colors.primary, "#3DAB5E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scanGradient}
        >
          <View style={styles.scanContent}>
            <View style={styles.scanLeft}>
              <Text style={styles.scanTitle}>빠른 단어 스캔</Text>
              <Text style={styles.scanSub}>교과서를 촬영해 단어를 추출하세요</Text>
            </View>
            <View style={[styles.scanIconWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Ionicons name="camera" size={28} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Textbook learning shortcut */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/study")}
        activeOpacity={0.88}
        style={[styles.studyShortcut, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
      >
        <Ionicons name="book" size={22} color={colors.primary} />
        <Text style={[styles.studyShortcutText, { color: colors.foreground }]}>교과서 학습</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      {/* Saved words shortcut */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/search")}
        activeOpacity={0.88}
        style={[styles.studyShortcut, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
      >
        <Ionicons name="bookmark" size={22} color={colors.accent} />
        <Text style={[styles.studyShortcutText, { color: colors.foreground }]}>저장한 단어 {savedWords.length}개</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      {/* Section title */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>추천 단어</Text>

      {/* Word cards */}
      {recentWords.map((w) => (
        <WordCard key={w.id} word={w} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 26,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -1,
  },
  slogan: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
    marginTop: 1,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statGap: { width: 10 },
  reviewAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  reviewAlertText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "NotoSansKR_500Medium",
  },
  scanCard: {
    marginBottom: 12,
    shadowColor: "#5BC878",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  scanGradient: {
    borderRadius: 16,
  },
  scanContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  scanLeft: { gap: 4 },
  scanTitle: {
    fontSize: 18,
    fontFamily: "NotoSansKR_700Bold",
    color: "#fff",
  },
  scanSub: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  scanIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  studyShortcut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  studyShortcutText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "NotoSansKR_500Medium",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "NotoSansKR_700Bold",
    marginTop: 8,
    marginBottom: 12,
  },
});
