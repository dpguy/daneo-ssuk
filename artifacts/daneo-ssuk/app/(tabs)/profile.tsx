// ProfileScreen — Guest-first: shows login nudge + signup section; auth code preserved
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ── Achievement types ──────────────────────────────────────────────────────────

interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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
      <Text style={[styles.badgeTitle, { color: a.unlocked ? colors.foreground : colors.mutedForeground }]}>
        {a.title}
      </Text>
      <Text style={[styles.badgeDesc, { color: colors.mutedForeground }]}>{a.desc}</Text>
    </View>
  );
}

// ── Login / Signup Modal ───────────────────────────────────────────────────────

type AuthMode = "login" | "signup";

function AuthModal({
  visible,
  mode,
  onClose,
  onSwitch,
}: {
  visible: boolean;
  mode: AuthMode;
  onClose: () => void;
  onSwitch: (m: AuthMode) => void;
}) {
  const colors = useColors();
  const { signIn, signUp } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    const { error } = isLogin
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert(isLogin ? "로그인 실패" : "회원가입 실패", error);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: colors.background, borderRadius: colors.radius }]}>
          {/* Handle */}
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {isLogin ? "로그인" : "회원가입"}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Nudge message */}
          <View style={[styles.nudgeBox, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "33", borderRadius: colors.radius / 2 }]}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={[styles.nudgeText, { color: colors.primary }]}>
              로그인하면 학습 기록을 안전하게 저장할 수 있어요
            </Text>
          </View>

          {/* Fields */}
          <View style={styles.fields}>
            <View style={[styles.inputWrap, { borderColor: colors.border, borderRadius: colors.radius / 2, backgroundColor: colors.card }]}>
              <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="이메일"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={[styles.inputWrap, { borderColor: colors.border, borderRadius: colors.radius / 2, backgroundColor: colors.card }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="비밀번호"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
            style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: colors.radius / 2, opacity: loading ? 0.7 : 1 }]}
          >
            <Text style={styles.submitBtnText}>{loading ? "처리 중..." : isLogin ? "로그인" : "가입하기"}</Text>
          </TouchableOpacity>

          {/* Switch */}
          <TouchableOpacity onPress={() => onSwitch(isLogin ? "signup" : "login")} style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
              {isLogin ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
            </Text>
            <Text style={[styles.switchLink, { color: colors.primary }]}>
              {isLogin ? "회원가입" : "로그인"}
            </Text>
          </TouchableOpacity>

          {/* Guest note */}
          <Text style={[styles.guestNote, { color: colors.mutedForeground }]}>
            로그인 없이도 모든 학습 기능을 사용할 수 있습니다
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Login nudge banner (shown in profile when guest) ──────────────────────────

function LoginNudgeBanner({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.nudgeBanner, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30", borderRadius: colors.radius }]}>
      <View style={styles.nudgeBannerTop}>
        <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
        <Text style={[styles.nudgeBannerText, { color: colors.foreground }]}>
          로그인하면 학습 기록을 안전하게 저장할 수 있어요
        </Text>
      </View>
      <Text style={[styles.nudgeBannerSub, { color: colors.mutedForeground }]}>
        지금은 기기 내부에만 저장됩니다. 기기를 바꾸면 기록이 사라질 수 있어요.
      </Text>
      <View style={styles.nudgeBannerBtns}>
        <TouchableOpacity
          onPress={onLogin}
          style={[styles.nudgeBtn, { backgroundColor: colors.primary, borderRadius: colors.radius / 2 }]}
        >
          <Text style={styles.nudgeBtnPrimaryText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSignup}
          style={[styles.nudgeBtnOutline, { borderColor: colors.primary, borderRadius: colors.radius / 2 }]}
        >
          <Text style={[styles.nudgeBtnOutlineText, { color: colors.primary }]}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { totalLearned, streak, savedWords, reviews, isLoggedIn, userEmail, displayName, signOut } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authVisible, setAuthVisible] = useState(false);

  const openLogin = () => { setAuthMode("login"); setAuthVisible(true); };
  const openSignup = () => { setAuthMode("signup"); setAuthVisible(true); };

  const level =
    totalLearned >= 100 ? "고급" :
    totalLearned >= 50  ? "중급" :
    totalLearned >= 20  ? "초급" : "입문";

  const levelProgress = Math.min((totalLearned % 50) / 50, 1);

  const days: { date: Date; studied: boolean }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ date: d, studied: Math.random() > 0.4 });
  }

  const achievements: Achievement[] = [
    { id: "1", icon: "star",           title: "첫 단어",  desc: "첫 번째 단어 학습",   unlocked: totalLearned >= 1 },
    { id: "2", icon: "flame",          title: "불꽃 학습", desc: "7일 연속 학습",        unlocked: streak >= 7 },
    { id: "3", icon: "trophy",         title: "50단어",    desc: "50개 단어 달성",       unlocked: totalLearned >= 50 },
    { id: "4", icon: "bookmark",       title: "수집가",    desc: "단어 10개 저장",       unlocked: savedWords.length >= 10 },
    { id: "5", icon: "refresh-circle", title: "복습왕",    desc: "복습 20회 완료",       unlocked: reviews.length >= 20 },
    { id: "6", icon: "school",         title: "학자",      desc: "100개 단어 달성",      unlocked: totalLearned >= 100 },
  ];

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile hero ──────────────────────────────────────── */}
        <LinearGradient
          colors={isLoggedIn ? [colors.primary, "#3DAB5E"] : ["#8E9EAB", "#6B7C8A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { borderRadius: colors.radius }]}
        >
          <View style={[styles.avatarCircle, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Ionicons name={isLoggedIn ? "person" : "person-outline"} size={32} color="#fff" />
          </View>

          <Text style={styles.heroName}>
            {isLoggedIn ? (displayName ?? userEmail ?? "학습자") : "게스트"}
          </Text>

          {isLoggedIn ? (
            <View style={[styles.levelBadge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
              <Text style={styles.levelText}>{level} 레벨</Text>
            </View>
          ) : (
            <View style={[styles.guestBadge, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
              <Ionicons name="person-circle-outline" size={13} color="rgba(255,255,255,0.9)" />
              <Text style={styles.guestBadgeText}>게스트 모드</Text>
            </View>
          )}

          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
              <View
                style={[styles.progressFill, { width: `${levelProgress * 100}%` as any, backgroundColor: colors.accent }]}
              />
            </View>
            <Text style={styles.progressLabel}>{totalLearned}개 학습 완료</Text>
          </View>

          {/* Logged-in: sign out link */}
          {isLoggedIn && (
            <TouchableOpacity onPress={() => Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
              { text: "취소", style: "cancel" },
              { text: "로그아웃", style: "destructive", onPress: signOut },
            ])} style={styles.signOutRow}>
              <Ionicons name="log-out-outline" size={14} color="rgba(255,255,255,0.75)" />
              <Text style={styles.signOutText}>로그아웃</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* ── Login nudge (guest only) ───────────────────────────── */}
        {!isLoggedIn && (
          <LoginNudgeBanner onLogin={openLogin} onSignup={openSignup} />
        )}

        {/* ── Stats ─────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { label: "학습 단어", value: totalLearned,       icon: "book",     color: colors.primary },
            { label: "연속 학습", value: `${streak}일`,      icon: "flame",    color: colors.accent },
            { label: "저장 단어", value: savedWords.length,  icon: "bookmark", color: colors.info },
          ].map((s) => (
            <View
              key={s.label}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            >
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Study calendar ────────────────────────────────────── */}
        <View style={[styles.calCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>학습 캘린더</Text>
          <Text style={[styles.calSub, { color: colors.mutedForeground }]}>최근 14일</Text>
          <View style={styles.calGrid}>
            {days.map((d, i) => (
              <View
                key={i}
                style={[styles.calDay, { backgroundColor: d.studied ? colors.primary : colors.secondary, borderRadius: 6 }]}
              >
                <Text style={[styles.calDayNum, { color: d.studied ? "#fff" : colors.mutedForeground }]}>
                  {d.date.getDate()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Achievements ──────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>업적</Text>
        <View style={styles.badgesGrid}>
          {achievements.map((a) => (
            <AchievementBadge key={a.id} a={a} />
          ))}
        </View>
      </ScrollView>

      {/* ── Auth Modal ────────────────────────────────────────────── */}
      <AuthModal
        visible={authVisible}
        mode={authMode}
        onClose={() => setAuthVisible(false)}
        onSwitch={(m) => setAuthMode(m)}
      />
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },

  // hero
  hero: { padding: 24, alignItems: "center", gap: 10 },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  heroName: { fontSize: 22, fontFamily: "NotoSansKR_700Bold", color: "#fff" },
  levelBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 99 },
  levelText: { fontSize: 13, fontFamily: "NotoSansKR_700Bold", color: "#fff" },
  guestBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99,
  },
  guestBadgeText: { fontSize: 13, fontFamily: "NotoSansKR_600SemiBold", color: "rgba(255,255,255,0.9)" },
  progressSection: { width: "100%", gap: 6 },
  progressTrack: { width: "100%", height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  progressLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: "NotoSansKR_400Regular", textAlign: "center" },
  signOutRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  signOutText: { fontSize: 12, fontFamily: "NotoSansKR_400Regular", color: "rgba(255,255,255,0.75)" },

  // nudge banner
  nudgeBanner: { borderWidth: 1, padding: 16, gap: 8 },
  nudgeBannerTop: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  nudgeBannerText: { flex: 1, fontSize: 14, fontFamily: "NotoSansKR_600SemiBold", lineHeight: 20 },
  nudgeBannerSub: { fontSize: 12, fontFamily: "NotoSansKR_400Regular", lineHeight: 18 },
  nudgeBannerBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  nudgeBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  nudgeBtnPrimaryText: { color: "#fff", fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },
  nudgeBtnOutline: { flex: 1, paddingVertical: 10, alignItems: "center", borderWidth: 1.5 },
  nudgeBtnOutlineText: { fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },

  // stats
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontFamily: "NotoSansKR_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "NotoSansKR_400Regular", textAlign: "center" },

  // calendar
  calCard: { borderWidth: 1, padding: 18, gap: 6 },
  sectionTitle: { fontSize: 18, fontFamily: "NotoSansKR_700Bold" },
  calSub: { fontSize: 12, fontFamily: "NotoSansKR_400Regular", marginBottom: 8 },
  calGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  calDay: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  calDayNum: { fontSize: 12, fontFamily: "NotoSansKR_600SemiBold" },

  // achievements
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: { width: "47%", borderWidth: 1, padding: 16, alignItems: "center", gap: 6 },
  badgeTitle: { fontSize: 13, fontFamily: "NotoSansKR_600SemiBold", textAlign: "center" },
  badgeDesc: { fontSize: 11, fontFamily: "NotoSansKR_400Regular", textAlign: "center" },

  // modal
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  modalSheet: {
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12,
    gap: 14,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 20, fontFamily: "NotoSansKR_700Bold" },

  // nudge inside modal
  nudgeBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderWidth: 1 },
  nudgeText: { flex: 1, fontSize: 13, fontFamily: "NotoSansKR_500Medium", lineHeight: 19 },

  // form
  fields: { gap: 10 },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "NotoSansKR_400Regular" },
  submitBtn: { paddingVertical: 14, alignItems: "center" },
  submitBtnText: { color: "#fff", fontSize: 16, fontFamily: "NotoSansKR_700Bold" },
  switchRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  switchText: { fontSize: 13, fontFamily: "NotoSansKR_400Regular" },
  switchLink: { fontSize: 13, fontFamily: "NotoSansKR_600SemiBold" },
  guestNote: { fontSize: 12, fontFamily: "NotoSansKR_400Regular", textAlign: "center", lineHeight: 18 },
});
