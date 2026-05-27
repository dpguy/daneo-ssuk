// ReviewScreen — today's review, retention chart, upcoming with dates, 완료 state
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

import { formatNextReview } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function IntervalBar({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.barRow}>
      <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.barTrack, { backgroundColor: colors.secondary }]}>
        <View
          style={[
            styles.barFill,
            {
              width: max > 0 ? `${(count / max) * 100}%` : "0%",
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={[styles.barCount, { color: colors.foreground }]}>{count}</Text>
    </View>
  );
}

export default function ReviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getTodayReviews, getUpcomingReviews, reviews, totalLearned, findWord } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const todayReviews = getTodayReviews();
  const upcomingReviews = getUpcomingReviews().slice(0, 6);
  const allDone = todayReviews.length === 0 && reviews.length > 0;

  const intervals = [1, 3, 7, 14, 30];
  const groupedCounts = intervals.map((days) =>
    reviews.filter((r) => {
      const diff = Math.ceil(
        (new Date(r.nextReview).getTime() - Date.now()) / 86400000
      );
      return diff === days;
    }).length
  );
  const maxCount = Math.max(...groupedCounts, 1);
  const retentionPct =
    totalLearned > 0 ? Math.round((reviews.length / totalLearned) * 100) : 0;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>복습</Text>

      {/* ── 오늘 복습 완료 state ─────────────────────────────────────────── */}
      {allDone ? (
        <View
          style={[
            styles.doneCard,
            {
              backgroundColor: colors.primary + "0D",
              borderColor: colors.primary + "33",
              borderRadius: colors.radius,
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={40} color={colors.primary} />
          <Text style={[styles.doneTitleText, { color: colors.primary }]}>
            오늘 복습 완료!
          </Text>
          <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
            오늘 예정된 복습을 모두 마쳤습니다{"\n"}내일 또 만나요
          </Text>
          {upcomingReviews.length > 0 && (
            <View
              style={[
                styles.nextReviewBadge,
                { backgroundColor: colors.accent + "22" },
              ]}
            >
              <Text style={[styles.nextReviewText, { color: colors.accent }]}>
                다음 복습:{" "}
                {formatNextReview(upcomingReviews[0].nextReview)}
              </Text>
            </View>
          )}
        </View>
      ) : (
        /* ── Today's review CTA ──────────────────────────────────────────── */
        <TouchableOpacity
          onPress={() => {
            if (todayReviews.length === 0) return;
            const first = todayReviews[0];
            const word = findWord(first.wordId);
            if (word)
              router.push({
                pathname: "/memorization",
                params: { id: word.id, mode: "review" },
              });
          }}
          activeOpacity={todayReviews.length > 0 ? 0.85 : 1}
          style={[
            styles.todayCard,
            {
              borderRadius: colors.radius,
              overflow: "hidden",
              opacity: reviews.length === 0 ? 0.6 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={
              todayReviews.length > 0
                ? [colors.primary, "#3DAB5E"]
                : [colors.secondary, colors.secondary]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.todayGradient}
          >
            <View style={styles.todayLeft}>
              <Text
                style={[
                  styles.todayCount,
                  {
                    color: todayReviews.length > 0 ? "#fff" : colors.foreground,
                  },
                ]}
              >
                {todayReviews.length}
              </Text>
              <Text
                style={[
                  styles.todayLabel,
                  {
                    color:
                      todayReviews.length > 0
                        ? "rgba(255,255,255,0.85)"
                        : colors.mutedForeground,
                  },
                ]}
              >
                오늘 복습할 단어
              </Text>
            </View>
            {todayReviews.length > 0 && (
              <View
                style={[
                  styles.startBtn,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
              >
                <Text style={styles.startBtnText}>시작</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* ── Retention chart ───────────────────────────────────────────────── */}
      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>
            복습 간격 분포
          </Text>
          <View
            style={[
              styles.retentionBadge,
              { backgroundColor: colors.primary + "22" },
            ]}
          >
            <Text style={[styles.retentionPct, { color: colors.primary }]}>
              {retentionPct}% 유지
            </Text>
          </View>
        </View>

        {["1일 후", "3일 후", "7일 후", "14일 후", "30일 후"].map((label, i) => (
          <IntervalBar
            key={label}
            label={label}
            count={groupedCounts[i]}
            max={maxCount}
            color={colors.primary}
          />
        ))}

        {reviews.length === 0 && (
          <Text style={[styles.noData, { color: colors.mutedForeground }]}>
            단어를 학습하면 복습 일정이 생성됩니다
          </Text>
        )}
      </View>

      {/* ── Upcoming reviews with next date ───────────────────────────────── */}
      {upcomingReviews.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            예정된 복습
          </Text>
          {upcomingReviews.map((r) => {
            const word = findWord(r.wordId);
            if (!word) return null;
            const dateLabel = formatNextReview(r.nextReview);
            const nextDate = new Date(r.nextReview);
            const dateStr = `${nextDate.getMonth() + 1}월 ${nextDate.getDate()}일`;

            return (
              <TouchableOpacity
                key={r.wordId}
                onPress={() =>
                  router.push({
                    pathname: "/memorization",
                    params: { id: word.id, mode: "review" },
                  })
                }
                style={[
                  styles.upcomingRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View style={styles.upcomingLeft}>
                  <Text style={[styles.upcomingWord, { color: colors.foreground }]}>
                    {word.word}
                  </Text>
                  <Text
                    style={[styles.upcomingMeaning, { color: colors.mutedForeground }]}
                  >
                    {word.meaning}
                  </Text>
                </View>
                <View style={styles.upcomingRight}>
                  <View
                    style={[
                      styles.daysBadge,
                      { backgroundColor: colors.accent + "33" },
                    ]}
                  >
                    <Text style={[styles.daysText, { color: colors.accent }]}>
                      {dateLabel}
                    </Text>
                  </View>
                  <Text style={[styles.dateStr, { color: colors.mutedForeground }]}>
                    {dateStr}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.statsCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Text style={[styles.statsTitle, { color: colors.foreground }]}>학습 현황</Text>
        <View style={styles.statsRow}>
          {[
            { label: "학습한 단어", value: totalLearned, color: colors.primary },
            { label: "복습 단어", value: reviews.length, color: colors.accent },
            { label: "오늘 복습", value: todayReviews.length, color: colors.info },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  {s.label}
                </Text>
              </View>
              {i < 2 && (
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Random quiz CTA */}
      {reviews.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            const ids = reviews.map((r) => r.wordId).join(",");
            router.push({ pathname: "/quiz", params: { ids } });
          }}
          style={[
            styles.quizCta,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Ionicons name="shuffle" size={20} color="#fff" />
          <View>
            <Text style={styles.quizCtaTitle}>랜덤 퀴즈</Text>
            <Text style={styles.quizCtaSub}>외운 단어 {reviews.length}개를 랜덤으로 확인</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      )}

      {/* Spelling practice CTA */}
      {reviews.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            const ids = reviews.map((r) => r.wordId).join(",");
            router.push({ pathname: "/spelling", params: { ids } });
          }}
          style={[
            styles.spellingCta,
            {
              borderColor: colors.accent + "55",
              backgroundColor: colors.accent + "0D",
              borderRadius: colors.radius,
            },
          ]}
        >
          <Ionicons name="text" size={20} color={colors.accent} />
          <View>
            <Text style={[styles.spellingCtaTitle, { color: colors.accent }]}>스펠링 연습</Text>
            <Text style={[styles.spellingCtaSub, { color: colors.mutedForeground }]}>
              글자 하나씩 입력해서 스펠링 확인
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}

      {/* Parent trust section */}
      <View
        style={[
          styles.trustCard,
          {
            backgroundColor: colors.primary + "08",
            borderColor: colors.primary + "22",
            borderRadius: colors.radius,
          },
        ]}
      >
        {[
          { icon: "book-outline", text: "교과서 단어 기반" },
          { icon: "time-outline", text: "매일 10분 영어 습관" },
          { icon: "refresh-circle-outline", text: "반복 복습으로 오래 기억" },
        ].map((item) => (
          <View key={item.text} style={styles.trustRow}>
            <Ionicons name={item.icon as any} size={16} color={colors.primary} />
            <Text style={[styles.trustText, { color: colors.primary }]}>{item.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  title: { fontSize: 24, fontFamily: "NotoSansKR_700Bold", marginBottom: 4 },
  // Done card
  doneCard: {
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  doneTitleText: { fontSize: 20, fontFamily: "NotoSansKR_700Bold" },
  doneSub: {
    fontSize: 14,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  nextReviewBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, marginTop: 4 },
  nextReviewText: { fontSize: 13, fontFamily: "NotoSansKR_600SemiBold" },
  // Today card
  todayCard: {
    shadowColor: "#5BC878",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  todayGradient: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
  },
  todayLeft: { gap: 4 },
  todayCount: { fontSize: 40, fontFamily: "NotoSansKR_700Bold", letterSpacing: -2 },
  todayLabel: { fontSize: 14, fontFamily: "NotoSansKR_400Regular" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
  },
  startBtnText: { color: "#fff", fontSize: 15, fontFamily: "NotoSansKR_600SemiBold" },
  // Chart
  chartCard: { borderWidth: 1, padding: 18, gap: 10 },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chartTitle: { fontSize: 16, fontFamily: "NotoSansKR_600SemiBold" },
  retentionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  retentionPct: { fontSize: 12, fontFamily: "NotoSansKR_700Bold" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barLabel: { width: 48, fontSize: 12, fontFamily: "NotoSansKR_400Regular" },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4 },
  barCount: { width: 20, fontSize: 12, fontFamily: "NotoSansKR_500Medium", textAlign: "right" },
  noData: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
    paddingVertical: 8,
  },
  sectionTitle: { fontSize: 18, fontFamily: "NotoSansKR_700Bold" },
  // Upcoming rows
  upcomingRow: {
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  upcomingLeft: { flex: 1, gap: 2 },
  upcomingWord: { fontSize: 16, fontFamily: "NotoSansKR_600SemiBold" },
  upcomingMeaning: { fontSize: 13, fontFamily: "NotoSansKR_400Regular" },
  upcomingRight: { alignItems: "flex-end", gap: 3 },
  daysBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  daysText: { fontSize: 12, fontFamily: "NotoSansKR_700Bold" },
  dateStr: { fontSize: 11, fontFamily: "NotoSansKR_400Regular" },
  // Stats
  statsCard: { borderWidth: 1, padding: 18, gap: 12 },
  statsTitle: { fontSize: 16, fontFamily: "NotoSansKR_600SemiBold" },
  statsRow: { flexDirection: "row", alignItems: "center" },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 24, fontFamily: "NotoSansKR_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },
  statDivider: { width: 1, height: 40 },
  // Trust
  trustCard: { borderWidth: 1, padding: 16, gap: 10 },
  trustRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trustText: { fontSize: 13, fontFamily: "NotoSansKR_600SemiBold" },
  // Quiz / Spelling CTAs
  quizCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  quizCtaTitle: { fontSize: 15, fontFamily: "NotoSansKR_700Bold", color: "#fff" },
  quizCtaSub: { fontSize: 12, fontFamily: "NotoSansKR_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
  spellingCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderWidth: 1,
  },
  spellingCtaTitle: { fontSize: 15, fontFamily: "NotoSansKR_700Bold" },
  spellingCtaSub: { fontSize: 12, fontFamily: "NotoSansKR_400Regular", marginTop: 2 },
});
