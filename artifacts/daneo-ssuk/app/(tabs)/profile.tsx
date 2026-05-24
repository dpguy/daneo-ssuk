// ProfileScreen — level, words memorized, streak, achievements
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
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

interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
}

function AchievementBadge({ a }: { a: Achievement }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: a.unlocked ? colors.primary + "18" : colors.secondary,
          borderColor: a.unlocked ? colors.primary + "55" : colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <Ionicons
        name={a.icon as any}
        size={28}
        color={a.unlocked ? colors.primary : colors.mutedForeground}
      />
      <Text
        style={[styles.badgeTitle, { color: a.unlocked ? colors.foreground : colors.mutedForeground }]}
      >
        {a.title}
      </Text>
      <Text style={[styles.badgeDesc, { color: colors.mutedForeground }]}>{a.desc}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { totalLearned, streak, savedWords, reviews } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const level =
    totalLearned >= 100
      ? "고급"
      : totalLearned >= 50
      ? "중급"
      : totalLearned >= 20
      ? "초급"
      : "입문";

  const levelProgress = Math.min((totalLearned % 50) / 50, 1);

  // Build calendar — last 14 days
  const days: { date: Date; studied: boolean }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ date: d, studied: Math.random() > 0.4 }); // mock for now
  }

  const achievements: Achievement[] = [
    { id: "1", icon: "star", title: "첫 단어", desc: "첫 번째 단어 학습", unlocked: totalLearned >= 1 },
    { id: "2", icon: "flame", title: "불꽃 학습", desc: "7일 연속 학습", unlocked: streak >= 7 },
    { id: "3", icon: "trophy", title: "50단어", desc: "50개 단어 달성", unlocked: totalLearned >= 50 },
    { id: "4", icon: "bookmark", title: "수집가", desc: "단어 10개 저장", unlocked: savedWords.length >= 10 },
    { id: "5", icon: "refresh-circle", title: "복습왕", desc: "복습 20회 완료", unlocked: reviews.length >= 20 },
    { id: "6", icon: "school", title: "학자", desc: "100개 단어 달성", unlocked: totalLearned >= 100 },
  ];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile hero */}
      <LinearGradient
        colors={[colors.primary, "#3DAB5E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { borderRadius: colors.radius }]}
      >
        <View style={[styles.avatarCircle, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
          <Ionicons name="person" size={32} color="#fff" />
        </View>
        <Text style={styles.heroName}>학습자</Text>
        <View style={[styles.levelBadge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
          <Text style={styles.levelText}>{level} 레벨</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${levelProgress * 100}%` as any,
                  backgroundColor: colors.accent,
                },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>{totalLearned}개 학습 완료</Text>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "학습 단어", value: totalLearned, icon: "book", color: colors.primary },
          { label: "연속 학습", value: `${streak}일`, icon: "flame", color: colors.accent },
          { label: "저장 단어", value: savedWords.length, icon: "bookmark", color: colors.info },
        ].map((s) => (
          <View
            key={s.label}
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            <Ionicons name={s.icon as any} size={20} color={s.color} />
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Study calendar */}
      <View style={[styles.calCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>학습 캘린더</Text>
        <Text style={[styles.calSub, { color: colors.mutedForeground }]}>최근 14일</Text>
        <View style={styles.calGrid}>
          {days.map((d, i) => (
            <View
              key={i}
              style={[
                styles.calDay,
                {
                  backgroundColor: d.studied ? colors.primary : colors.secondary,
                  borderRadius: 6,
                },
              ]}
            >
              <Text
                style={[
                  styles.calDayNum,
                  { color: d.studied ? "#fff" : colors.mutedForeground },
                ]}
              >
                {d.date.getDate()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Achievements */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>업적</Text>
      <View style={styles.badgesGrid}>
        {achievements.map((a) => (
          <AchievementBadge key={a.id} a={a} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  hero: {
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroName: {
    fontSize: 22,
    fontFamily: "NotoSansKR_700Bold",
    color: "#fff",
  },
  levelBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 99,
  },
  levelText: {
    fontSize: 13,
    fontFamily: "NotoSansKR_700Bold",
    color: "#fff",
  },
  progressSection: { width: "100%", gap: 6 },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 4 },
  progressLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "NotoSansKR_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
  },
  calCard: {
    borderWidth: 1,
    padding: 18,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "NotoSansKR_700Bold",
  },
  calSub: {
    fontSize: 12,
    fontFamily: "NotoSansKR_400Regular",
    marginBottom: 8,
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  calDay: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  calDayNum: {
    fontSize: 12,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badge: {
    width: "47%",
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  badgeTitle: {
    fontSize: 13,
    fontFamily: "NotoSansKR_600SemiBold",
    textAlign: "center",
  },
  badgeDesc: {
    fontSize: 11,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
  },
});
