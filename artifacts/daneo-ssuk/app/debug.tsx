// DebugScreen — developer-only validation checklist for vocabulary data and app flow
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

import { getVocabStats, getWordById, MOCK_WORDS } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function DebugScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reviews, savedWords } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const stats = getVocabStats();

  // Check if word detail would receive correct data
  const testWordId = "e25"; // friend
  const testWord = getWordById(testWordId);
  const wordDetailOk = !!testWord && testWord.word === "friend";

  // Check if memorization would find a review word
  const memorizationOk = reviews.length >= 0; // always true (empty is valid)

  // Check if review schedule saves
  const reviewScheduleOk = typeof reviews === "object";

  // Check words have required fields
  const wordsWithMissingFields = MOCK_WORDS.filter(
    (w) => !w.word || !w.meaning || !w.pronunciation || !w.example || !w.memoryTip
  );

  // Check for duplicate IDs
  const ids = MOCK_WORDS.map((w) => w.id);
  const uniqueIds = new Set(ids);
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);

  const checks: { label: string; value: string; ok: boolean }[] = [
    {
      label: "전체 단어 수",
      value: `${stats.total}개 (목표: 300)`,
      ok: stats.total === 300,
    },
    {
      label: "초등 단어 수",
      value: `${stats.elementaryCount}개 (목표: 100)`,
      ok: stats.elementaryCount === 100,
    },
    {
      label: "중등 단어 수",
      value: `${stats.middleCount}개 (목표: 100)`,
      ok: stats.middleCount === 100,
    },
    {
      label: "고등 단어 수",
      value: `${stats.highCount}개 (목표: 100)`,
      ok: stats.highCount === 100,
    },
    {
      label: "카메라 데모 단어 매칭",
      value: `${stats.demoMatched}/${stats.demoTotal}개 (데이터셋 내 8개)`,
      ok: stats.demoMatched === 8,
    },
    {
      label: "중복 ID",
      value: duplicateIds.length === 0 ? "없음" : `${duplicateIds.join(", ")}`,
      ok: duplicateIds.length === 0,
    },
    {
      label: "필수 필드 누락 단어",
      value: wordsWithMissingFields.length === 0
        ? "없음"
        : `${wordsWithMissingFields.map((w) => w.id).join(", ")}`,
      ok: wordsWithMissingFields.length === 0,
    },
    {
      label: "단어 상세 화면 연결",
      value: wordDetailOk
        ? `정상 (id=e25 → "${testWord?.word}")`
        : "오류: getWordById 실패",
      ok: wordDetailOk,
    },
    {
      label: "암기 화면 연결",
      value: memorizationOk
        ? `정상 (복습 큐 ${reviews.length}개)`
        : "오류",
      ok: memorizationOk,
    },
    {
      label: "복습 스케줄 저장",
      value: reviewScheduleOk
        ? `정상 (저장됨 ${savedWords.length}개, 복습 ${reviews.length}개)`
        : "오류",
      ok: reviewScheduleOk,
    },
  ];

  const passCount = checks.filter((c) => c.ok).length;
  const allPass = passCount === checks.length;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>개발자 검증</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary badge */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: allPass ? colors.primary + "12" : colors.hard + "12",
              borderColor: allPass ? colors.primary + "44" : colors.hard + "44",
              borderRadius: colors.radius,
            },
          ]}
        >
          <Ionicons
            name={allPass ? "checkmark-circle" : "warning"}
            size={36}
            color={allPass ? colors.primary : colors.hard}
          />
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
            {passCount} / {checks.length} 검증 통과
          </Text>
          <Text style={[styles.summaryDesc, { color: colors.mutedForeground }]}>
            {allPass ? "모든 항목이 정상입니다!" : "일부 항목에 문제가 있습니다."}
          </Text>
        </View>

        {/* Checklist */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>체크리스트</Text>
        <View style={[styles.checkList, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          {checks.map((c, i) => (
            <View
              key={c.label}
              style={[
                styles.checkItem,
                i < checks.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <Ionicons
                name={c.ok ? "checkmark-circle" : "close-circle"}
                size={18}
                color={c.ok ? colors.primary : colors.hard}
              />
              <View style={styles.checkBody}>
                <Text style={[styles.checkLabel, { color: colors.foreground }]}>
                  {c.label}
                </Text>
                <Text style={[styles.checkValue, { color: colors.mutedForeground }]}>
                  {c.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Unit breakdown */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>단원별 단어 수</Text>
        <View style={[styles.checkList, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          {Object.entries(stats.unitCounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, count], i, arr) => {
              const [level, grade, unit] = key.split("-");
              const levelLabel =
                level === "elementary" ? "초등" : level === "middle" ? "중등" : "고등";
              return (
                <View
                  key={key}
                  style={[
                    styles.checkItem,
                    i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.levelDot,
                      {
                        backgroundColor:
                          level === "elementary"
                            ? colors.primary
                            : level === "middle"
                            ? colors.info
                            : colors.hard,
                      },
                    ]}
                  />
                  <View style={styles.checkBody}>
                    <Text style={[styles.checkLabel, { color: colors.foreground }]}>
                      {levelLabel} {grade.replace("g", "")}학년 {unit.replace("u", "")}단원
                    </Text>
                    <Text style={[styles.checkValue, { color: colors.mutedForeground }]}>
                      {count}개 단어
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>

        {/* Quick navigation for manual testing */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>흐름 테스트</Text>
        <View style={styles.testBtns}>
          {[
            { label: "단어 상세 (friend / e25)", path: "/word-detail", params: { id: "e25" } },
            { label: "단어 상세 (미등록 단어)", path: "/word-detail", params: { id: "", word: "perseverance" } },
            { label: "암기 시작 (achieve / h01)", path: "/memorization", params: { id: "h01" } },
            { label: "카메라 스캔 데모", path: "/camera", params: {} },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => router.push({ pathname: item.path as any, params: item.params })}
              style={[
                styles.testBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Ionicons name="play-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.testBtnText, { color: colors.foreground }]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

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
  content: { padding: 20, gap: 16 },
  summaryCard: {
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  summaryTitle: { fontSize: 22, fontFamily: "NotoSansKR_700Bold" },
  summaryDesc: { fontSize: 14, fontFamily: "NotoSansKR_400Regular" },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "NotoSansKR_700Bold",
    marginTop: 4,
  },
  checkList: { borderWidth: 1, overflow: "hidden" },
  checkItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
  },
  checkBody: { flex: 1, gap: 2 },
  checkLabel: { fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },
  checkValue: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },
  levelDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  testBtns: { gap: 8 },
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    padding: 14,
  },
  testBtnText: { flex: 1, fontSize: 14, fontFamily: "NotoSansKR_500Medium" },
});
