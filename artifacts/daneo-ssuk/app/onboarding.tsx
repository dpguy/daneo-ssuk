// OnboardingScreen — first-time user flow explaining the app in 4 steps
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

interface Step {
  icon: string;
  color: string;
  title: string;
  desc: string;
  sub: string;
}

const STEPS: Step[] = [
  {
    icon: "camera",
    color: "#5BC878",
    title: "교과서를 찍으세요",
    desc: "카메라로 교과서 페이지를 찍으면\n영어 단어를 자동으로 인식합니다",
    sub: "교과서 단어 기반 학습",
  },
  {
    icon: "text",
    color: "#5B9ED6",
    title: "단어를 선택하세요",
    desc: "인식된 단어 중에서\n내가 배우고 싶은 단어를 고릅니다",
    sub: "원하는 단어만 골라서 학습",
  },
  {
    icon: "albums",
    color: "#FFD95A",
    title: "플래시카드로 암기",
    desc: "카드를 뒤집어 뜻을 확인하고\n암기 팁으로 오래 기억하세요",
    sub: "매일 10분 영어 습관",
  },
  {
    icon: "refresh-circle",
    color: "#E88B5B",
    title: "자동 복습 스케줄",
    desc: "배운 단어는 망각 곡선에 맞춰\n1일 → 3일 → 7일 → 30일 자동 복습",
    sub: "반복 복습으로 오래 기억",
  },
];

function StepDot({ active, color }: { active: boolean; color: string }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.dot,
        {
          width: active ? 24 : 8,
          backgroundColor: active ? color : colors.border,
        },
      ]}
    />
  );
}

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const goNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      const next = step + 1;
      setStep(next);
      scrollRef.current?.scrollTo({ x: width * next, animated: true });
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace("/(tabs)");
  };

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx >= 0 && idx < STEPS.length) setStep(idx);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      <TouchableOpacity
        onPress={handleFinish}
        style={[styles.skipBtn, { paddingTop: topPad + 12 }]}
      >
        <Text style={[styles.skipText, { color: colors.mutedForeground }]}>건너뛰기</Text>
      </TouchableOpacity>

      {/* Scroll pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {STEPS.map((s, i) => (
          <View key={i} style={[styles.page, { width }]}>
            {/* Icon circle */}
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: s.color + "18", borderColor: s.color + "33" },
              ]}
            >
              <Ionicons name={s.icon as any} size={56} color={s.color} />
            </View>

            {/* Step number */}
            <View style={[styles.stepBadge, { backgroundColor: s.color + "22" }]}>
              <Text style={[styles.stepNum, { color: s.color }]}>Step {i + 1}</Text>
            </View>

            <Text style={[styles.stepTitle, { color: colors.foreground }]}>{s.title}</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{s.desc}</Text>

            {/* Sub tag */}
            <View
              style={[
                styles.subTag,
                { backgroundColor: s.color + "18", borderColor: s.color + "33" },
              ]}
            >
              <Ionicons name="checkmark-circle" size={14} color={s.color} />
              <Text style={[styles.subText, { color: s.color }]}>{s.sub}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom area */}
      <View style={[styles.bottom, { paddingBottom: bottomPad + 24 }]}>
        {/* Dots */}
        <View style={styles.dots}>
          {STEPS.map((s, i) => (
            <StepDot key={i} active={i === step} color={s.color} />
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          onPress={goNext}
          activeOpacity={0.85}
          style={[styles.cta, { borderRadius: colors.radius, overflow: "hidden" }]}
        >
          <LinearGradient
            colors={[current.color, current.color + "CC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>
              {isLast ? "시작하기" : "다음"}
            </Text>
            <Ionicons name={isLast ? "rocket" : "arrow-forward"} size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Guest mode note */}
        <Text style={[styles.guestNote, { color: colors.mutedForeground }]}>
          로그인 없이 바로 사용 가능 · 게스트 모드
        </Text>
      </View>

      {/* Parent trust badges */}
      <View
        style={[
          styles.trustBar,
          { backgroundColor: colors.primary + "0A", borderTopColor: colors.border },
        ]}
      >
        {[
          { icon: "book-outline", label: "교과서 단어 기반" },
          { icon: "time-outline", label: "매일 10분" },
          { icon: "shield-checkmark-outline", label: "광고 없음" },
        ].map((b) => (
          <View key={b.label} style={styles.trustItem}>
            <Ionicons name={b.icon as any} size={14} color={colors.primary} />
            <Text style={[styles.trustLabel, { color: colors.primary }]}>{b.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  skipBtn: {
    position: "absolute",
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "NotoSansKR_500Medium",
  },
  pager: { flex: 1 },
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 20,
    paddingTop: 60,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 99,
  },
  stepNum: {
    fontSize: 13,
    fontFamily: "NotoSansKR_700Bold",
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: "NotoSansKR_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  stepDesc: {
    fontSize: 15,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  subTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
  },
  subText: {
    fontSize: 13,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  bottom: {
    paddingHorizontal: 24,
    gap: 14,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  cta: {
    width: "100%",
    shadowColor: "#5BC878",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 16,
  },
  ctaText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "NotoSansKR_700Bold",
  },
  guestNote: {
    fontSize: 12,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
  },
  trustBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  trustLabel: {
    fontSize: 11,
    fontFamily: "NotoSansKR_600SemiBold",
  },
});
