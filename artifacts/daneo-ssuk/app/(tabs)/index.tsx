// HomeScreen — today's progress, streak, parent-friendly copy, quick scan
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

const PARENT_BADGES = [
  { icon: "book-outline", label: "교과서 단어 기반" },
  { icon: "time-outline", label: "매일 10분 영어 습관" },
  { icon: "refresh-circle-outline", label: "반복 복습으로 오래 기억" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { streak, totalLearned, todayCount, savedWords, getTodayReviews } = useApp();
  const todayReviews = getTodayReviews();

  // Show a mix of levels as featured words
  const featuredWords = [
    MOCK_WORDS.find((w) => w.level === "elementary"),
    MOCK_WORDS.find((w) => w.level === "middle"),
    MOCK_WORDS.find((w) => w.level === "high"),
  ].filter(Boolean) as typeof MOCK_WORDS;

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
          <Text style={[styles.slogan, { color: colors.mutedForeground }]}>
            찍고, 보고, 기억된다.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={[styles.avatarBtn, { backgroundColor: colors.primary + "22" }]}
        >
          <Ionicons name="person" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Parent trust badges */}
      <View
        style={[
          styles.trustStrip,
          {
            backgroundColor: colors.primary + "0A",
            borderColor: colors.primary + "22",
            borderRadius: colors.radius,
          },
        ]}
      >
        {PARENT_BADGES.map((b, i) => (
          <React.Fragment key={b.label}>
            <View style={styles.trustItem}>
              <Ionicons name={b.icon as any} size={13} color={colors.primary} />
              <Text style={[styles.trustLabel, { color: colors.primary }]}>{b.label}</Text>
            </View>
            {i < PARENT_BADGES.length - 1 && (
              <View style={[styles.trustDivider, { backgroundColor: colors.primary + "33" }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <ProgressCard label="오늘 학습" value={todayCount} subtitle="단어" color={colors.primary} />
        <View style={{ width: 10 }} />
        <ProgressCard label="연속 학습" value={`${streak}일`} subtitle="streak" color={colors.accent} />
        <View style={{ width: 10 }} />
        <ProgressCard label="전체" value={totalLearned} subtitle="단어" color={colors.info} />
      </View>

      {/* Review alert */}
      {todayReviews.length > 0 && (
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/review")}
          style={[
            styles.reviewAlert,
            {
              backgroundColor: colors.accent + "18",
              borderColor: colors.accent + "55",
              borderRadius: colors.radius,
            },
          ]}
        >
          <Ionicons name="alarm" size={18} color={colors.accent} />
          <Text style={[styles.reviewAlertText, { color: colors.foreground }]}>
            오늘 복습할 단어{" "}
            <Text style={{ fontFamily: "NotoSansKR_700Bold", color: colors.accent }}>
              {todayReviews.length}개
            </Text>
            가 있습니다
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
          style={styles.scanGradientInner}
        >
          <View style={styles.scanLeft}>
            <Text style={styles.scanTitle}>빠른 단어 스캔</Text>
            <Text style={styles.scanSub}>교과서를 찍으면 단어가 바로 추출됩니다</Text>
          </View>
          <View style={[styles.scanIconWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Ionicons name="camera" size={28} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Shortcuts */}
      {[
        {
          icon: "book" as const,
          iconColor: colors.primary,
          label: "교과서 학습",
          sub: "초등 · 중등 · 고등",
          route: "/(tabs)/study",
        },
        {
          icon: "bookmark" as const,
          iconColor: colors.accent,
          label: `저장한 단어 ${savedWords.length}개`,
          sub: "내가 저장한 단어 모아보기",
          route: "/(tabs)/search",
        },
      ].map((s) => (
        <TouchableOpacity
          key={s.label}
          onPress={() => router.push(s.route as any)}
          activeOpacity={0.88}
          style={[
            styles.shortcut,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <View style={[styles.shortcutIconBox, { backgroundColor: s.iconColor + "18" }]}>
            <Ionicons name={s.icon} size={20} color={s.iconColor} />
          </View>
          <View style={styles.shortcutText}>
            <Text style={[styles.shortcutLabel, { color: colors.foreground }]}>{s.label}</Text>
            <Text style={[styles.shortcutSub, { color: colors.mutedForeground }]}>{s.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      ))}

      {/* Featured words */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>오늘의 추천 단어</Text>
        <View style={[styles.sectionBadge, { backgroundColor: colors.primary + "18" }]}>
          <Text style={[styles.sectionBadgeText, { color: colors.primary }]}>
            초등 · 중등 · 고등
          </Text>
        </View>
      </View>

      {featuredWords.map((w) => (
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
    marginBottom: 16,
  },
  appName: { fontSize: 26, fontFamily: "NotoSansKR_700Bold", letterSpacing: -1 },
  slogan: { fontSize: 12, fontFamily: "NotoSansKR_400Regular", marginTop: 1 },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  // Trust strip
  trustStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1, justifyContent: "center" },
  trustLabel: { fontSize: 10, fontFamily: "NotoSansKR_600SemiBold" },
  trustDivider: { width: 1, height: 16 },
  statsRow: { flexDirection: "row", marginBottom: 16 },
  reviewAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  reviewAlertText: { flex: 1, fontSize: 13, fontFamily: "NotoSansKR_500Medium" },
  scanCard: {
    marginBottom: 12,
    shadowColor: "#5BC878",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  scanGradientInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 16,
  },
  scanLeft: { gap: 4, flex: 1 },
  scanTitle: { fontSize: 18, fontFamily: "NotoSansKR_700Bold", color: "#fff" },
  scanSub: { fontSize: 12, fontFamily: "NotoSansKR_400Regular", color: "rgba(255,255,255,0.8)" },
  scanIconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  shortcut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  shortcutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutText: { flex: 1 },
  shortcutLabel: { fontSize: 15, fontFamily: "NotoSansKR_600SemiBold" },
  shortcutSub: { fontSize: 11, fontFamily: "NotoSansKR_400Regular", marginTop: 1 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: "NotoSansKR_700Bold" },
  sectionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  sectionBadgeText: { fontSize: 11, fontFamily: "NotoSansKR_600SemiBold" },
});

