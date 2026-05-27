// CameraScreen — Demo OCR flow connected to real vocabulary dataset
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
import { getLevelLabel, MOCK_WORDS } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ── Demo OCR result data ────────────────────────────────────────────────────
// Mix of words that exist in the local vocabulary database and words that don't.
// Empty id = word not found in the database (shows fallback in Word Detail).
const DEMO_RESULTS: { id: string; word: string; confidence: number }[] = [
  { id: "e25", word: "friend",       confidence: 98 }, // 초등 - in dataset
  { id: "m08", word: "curious",      confidence: 97 }, // 중등 - in dataset
  { id: "h01", word: "achieve",      confidence: 95 }, // 고등 - in dataset
  { id: "m03", word: "brave",        confidence: 94 }, // 중등 - in dataset
  { id: "h03", word: "analyze",      confidence: 91 }, // 고등 - in dataset
  { id: "h09", word: "equality",     confidence: 90 }, // 고등 - in dataset
  { id: "m04", word: "creative",     confidence: 88 }, // 중등 - in dataset
  { id: "m01", word: "kind",         confidence: 85 }, // 중등 - in dataset
  { id: "",    word: "important",    confidence: 83 }, // 미등록 - not in dataset
  { id: "",    word: "friendship",   confidence: 79 }, // 미등록 - not in dataset
  { id: "",    word: "significant",  confidence: 76 }, // 미등록 - not in dataset
  { id: "",    word: "perseverance", confidence: 72 }, // 미등록 - not in dataset
];

type Stage = "idle" | "scanning" | "results" | "saved";

// ── Helpers ──────────────────────────────────────────────────────────────────
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

