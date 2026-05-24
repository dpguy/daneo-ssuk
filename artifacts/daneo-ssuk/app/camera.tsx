// CameraScreen — Production-ready OCR result UX (demo data)
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { MOCK_WORDS } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ── Demo OCR result data ───────────────────────────────────────────────────────
const DEMO_RESULTS = [
  { id: "e3",  word: "friend",       confidence: 98 },
  { id: "m3",  word: "remember",     confidence: 97 },
  { id: "m1",  word: "important",    confidence: 95 },
  { id: "e6",  word: "curious",      confidence: 94 },
  { id: "h1",  word: "analyze",      confidence: 91 },
  { id: "h3",  word: "concept",      confidence: 90 },
  { id: "e7",  word: "friendship",   confidence: 88 },
  { id: "h5",  word: "significant",  confidence: 85 },
  { id: "m10", word: "goal",         confidence: 83 },
  { id: "m8",  word: "courage",      confidence: 79 },
  { id: "e8",  word: "environment",  confidence: 76 },
  { id: "h6",  word: "perseverance", confidence: 72 },
];

type Stage = "idle" | "scanning" | "results" | "saved";

// ── Helpers ────────────────────────────────────────────────────────────────────
function confidenceColor(c: number): string {
  if (c >= 90) return "#4CAF50";
  if (c >= 75) return "#FF9800";
  return "#F44336";
}

function confidenceLabel(c: number): string {
  if (c >= 90) return "높음";
  if (c >= 75) return "보통";
  return "낮음";
}

// ── ScanLine animation ─────────────────────────────────────────────────────────
function ScanLineAnim({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 220] });
  return (
    <Animated.View
      style={[styles.scanLine, { backgroundColor: color, transform: [{ translateY }] }]}
    />
  );
}

