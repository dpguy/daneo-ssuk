// CameraScreen — Demo OCR scan with selectable word chips
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { DEMO_SCAN_WORDS, MOCK_WORDS } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

type Stage = "idle" | "scanning" | "results" | "error";

export default function CameraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const runDemoScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStage("scanning");
    setSelectedWord(null);
    setTimeout(() => {
      setStage("results");
    }, 1800);
  };

  const handleWordSelect = (wordId: string, word: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWord(wordId);
  };

  const handleGoToDetail = () => {
    if (!selectedWord) return;
    router.push({ pathname: "/word-detail", params: { id: selectedWord } });
  };

  const handleReset = () => {
    setStage("idle");
    setSelectedWord(null);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>단어 스캔</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 48 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Viewfinder */}
        <View
          style={[
            styles.viewfinder,
            {
              backgroundColor: colors.secondary,
              borderRadius: colors.radius,
              borderColor: stage === "results" ? colors.primary : colors.border,
              borderWidth: stage === "results" ? 2 : 1,
            },
          ]}
        >
          {stage === "idle" && (
            <View style={styles.vcenter}>
              <Ionicons name="camera-outline" size={52} color={colors.mutedForeground} />
              <Text style={[styles.vTitle, { color: colors.mutedForeground }]}>
                교과서 페이지를 촬영하세요
              </Text>
              <Text style={[styles.vSub, { color: colors.mutedForeground }]}>
                영어 단어를 자동으로 인식합니다
              </Text>
              {/* Corner guides */}
              <View style={[styles.corner, styles.tl, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.tr, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.bl, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.br, { borderColor: colors.primary }]} />
            </View>
          )}

          {stage === "scanning" && (
            <View style={styles.vcenter}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.scanningLabel, { color: colors.primary }]}>
                단어 인식 중...
              </Text>
              <Text style={[styles.vSub, { color: colors.mutedForeground }]}>
                텍스트를 분석하고 있습니다
              </Text>
            </View>
          )}

          {stage === "results" && (
            <View style={styles.resultsBox}>
              {/* Result header */}
              <View style={[styles.resultsHeader, { borderBottomColor: colors.border }]}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                <Text style={[styles.resultsTitle, { color: colors.primary }]}>
                  {DEMO_SCAN_WORDS.length}개 단어 감지됨
                </Text>
              </View>

              <Text style={[styles.selectHint, { color: colors.mutedForeground }]}>
                학습할 단어를 선택하세요
              </Text>

              {/* Selectable chips */}
              <View style={styles.chips}>
                {DEMO_SCAN_WORDS.map((item) => {
                  const isSelected = selectedWord === item.id;
                  const found = MOCK_WORDS.find((w) => w.id === item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleWordSelect(item.id, item.word)}
                      activeOpacity={0.8}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.primary + "18",
                          borderColor: isSelected ? colors.primary : colors.primary + "44",
                          borderRadius: colors.radius / 2,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipWord,
                          { color: isSelected ? "#fff" : colors.primary },
                        ]}
                      >
                        {item.word}
                      </Text>
                      {found && (
                        <Text
                          style={[
                            styles.chipMeaning,
                            {
                              color: isSelected
                                ? "rgba(255,255,255,0.8)"
                                : colors.mutedForeground,
                            },
                          ]}
                        >
                          {found.meaning}
                        </Text>
                      )}
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* OCR notice */}
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

        {/* Tips */}
        {stage === "idle" && (
          <View
            style={[
              styles.tips,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            {[
              { icon: "sunny-outline", text: "밝은 환경에서 촬영하세요" },
              { icon: "text-outline", text: "텍스트가 선명하게 보이도록" },
              { icon: "crop-outline", text: "단어가 화면 안에 들어오도록" },
            ].map((t) => (
              <View key={t.text} style={styles.tipRow}>
                <Ionicons name={t.icon as any} size={16} color={colors.mutedForeground} />
                <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{t.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Buttons */}
        {stage === "idle" && (
          <View style={styles.btnGroup}>
            <PrimaryButton
              title="데모 스캔 시작"
              onPress={runDemoScan}
              size="lg"
            />
            <PrimaryButton
              title="갤러리에서 선택"
              onPress={runDemoScan}
              variant="ghost"
              size="lg"
            />
          </View>
        )}

        {stage === "results" && (
          <View style={styles.btnGroup}>
            <PrimaryButton
              title={selectedWord ? "선택한 단어 학습하기" : "단어를 선택하세요"}
              onPress={handleGoToDetail}
              size="lg"
              disabled={!selectedWord}
            />
            <PrimaryButton
              title="다시 스캔"
              onPress={handleReset}
              variant="ghost"
              size="lg"
            />
          </View>
        )}

        {stage === "error" && (
          <PrimaryButton title="다시 시도" onPress={handleReset} size="lg" />
        )}
      </ScrollView>
    </View>
  );
}

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
  content: { padding: 20, gap: 16 },
  viewfinder: {
    width: "100%",
    minHeight: 320,
  },
  vcenter: {
    flex: 1,
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 28,
  },
  vTitle: { fontSize: 15, fontFamily: "NotoSansKR_500Medium", textAlign: "center" },
  vSub: { fontSize: 13, fontFamily: "NotoSansKR_400Regular", textAlign: "center" },
  scanningLabel: { fontSize: 16, fontFamily: "NotoSansKR_600SemiBold" },
  // corners
  corner: { position: "absolute", width: C, height: C, borderWidth: T },
  tl: { top: 14, left: 14, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 4 },
  tr: { top: 14, right: 14, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 4 },
  bl: { bottom: 14, left: 14, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 4 },
  br: { bottom: 14, right: 14, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 4 },
  // results
  resultsBox: { padding: 16, gap: 12 },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  resultsTitle: { fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },
  selectHint: { fontSize: 12, fontFamily: "NotoSansKR_400Regular" },
  chips: { gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  chipWord: { fontSize: 16, fontFamily: "NotoSansKR_700Bold", flex: 1 },
  chipMeaning: { fontSize: 13, fontFamily: "NotoSansKR_400Regular" },
  // notice
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
  tips: { borderWidth: 1, padding: 16, gap: 10 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  tipText: { fontSize: 13, fontFamily: "NotoSansKR_400Regular" },
  btnGroup: { gap: 10 },
});
