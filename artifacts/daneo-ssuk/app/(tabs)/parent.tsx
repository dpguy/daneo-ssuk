// ParentDashboard — 부모님 학습 현황 대시보드
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ── Helpers ────────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function dateMinusDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function shortDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_LABELS[d.getDay()];
}

function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

const DAILY_GOAL = 10;

function encouragement(streak: number, todayCount: number): { emoji: string; title: string; body: string } {
  if (todayCount === 0) {
    return {
      emoji: "🌱",
      title: "오늘 아직 시작 전이에요",
      body: "매일 조금씩이 가장 중요해요. 오늘도 단어 하나씩 시작해 보세요!",
    };
  }
  if (streak >= 14) {
    return {
      emoji: "🏆",
      title: `${streak}일 연속 학습 중!`,
      body: "정말 대단해요! 매일 꾸준히 학습하는 훌륭한 습관을 만들고 있어요.",
    };
  }
  if (streak >= 7) {
    return {
      emoji: "🌳",
      title: `${streak}일째 연속 학습!`,
      body: "일주일을 넘겼어요. 이 페이스면 어떤 단어도 다 외울 수 있어요!",
    };
  }
  if (streak >= 3) {
    return {
      emoji: "🌿",
      title: `${streak}일 연속이에요!`,
      body: "꾸준함이 실력이 돼요. 계속 응원할게요!",
    };
  }
  return {
    emoji: "✨",
    title: "좋은 시작이에요!",
    body: "매일 학습하면 30일 후엔 완전히 달라져 있을 거예요. 오늘도 화이팅!",
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  icon,
  iconColor,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: accent ? iconColor + "14" : colors.card,
          borderColor: accent ? iconColor + "33" : colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: iconColor + "18" }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {sub ? (
        <Text style={[styles.statSub, { color: iconColor }]}>{sub}</Text>
      ) : null}
    </View>
  );
}