// ── ScanLine animation ────────────────────────────────────────────────────────
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
  // Look up word from local vocabulary dataset
  const vocabWord = item.id ? MOCK_WORDS.find((w) => w.id === item.id) : null;
  const inDataset = !!vocabWord;
  const conf = item.confidence;
  const cColor = confidenceColor(conf);

  // Level badge color
  const levelColor = vocabWord
    ? vocabWord.level === "elementary"
      ? colors.primary
      : vocabWord.level === "middle"
      ? colors.info
      : colors.hard
    : colors.mutedForeground;

  const levelLabel = vocabWord ? getLevelLabel(vocabWord.level) : "미등록";

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

          {/* Level badge — 초등/중등/고등 or 미등록 */}
          <View style={[styles.levelBadge, { backgroundColor: levelColor + "22" }]}>
            <Text style={[styles.levelBadgeText, { color: levelColor }]}>
              {levelLabel}
            </Text>
          </View>

          {/* Pronunciation (only if word exists in dataset) */}
          {vocabWord && (
            <Text style={[styles.chipPron, { color: colors.mutedForeground }]}>
              {vocabWord.pronunciation}
            </Text>
          )}

          {alreadySaved && (
            <View style={[styles.savedBadge, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.savedBadgeText, { color: colors.primary }]}>저장됨</Text>
            </View>
          )}
        </View>

        {/* Korean meaning (only if in dataset) */}
        {vocabWord && (
          <Text style={[styles.chipMeaning, { color: colors.mutedForeground }]}>
            {vocabWord.meaning}
          </Text>
        )}

        {/* Not in dataset notice */}
        {!inDataset && (
          <Text style={[styles.chipMeaning, { color: colors.mutedForeground }]}>
            아직 단어장에 없는 단어입니다
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

  // Use word text as key for unknown words (id is empty)
  const getKey = (item: (typeof DEMO_RESULTS)[0]) => item.id || `unknown:${item.word}`;

  const allKeys = DEMO_RESULTS.map(getKey);
  const allSelected = selected.size === allKeys.length;
  // Count words NOT yet saved (only those in dataset)
  const newCount = DEMO_RESULTS.filter((d) => d.id && !isWordSaved(d.id)).length;

  // ── Actions ────────────────────────────────────────────────────────
  const runDemoScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStage("scanning");
    setSelected(new Set());
    setTimeout(() => {
      setStage("results");
      // Pre-select high-confidence words that exist in dataset and aren't already saved
      const autoSelect = new Set(
        DEMO_RESULTS
          .filter((d) => d.confidence >= 80 && d.id && !isWordSaved(d.id))
          .map(getKey)
      );
      setSelected(autoSelect);
    }, 1800);
  };

  const toggleWord = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(allSelected ? new Set() : new Set(allKeys));
  };

  const handleSave = async () => {
    if (selected.size === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Only save words that exist in the local vocabulary dataset
    const knownItems = DEMO_RESULTS.filter(
      (d) => d.id && selected.has(getKey(d))
    );
    await Promise.all(
      knownItems.flatMap((item) => [saveWord(item.id), addReview(item.id)])
    );

    setSavedCount(knownItems.length);
    setStage("saved");
  };

  const handleReset = () => {
    setStage("idle");
    setSelected(new Set());
    setSavedCount(0);
  };

  // Navigate to word detail — known words by id, unknown words by word text
  const navigateToWordDetail = (item: (typeof DEMO_RESULTS)[0]) => {
    if (item.id) {
      router.push({ pathname: "/word-detail", params: { id: item.id } });
    } else {
      router.push({ pathname: "/word-detail", params: { id: "", word: item.word } });
    }
  };

  const handleStudyFirst = () => {
    // Find first selected item
    const firstItem = DEMO_RESULTS.find((d) => selected.has(getKey(d))) ?? DEMO_RESULTS[0];
    navigateToWordDetail(firstItem);
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
        {/* ── IDLE ─────────────────────────────────────────────────── */}
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

        {/* ── SCANNING ─────────────────────────────────────────────── */}
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
            <MockPagePreview colors={colors} />
            <ScanLineAnim color={colors.primary} />
            <View style={styles.scanOverlay}>
              <View style={[styles.scanBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.scanBadgeText}>분석 중...</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── RESULTS ──────────────────────────────────────────────── */}
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
              {DEMO_RESULTS.map((item) => {
                const key = getKey(item);
                return (
                  <WordChip
                    key={key}
                    item={item}
                    selected={selected.has(key)}
                    onToggle={() => toggleWord(key)}
                    colors={colors}
                    alreadySaved={item.id ? isWordSaved(item.id) : false}
                  />
                );
              })}
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

        {/* ── SAVED ────────────────────────────────────────────────── */}
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

              <View style={[styles.summaryBox, { borderTopColor: colors.border }]}>
                <SummaryRow icon="bookmark-outline" text={`내 단어장  +${savedCount}개`} colors={colors} />
                <SummaryRow icon="layers-outline" text={`암기 큐  +${savedCount}개`} colors={colors} />
              </View>
            </View>

            {/* Saved word chips preview — tappable to view Word Detail */}
            <View style={styles.savedChipsWrap}>
              {DEMO_RESULTS
                .filter((d) => selected.has(getKey(d)))
                .slice(0, 6)
                .map((item) => {
                  const vocabWord = item.id ? MOCK_WORDS.find((x) => x.id === item.id) : null;
                  return (
                    <TouchableOpacity
                      key={getKey(item)}
                      onPress={() => navigateToWordDetail(item)}
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
                        {item.word}
                      </Text>
                      <Text style={[styles.savedChipMeaning, { color: colors.mutedForeground }]}>
                        {vocabWord ? vocabWord.meaning : "미등록"}
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

// ── Sub-components ──────────────────────────────────────────────────────────────

function MockPagePreview({ colors }: { colors: ReturnType<typeof useColors> }) {
  const lines = [
    ["Chapter 3", "Vocabulary"],
    ["friend", "achieve", "analyze"],
    ["curious", "brave", "equality"],
    ["creative", "kind"],
    ["important", "significant"],
    ["friendship", "perseverance"],
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
      <Text style={[styles.summaryText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

function NoticeBox({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View
      style={[
        styles.noticeBox,
        { backgroundColor: colors.secondary, borderRadius: colors.radius, borderColor: colors.border },
      ]}
    >
      <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
      <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
        실제 OCR 연동 전 데모 모드입니다. 8개 단어는 단어장에 등록되어 있으며, 4개는 미등록 단어 예시입니다.
      </Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
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
  headerAction: { fontSize: 15, fontFamily: "NotoSansKR_600SemiBold" },
  content: { padding: 20, gap: 16 },
  viewfinder: {
    height: 280,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  viewfinderScanning: { height: 280 },
  vcenter: { alignItems: "center", gap: 10, padding: 20 },
  vTitle: { fontSize: 15, fontFamily: "NotoSansKR_600SemiBold", textAlign: "center" },
  vSub: { fontSize: 12, fontFamily: "NotoSansKR_400Regular", textAlign: "center" },
  corner: { position: "absolute", width: 20, height: 20, borderColor: "#5BC878" },
  tl: { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: 12, right: 12, borderBottomWidth: 2, borderRightWidth: 2 },
  scanLine: { position: "absolute", left: 0, right: 0, height: 2, opacity: 0.8 },
  scanOverlay: { position: "absolute", bottom: 16, right: 16 },
  scanBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    gap: 6,
  },
  scanBadgeText: { color: "#fff", fontSize: 12, fontFamily: "NotoSansKR_600SemiBold" },
  tipsCard: { borderWidth: 1, padding: 16, gap: 10 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipText: { fontSize: 13, fontFamily: "NotoSansKR_400Regular" },
  btnGroup: { gap: 10 },
  photoPreview: { height: 180, borderWidth: 1.5 },
  photoOverlay: { position: "absolute", bottom: 12, left: 12 },
  detectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  detectedBadgeText: { color: "#fff", fontSize: 12, fontFamily: "NotoSansKR_600SemiBold" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 14,
  },
  statDivider: { width: 1, height: 32, marginHorizontal: 4 },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 18, fontFamily: "NotoSansKR_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "NotoSansKR_400Regular" },
  chipListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chipListTitle: { fontSize: 16, fontFamily: "NotoSansKR_700Bold" },
  toggleAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toggleAllText: { fontSize: 12, fontFamily: "NotoSansKR_500Medium" },
  chipList: { gap: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    padding: 12,
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
  chipTop: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  chipWord: { fontSize: 15, fontFamily: "NotoSansKR_700Bold" },
  levelBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  levelBadgeText: { fontSize: 10, fontFamily: "NotoSansKR_700Bold" },
  chipPron: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },
  savedBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  savedBadgeText: { fontSize: 10, fontFamily: "NotoSansKR_600SemiBold" },
  chipMeaning: { fontSize: 13, fontFamily: "NotoSansKR_400Regular" },
  confRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  confBarBg: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  confBarFill: { height: 4, borderRadius: 2 },
  confLabel: { fontSize: 11, fontFamily: "NotoSansKR_500Medium", minWidth: 60 },
  successCard: { borderWidth: 1, padding: 24, alignItems: "center", gap: 10 },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 22, fontFamily: "NotoSansKR_700Bold" },
  successSub: { fontSize: 14, fontFamily: "NotoSansKR_400Regular", textAlign: "center" },
  summaryBox: { width: "100%", borderTopWidth: 1, paddingTop: 12, gap: 8, marginTop: 4 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryText: { fontSize: 14, fontFamily: "NotoSansKR_500Medium" },
  savedChipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  savedChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
    minWidth: "44%",
    flex: 1,
  },
  savedChipMore: { justifyContent: "center", alignItems: "center" },
  savedChipWord: { fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },
  savedChipMeaning: { fontSize: 11, fontFamily: "NotoSansKR_400Regular" },
  mockPage: {
    width: "100%",
    height: "100%",
    padding: 16,
    gap: 8,
    justifyContent: "center",
  },
  mockLine: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  mockWord: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  mockWordText: { fontSize: 12 },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    padding: 12,
  },
  noticeText: { flex: 1, fontSize: 12, fontFamily: "NotoSansKR_400Regular", lineHeight: 18 },
  mockPageText: { fontSize: 11, fontFamily: "NotoSansKR_400Regular" },
});
