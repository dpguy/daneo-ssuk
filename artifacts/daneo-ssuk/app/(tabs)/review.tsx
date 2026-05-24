// ReviewScreen — today's review, retention chart, upcoming words
import { Ionicons } from "@expo/vector-icons";
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

import { MOCK_WORDS } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function IntervalBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.barRow}>
      <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.barTrack, { backgroundColor: colors.secondary }]}>
        <View style={[styles.barFill, { width: max > 0 ? `${(count / max) * 100}%` : "0%", backgroundColor: color }]} />
      </View>
      <Text style={[styles.barCount, { color: colors.foreground }]}>{count}</Text>
    </View>
  );
}

export default function ReviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getTodayReviews, getUpcomingReviews, reviews, totalLearned } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const todayReviews = getTodayReviews();
  const upcomingReviews = getUpcomingReviews().slice(0, 5);

  // Group upcoming by interval for chart
  const intervals = [1, 3, 7, 14, 30];
  const groupedCounts = intervals.map((days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return reviews.filter((r) => {
      const next = new Date(r.nextReview);
      const diff = Math.ceil((next.getTime() - Date.now()) / 86400000);
      return diff === days;
    }).length;
  });
  const maxCount = Math.max(...groupedCounts, 1);
  const retentionPct = totalLearned > 0 ? Math.round((reviews.length / totalLearned) * 100) : 0;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>복습</Text>

      {/* Today's review CTA */}
      <TouchableOpacity
        onPress={() => {
          if (todayReviews.length > 0) {
            const first = todayReviews[0];
            const word = MOCK_WORDS.find((w) => w.id === first.wordId);
            if (word) router.push({ pathname: "/memorization", params: { id: word.id, mode: "review" } });
          }
        }}
        activeOpacity={0.85}
        style={[
          styles.todayCard,
          {
            backgroundColor: todayReviews.length > 0 ? colors.primary : colors.secondary,
            borderRadius: colors.radius,
          },
        ]}
      >
        <View style={styles.todayLeft}>
          <Text style={[styles.todayCount, { color: todayReviews.length > 0 ? "#fff" : colors.foreground }]}>
            {todayReviews.length}
          </Text>
          <Text style={[styles.todayLabel, { color: todayReviews.length > 0 ? "rgba(255,255,255,0.85)" : colors.mutedForeground }]}>
            오늘 복습할 단어
          </Text>
        </View>
        {todayReviews.length > 0 && (
          <View style={[styles.startBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.startBtnText}>시작</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Retention chart */}
      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>복습 간격 분포</Text>
          <View style={[styles.retentionBadge, { backgroundColor: colors.primary + "22" }]}>
            <Text style={[styles.retentionPct, { color: colors.primary }]}>{retentionPct}% 유지</Text>
          </View>
        </View>

        {intervals.map((days, i) => (
          <IntervalBar
            key={days}
            label={days === 1 ? "1일 후" : days === 3 ? "3일 후" : days === 7 ? "7일 후" : days === 14 ? "14일 후" : "30일 후"}
            count={groupedCounts[i]}
            max={maxCount}
            color={colors.primary}
          />
        ))}

        {reviews.length === 0 && (
          <Text style={[styles.noDataText, { color: colors.mutedForeground }]}>
            단어를 학습하면 복습 일정이 생성됩니다
          </Text>
        )}
      </View>

      {/* Upcoming reviews */}
      {upcomingReviews.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>예정된 복습</Text>
          {upcomingReviews.map((r) => {
            const word = MOCK_WORDS.find((w) => w.id === r.wordId);
            if (!word) return null;
            const daysLeft = Math.ceil((new Date(r.nextReview).getTime() - Date.now()) / 86400000);
            return (
              <TouchableOpacity
                key={r.wordId}
                onPress={() => router.push({ pathname: "/memorization", params: { id: word.id, mode: "review" } })}
                style={[styles.upcomingRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              >
                <View style={styles.upcomingLeft}>
                  <Text style={[styles.upcomingWord, { color: colors.foreground }]}>{word.word}</Text>
                  <Text style={[styles.upcomingMeaning, { color: colors.mutedForeground }]}>{word.meaning}</Text>
                </View>
                <View style={[styles.daysBadge, { backgroundColor: colors.accent + "33" }]}>
                  <Text style={[styles.daysText, { color: colors.accent }]}>{daysLeft}일 후</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {/* Progress stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.statsTitle, { color: colors.foreground }]}>학습 현황</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{totalLearned}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>학습한 단어</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{reviews.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>복습 단어</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.info }]}>{todayReviews.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>오늘 복습</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  title: {
    fontSize: 24,
    fontFamily: "NotoSansKR_700Bold",
    marginBottom: 4,
  },
  todayCard: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todayLeft: { gap: 4 },
  todayCount: {
    fontSize: 40,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -2,
  },
  todayLabel: {
    fontSize: 14,
    fontFamily: "NotoSansKR_400Regular",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  chartCard: {
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  retentionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  retentionPct: {
    fontSize: 12,
    fontFamily: "NotoSansKR_700Bold",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barLabel: {
    width: 48,
    fontSize: 12,
    fontFamily: "NotoSansKR_400Regular",
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  barCount: {
    width: 20,
    fontSize: 12,
    fontFamily: "NotoSansKR_500Medium",
    textAlign: "right",
  },
  noDataText: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "NotoSansKR_700Bold",
  },
  upcomingRow: {
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  upcomingLeft: { gap: 2 },
  upcomingWord: {
    fontSize: 16,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  upcomingMeaning: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
  },
  daysBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  daysText: {
    fontSize: 12,
    fontFamily: "NotoSansKR_700Bold",
  },
  statsCard: {
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "NotoSansKR_700Bold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "NotoSansKR_400Regular",
  },
  statDivider: {
    width: 1,
    height: 40,
  },
});