// ── Word chip ──────────────────────────────────────────────────────────────────
function WordChip({
  item,
  selected,
  onToggle,
  colors,
  alreadySaved,
}: {
  item: (typeof DEMO_RESULTS)[0];
  selected: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useColors>;
  alreadySaved: boolean;
}) {
  const word = MOCK_WORDS.find((w) => w.id === item.id);
  const conf = item.confidence;
  const cColor = confidenceColor(conf);

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.75}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? colors.primary + "18"
            : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: selected ? colors.primary : "transparent",
            borderColor: selected ? colors.primary : colors.border,
          },
        ]}
      >
        {selected && <Ionicons name="checkmark" size={12} color="#fff" />}
      </View>

      {/* Word info */}
      <View style={styles.chipBody}>
        <View style={styles.chipTop}>
          <Text style={[styles.chipWord, { color: colors.foreground }]}>
            {item.word}
          </Text>
          {word && (
            <Text style={[styles.chipPron, { color: colors.mutedForeground }]}>
              {word.pronunciation}
            </Text>
          )}
          {alreadySaved && (
            <View style={[styles.savedBadge, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.savedBadgeText, { color: colors.primary }]}>저장됨</Text>
            </View>
          )}
        </View>
        {word && (
          <Text style={[styles.chipMeaning, { color: colors.mutedForeground }]}>
            {word.meaning}
          </Text>
        )}
        {/* Confidence bar */}
        <View style={styles.confRow}>
          <View style={[styles.confBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.confBarFill, { width: `${conf}%`, backgroundColor: cColor }]} />
          </View>
          <Text style={[styles.confLabel, { color: cColor }]}>
            {conf}% · {confidenceLabel(conf)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function CameraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { saveWord, addReview, isWordSaved } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [stage, setStage] = useState<Stage>("idle");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedCount, setSavedCount] = useState(0);

  const allIds = DEMO_RESULTS.map((d) => d.id);
  const allSelected = selected.size === allIds.length;
  const newCount = DEMO_RESULTS.filter((d) => !isWordSaved(d.id)).length;

  // ── Actions ────────────────────────────────────────────────────────
  const runDemoScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStage("scanning");
    setSelected(new Set());
    setTimeout(() => {
      setStage("results");
      // Pre-select high-confidence unknowns
      const autoSelect = new Set(
        DEMO_RESULTS.filter((d) => d.confidence >= 80 && !isWordSaved(d.id)).map((d) => d.id)
      );
      setSelected(autoSelect);
    }, 1800);
  };

  const toggleWord = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(allSelected ? new Set() : new Set(allIds));
  };

  const handleSave = async () => {
    if (selected.size === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const ids = Array.from(selected);
    await Promise.all(ids.flatMap((id) => [saveWord(id), addReview(id)]));
    setSavedCount(ids.length);
    setStage("saved");
  };

  const handleReset = () => {
    setStage("idle");
    setSelected(new Set());
    setSavedCount(0);
  };

  const handleStudyFirst = () => {
    const firstId = Array.from(selected)[0] ?? DEMO_RESULTS[0].id;
    router.push({ pathname: "/word-detail", params: { id: firstId } });
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>단어 스캔</Text>
        {stage === "results" ? (
          <TouchableOpacity onPress={handleReset} hitSlop={12}>
            <Text style={[styles.headerAction, { color: colors.primary }]}>다시</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── IDLE ────────────────────────────────────────────────── */}
        {stage === "idle" && (
          <>
            <View
              style={[
                styles.viewfinder,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: colors.radius,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.vcenter}>
                <Ionicons name="camera-outline" size={52} color={colors.mutedForeground} />
                <Text style={[styles.vTitle, { color: colors.mutedForeground }]}>
                  교과서 페이지를 촬영하세요
                </Text>
                <Text style={[styles.vSub, { color: colors.mutedForeground }]}>
                  영어 단어를 자동으로 인식합니다
                </Text>
                <View style={[styles.corner, styles.tl, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.tr, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.bl, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.br, { borderColor: colors.primary }]} />
              </View>
            </View>

            <View
              style={[
                styles.tipsCard,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              {[
                { icon: "sunny-outline",  text: "밝은 환경에서 촬영하세요" },
                { icon: "text-outline",   text: "텍스트가 선명하게 보이도록" },
                { icon: "crop-outline",   text: "단어가 화면 안에 들어오도록" },
              ].map((t) => (
                <View key={t.text} style={styles.tipRow}>
                  <Ionicons name={t.icon as any} size={16} color={colors.mutedForeground} />
                  <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{t.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.btnGroup}>
              <PrimaryButton title="데모 스캔 시작" onPress={runDemoScan} size="lg" />
              <PrimaryButton title="갤러리에서 선택" onPress={runDemoScan} variant="ghost" size="lg" />
            </View>

            <NoticeBox colors={colors} />
          </>
        )}

        {/* ── SCANNING ────────────────────────────────────────────── */}
        {stage === "scanning" && (
          <View
            style={[
              styles.viewfinder,
              styles.viewfinderScanning,
              {
                backgroundColor: colors.secondary,
                borderRadius: colors.radius,
                borderColor: colors.primary,
                overflow: "hidden",
              },
            ]}
          >
            {/* Mock textbook page */}
            <MockPagePreview colors={colors} />
            {/* Scan line */}
            <ScanLineAnim color={colors.primary} />
            {/* Overlay */}
            <View style={styles.scanOverlay}>
              <View
                style={[styles.scanBadge, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.scanBadgeText}>분석 중...</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── RESULTS ─────────────────────────────────────────────── */}
        {stage === "results" && (
          <>
            {/* Photo preview */}
            <View
              style={[
                styles.photoPreview,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: colors.radius,
                  borderColor: colors.primary,
                  overflow: "hidden",
                },
              ]}
            >
              <MockPagePreview colors={colors} />
              <View style={styles.photoOverlay}>
                <View style={[styles.detectedBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
                  <Text style={styles.detectedBadgeText}>
                    {DEMO_RESULTS.length}개 단어 인식됨
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats row */}
            <View
              style={[
                styles.statsRow,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <StatItem icon="search" label="감지된 단어" value={`${DEMO_RESULTS.length}개`} colors={colors} />
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <StatItem icon="star" label="새 단어" value={`${newCount}개`} colors={colors} accent={colors.accent} />
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <StatItem icon="bookmark" label="선택됨" value={`${selected.size}개`} colors={colors} accent={colors.primary} />
            </View>

            {/* Chip list header */}
            <View style={styles.chipListHeader}>
              <Text style={[styles.chipListTitle, { color: colors.foreground }]}>
                단어 선택
              </Text>
              <TouchableOpacity
                onPress={toggleAll}
                style={[
                  styles.toggleAllBtn,
                  {
                    backgroundColor: allSelected ? colors.primary + "18" : colors.card,
                    borderColor: allSelected ? colors.primary : colors.border,
                    borderRadius: colors.radius / 2,
                  },
                ]}
              >
                <Ionicons
                  name={allSelected ? "checkmark-done-circle" : "ellipse-outline"}
                  size={15}
                  color={allSelected ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.toggleAllText,
                    { color: allSelected ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {allSelected ? "선택 해제" : "전체 선택"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Chips */}
            <View style={styles.chipList}>
              {DEMO_RESULTS.map((item) => (
                <WordChip
                  key={item.id}
                  item={item}
                  selected={selected.has(item.id)}
                  onToggle={() => toggleWord(item.id)}
                  colors={colors}
                  alreadySaved={isWordSaved(item.id)}
                />
              ))}
            </View>

            {/* Action buttons */}
            <View style={styles.btnGroup}>
              <PrimaryButton
                title={
                  selected.size > 0
                    ? `${selected.size}개 저장 · 암기 큐 추가`
                    : "단어를 선택하세요"
                }
                onPress={handleSave}
                size="lg"
                disabled={selected.size === 0}
              />
              <PrimaryButton
                title="단어 없이 계속"
                onPress={handleReset}
                variant="ghost"
                size="lg"
              />
            </View>

            <NoticeBox colors={colors} />
          </>
        )}

        {/* ── SAVED ───────────────────────────────────────────────── */}
        {stage === "saved" && (
          <>
            {/* Success card */}
            <View
              style={[
                styles.successCard,
                {
                  backgroundColor: colors.primary + "12",
                  borderColor: colors.primary + "44",
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={[styles.successIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={28} color="#fff" />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>
                저장 완료!
              </Text>
              <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
                {savedCount}개 단어가 내 단어장과 암기 큐에 추가되었습니다.
              </Text>

              {/* Summary rows */}
              <View style={[styles.summaryBox, { borderTopColor: colors.border }]}>
                <SummaryRow icon="bookmark-outline" text={`내 단어장  +${savedCount}개`} colors={colors} />
                <SummaryRow icon="layers-outline" text={`암기 큐  +${savedCount}개`} colors={colors} />
              </View>
            </View>

            {/* Saved word chips preview */}
            <View style={styles.savedChipsWrap}>
              {Array.from(selected)
                .slice(0, 6)
                .map((id) => {
                  const w = MOCK_WORDS.find((x) => x.id === id);
                  if (!w) return null;
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => router.push({ pathname: "/word-detail", params: { id } })}
                      style={[
                        styles.savedChip,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          borderRadius: colors.radius / 2,
                        },
                      ]}
                    >
                      <Text style={[styles.savedChipWord, { color: colors.foreground }]}>
                        {w.word}
                      </Text>
                      <Text style={[styles.savedChipMeaning, { color: colors.mutedForeground }]}>
                        {w.meaning}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              {selected.size > 6 && (
                <View
                  style={[
                    styles.savedChip,
                    styles.savedChipMore,
                    { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius / 2 },
                  ]}
                >
                  <Text style={[styles.savedChipWord, { color: colors.mutedForeground }]}>
                    +{selected.size - 6}개
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.btnGroup}>
              <PrimaryButton
                title="첫 번째 단어 학습 시작"
                onPress={handleStudyFirst}
                size="lg"
              />
              <PrimaryButton
                title="계속 스캔하기"
                onPress={handleReset}
                variant="ghost"
                size="lg"
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MockPagePreview({ colors }: { colors: ReturnType<typeof useColors> }) {
  const lines = [
    ["Chapter 3", "Vocabulary"],
    ["friend", "important", "analyze"],
    ["remember", "challenge", "curious"],
    ["perseverance", "environment"],
    ["significant", "concept", "goal"],
    ["courage", "remember"],
  ];
  return (
    <View style={[styles.mockPage, { backgroundColor: "#fffef6" }]}>
      {lines.map((row, i) => (
        <View key={i} style={styles.mockLine}>
          {row.map((w) => (
            <View
              key={w}
              style={[
                styles.mockWord,
                {
                  backgroundColor:
                    i === 0
                      ? colors.primary + "30"
                      : colors.primary + "15",
                },
              ]}
            >
              <Text
                style={[
                  styles.mockWordText,
                  { color: i === 0 ? colors.primary : "#555", fontWeight: i === 0 ? "700" : "400" },
                ]}
              >
                {w}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function StatItem({
  icon,
  label,
  value,
  colors,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  accent?: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: accent ?? colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function SummaryRow({
  icon,
  text,
  colors,
}: {
  icon: string;
  text: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons name={icon as any} size={16} color={colors.primary} />
      <Text style={[styles.summaryRowText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

function NoticeBox({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View
      style={[
        styles.noticeBox,
        {
          backgroundColor: colors.accent + "18",
          borderColor: colors.accent + "44",
          borderRadius: colors.radius,
        },
      ]}
    >
      <Ionicons name="information-circle" size={16} color={colors.accent} />
      <Text style={[styles.noticeText, { color: colors.foreground }]}>
        실제 OCR은 다음 버전에서 연결됩니다. 현재는 데모 단어를 표시합니다.
      </Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const C = 20;
const T = 3;

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
  headerTitle: { fontSize: 17, fontFamily: "NotoSansKR_600SemiBold" },
  headerAction: { fontSize: 15, fontFamily: "NotoSansKR_500Medium" },
  content: { padding: 16, gap: 14 },

  // viewfinder
  viewfinder: { width: "100%", minHeight: 260, borderWidth: 1 },
  viewfinderScanning: { minHeight: 280 },
  vcenter: {
    flex: 1,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 28,
  },
  vTitle: { fontSize: 15, fontFamily: "NotoSansKR_500Medium", textAlign: "center" },
  vSub: { fontSize: 13, fontFamily: "NotoSansKR_400Regular", textAlign: "center" },
  corner: { position: "absolute", width: C, height: C, borderWidth: T },
  tl: { top: 14, left: 14, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 4 },
  tr: { top: 14, right: 14, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 4 },
  bl: { bottom: 14, left: 14, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 4 },
  br: { bottom: 14, right: 14, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 4 },

  // scan animation
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.7,
  },
  scanOverlay: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scanBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scanBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "NotoSansKR_600SemiBold",
  },

  // mock page
  mockPage: {
    flex: 1,
    padding: 14,
    gap: 8,
    minHeight: 260,
    justifyContent: "center",
  },
  mockLine: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  mockWord: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  mockWordText: { fontSize: 13 },

  // photo preview
  photoPreview: {
    width: "100%",
    minHeight: 200,
    borderWidth: 2,
  },
  photoOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  detectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  detectedBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "NotoSansKR_600SemiBold",
  },

  // stats
  statsRow: {
    flexDirection: "row",
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 18, fontFamily: "NotoSansKR_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "NotoSansKR_400Regular" },
  statDivider: { width: 1, height: 32 },

  // chip list
  chipListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chipListTitle: { fontSize: 15, fontFamily: "NotoSansKR_600SemiBold" },
  toggleAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  toggleAllText: { fontSize: 13, fontFamily: "NotoSansKR_500Medium" },
  chipList: { gap: 8 },

  // chip
  chip: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1.5,
    padding: 12,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  chipBody: { flex: 1, gap: 4 },
  chipTop: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  chipWord: { fontSize: 16, fontFamily: "NotoSansKR_700Bold" },
  chipPron: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },
  savedBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  savedBadgeText: { fontSize: 11, fontFamily: "NotoSansKR_500Medium" },
  chipMeaning: { fontSize: 13, fontFamily: "NotoSansKR_400Regular" },
  confRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  confBarBg: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  confBarFill: { height: 4, borderRadius: 2 },
  confLabel: { fontSize: 11, fontFamily: "NotoSansKR_500Medium", minWidth: 60, textAlign: "right" },

  // success
  successCard: {
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  successTitle: { fontSize: 20, fontFamily: "NotoSansKR_700Bold" },
  successSub: {
    fontSize: 14,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  summaryBox: {
    width: "100%",
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 14,
    gap: 10,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryRowText: { fontSize: 14, fontFamily: "NotoSansKR_500Medium" },

  // saved chips preview
  savedChipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  savedChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
    alignItems: "center",
  },
  savedChipMore: { justifyContent: "center" },
  savedChipWord: { fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },
  savedChipMeaning: { fontSize: 11, fontFamily: "NotoSansKR_400Regular" },

  // misc
  tipsCard: { borderWidth: 1, padding: 16, gap: 10 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  tipText: { fontSize: 13, fontFamily: "NotoSansKR_400Regular" },
  btnGroup: { gap: 10 },
  noticeBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "NotoSansKR_400Regular",
    lineHeight: 18,
  },
});