function WeeklyBar({
  count,
  maxCount,
  dateStr,
  isActive,
}: {
  count: number;
  maxCount: number;
  dateStr: string;
  isActive: boolean;
}) {
  const colors = useColors();
  const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const barH = Math.max(heightPct * 0.8, count > 0 ? 6 : 2);
  const label = shortDayLabel(dateStr);
  const active = isToday(dateStr);

  return (
    <View style={styles.barCol}>
      {count > 0 && (
        <Text style={[styles.barCount, { color: isActive ? colors.primary : colors.mutedForeground }]}>
          {count}
        </Text>
      )}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              height: barH,
              backgroundColor: active
                ? colors.primary
                : isActive
                ? colors.primary + "AA"
                : colors.primary + "44",
              borderRadius: 4,
            },
          ]}
        />
      </View>
      <Text
        style={[
          styles.barLabel,
          {
            color: active ? colors.primary : colors.mutedForeground,
            fontFamily: active ? "NotoSansKR_700Bold" : "NotoSansKR_400Regular",
          },
        ]}
      >
        {label}
      </Text>
      {active && (
        <View style={[styles.todayDot, { backgroundColor: colors.primary }]} />
      )}
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const {
    streak,
    totalLearned,
    todayCount,
    savedWords,
    completedUnits,
    dailyWords,
    dailyReviews,
    getTodayReviews,
    getUpcomingReviews,
    reviews,
  } = useApp();

  const todayKey = todayStr();

  // Build 7-day data
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const dateStr = dateMinusDays(6 - i);
        return { dateStr, count: dailyWords[dateStr] ?? 0 };
      }),
    [dailyWords]
  );

  const weekMax = useMemo(() => Math.max(...weekDays.map((d) => d.count), 1), [weekDays]);
  const weekTotal = useMemo(() => weekDays.reduce((s, d) => s + d.count, 0), [weekDays]);

  // Review completion today
  const todayDue = getTodayReviews().length;
  const todayReviewsDone = dailyReviews[todayKey] ?? 0;
  const reviewPct = todayDue > 0 ? Math.min(todayReviewsDone / todayDue, 1) : 0;

  // Today words toward goal
  const goalPct = Math.min(todayCount / DAILY_GOAL, 1);

  // Encouragement
  const enc = encouragement(streak, todayCount);

  // Active days this week (days with at least 1 word)
  const activeDays = weekDays.filter((d) => d.count > 0).length;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header gradient */}
      <LinearGradient
        colors={[colors.primary + "28", colors.background]}
        style={[styles.headerGrad, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.shieldBadge, { backgroundColor: colors.primary + "18" }]}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              부모님 대시보드
            </Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              내 아이의 학습 현황
            </Text>
          </View>
          <View
            style={[
              styles.streakBadge,
              { backgroundColor: colors.accent + "22", borderColor: colors.accent + "55" },
            ]}
          >
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakNum, { color: colors.foreground }]}>{streak}일</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Today's summary ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>오늘 학습</Text>
          <View style={styles.todayRow}>
            <StatCard
              icon="book-outline"
              iconColor={colors.primary}
              label="오늘 단어"
              value={todayCount}
              sub={`목표 ${DAILY_GOAL}개`}
              accent
            />
            <StatCard
              icon="refresh-circle-outline"
              iconColor={colors.info}
              label="복습 완료"
              value={todayReviewsDone}
              sub={todayDue > 0 ? `총 ${todayDue}개 중` : "복습 없음"}
              accent
            />
            <StatCard
              icon="flame-outline"
              iconColor={colors.accent}
              label="연속 학습"
              value={`${streak}일`}
              accent
            />
          </View>
        </View>

        {/* ── Daily goal progress ── */}
        <View
          style={[
            styles.goalCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <View style={styles.goalHeader}>
            <Text style={[styles.goalTitle, { color: colors.foreground }]}>오늘 목표</Text>
            <Text style={[styles.goalCount, { color: colors.primary }]}>
              {todayCount} / {DAILY_GOAL}개
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${goalPct * 100}%` as any, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.goalSub, { color: colors.mutedForeground }]}>
            {goalPct >= 1
              ? "🎉 오늘 목표 달성! 훌륭해요"
              : `${DAILY_GOAL - todayCount}개 더 공부하면 목표 달성이에요`}
          </Text>
        </View>

        {/* ── Review completion ── */}
        {todayDue > 0 && (
          <View
            style={[
              styles.reviewCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <View style={styles.reviewHeader}>
              <Ionicons name="checkmark-done-circle-outline" size={20} color={colors.info} />
              <Text style={[styles.reviewTitle, { color: colors.foreground }]}>복습 완료율</Text>
              <Text style={[styles.reviewPct, { color: colors.info }]}>
                {Math.round(reviewPct * 100)}%
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${reviewPct * 100}%` as any,
                    backgroundColor: reviewPct >= 1 ? colors.primary : colors.info,
                  },
                ]}
              />
            </View>
            <Text style={[styles.reviewSub, { color: colors.mutedForeground }]}>
              오늘 예정 {todayDue}개 중 {todayReviewsDone}개 완료
            </Text>
          </View>
        )}

        {/* ── Weekly report ── */}
        <View
          style={[
            styles.weekCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <View style={styles.weekHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>주간 리포트</Text>
            <View
              style={[
                styles.weekSumBadge,
                { backgroundColor: colors.primary + "18", borderColor: colors.primary + "33" },
              ]}
            >
              <Text style={[styles.weekSumText, { color: colors.primary }]}>
                이번 주 {weekTotal}단어 · {activeDays}일 학습
              </Text>
            </View>
          </View>

          <View style={styles.barChart}>
            {weekDays.map(({ dateStr, count }) => (
              <WeeklyBar
                key={dateStr}
                count={count}
                maxCount={weekMax}
                dateStr={dateStr}
                isActive={count > 0}
              />
            ))}
          </View>
        </View>

        {/* ── Total stats grid ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>전체 통계</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="school-outline"
              iconColor={colors.primary}
              label="총 학습 단어"
              value={totalLearned}
            />
            <StatCard
              icon="bookmark-outline"
              iconColor={colors.accent}
              label="저장한 단어"
              value={savedWords.length}
            />
            <StatCard
              icon="checkmark-circle-outline"
              iconColor={colors.info}
              label="완료 단원"
              value={completedUnits.length}
            />
            <StatCard
              icon="time-outline"
              iconColor={colors.hard}
              label="복습 예정"
              value={getUpcomingReviews().length}
            />
          </View>
        </View>

        {/* ── Encouragement ── */}
        <View
          style={[
            styles.encCard,
            {
              backgroundColor: colors.primary + "0D",
              borderColor: colors.primary + "33",
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={styles.encEmoji}>{enc.emoji}</Text>
          <View style={styles.encBody}>
            <Text style={[styles.encTitle, { color: colors.foreground }]}>{enc.title}</Text>
            <Text style={[styles.encText, { color: colors.mutedForeground }]}>{enc.body}</Text>
          </View>
        </View>

        {/* ── Habit tip ── */}
        <View
          style={[
            styles.tipCard,
            {
              backgroundColor: colors.accent + "18",
              borderColor: colors.accent + "44",
              borderRadius: colors.radius,
            },
          ]}
        >
          <Ionicons name="bulb-outline" size={18} color={colors.accent} />
          <Text style={[styles.tipText, { color: colors.foreground }]}>
            <Text style={{ fontFamily: "NotoSansKR_700Bold" }}>학습 습관 팁 · </Text>
            매일 같은 시간에 단 10분씩 공부하면 6개월 안에 500단어 이상 외울 수 있어요.
            규칙적인 시간을 정해 함께 도와주세요!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Header
  headerGrad: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shieldBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "NotoSansKR_400Regular",
    marginTop: 1,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
  },
  streakEmoji: { fontSize: 14 },
  streakNum: { fontSize: 14, fontFamily: "NotoSansKR_700Bold" },

  // Content
  content: { padding: 16, gap: 16 },

  // Sections
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -0.3,
  },

  // Today row
  todayRow: { flexDirection: "row", gap: 10 },

  // Stat cards
  statCard: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "NotoSansKR_500Medium",
    textAlign: "center",
  },
  statSub: {
    fontSize: 10,
    fontFamily: "NotoSansKR_400Regular",
  },

  // Goal card
  goalCard: {
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalTitle: { fontSize: 15, fontFamily: "NotoSansKR_600SemiBold" },
  goalCount: { fontSize: 15, fontFamily: "NotoSansKR_700Bold" },
  goalSub: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },

  // Progress
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },

  // Review card
  reviewCard: {
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewTitle: { flex: 1, fontSize: 15, fontFamily: "NotoSansKR_600SemiBold" },
  reviewPct: { fontSize: 15, fontFamily: "NotoSansKR_700Bold" },
  reviewSub: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },

  // Weekly chart
  weekCard: {
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  weekHeader: { gap: 8 },
  weekSumBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  weekSumText: { fontSize: 12, fontFamily: "NotoSansKR_600SemiBold" },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 110,
    gap: 0,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingBottom: 20,
  },
  barCount: {
    fontSize: 10,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  barTrack: {
    width: "70%",
    height: 80,
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
  },
  barLabel: {
    fontSize: 11,
    position: "absolute",
    bottom: 0,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    position: "absolute",
    bottom: 14,
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  // Encouragement
  encCard: {
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  encEmoji: { fontSize: 28, lineHeight: 32 },
  encBody: { flex: 1, gap: 4 },
  encTitle: { fontSize: 15, fontFamily: "NotoSansKR_700Bold" },
  encText: { fontSize: 13, fontFamily: "NotoSansKR_400Regular", lineHeight: 19 },

  // Tip
  tipCard: {
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
    lineHeight: 20,
  },
});
