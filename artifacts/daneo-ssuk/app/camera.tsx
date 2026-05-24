// CameraScreen — capture image, OCR scan, highlight & select words
import { Ionicons } from "@expo/vector-icons";
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
import { MOCK_WORDS } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

// Mock OCR words detected from image
const OCR_MOCK_WORDS = ["perseverance", "abundant", "innovative", "courage", "friendship"];

type Stage = "idle" | "scanning" | "results" | "error";

export default function CameraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [detectedWords, setDetectedWords] = useState<string[]>([]);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const simulateScan = () => {
    setStage("scanning");
    setTimeout(() => {
      setDetectedWords(OCR_MOCK_WORDS);
      setStage("results");
    }, 2000);
  };

  const handleWordSelect = (word: string) => {
    const found = MOCK_WORDS.find((w) => w.word.toLowerCase() === word.toLowerCase());
    if (found) {
      router.push({ pathname: "/word-detail", params: { id: found.id } });
    } else {
      Alert.alert("단어를 찾을 수 없습니다", `"${word}"은(는) 데이터베이스에 없습니다.`);
    }
  };

  const handleReset = () => {
    setStage("idle");
    setDetectedWords([]);
  };

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
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 40 }]}>
        {/* Camera viewfinder mock */}
        <View
          style={[
            styles.viewfinder,
            {
              backgroundColor: colors.secondary,
              borderRadius: colors.radius,
              borderColor: stage === "results" ? colors.primary : colors.border,
            },
          ]}
        >
          {stage === "idle" && (
            <View style={styles.viewfinderInner}>
              <Ionicons name="camera-outline" size={56} color={colors.mutedForeground} />
              <Text style={[styles.viewfinderText, { color: colors.mutedForeground }]}>
                교과서 페이지를 촬영하세요
              </Text>
              <Text style={[styles.viewfinderSub, { color: colors.mutedForeground }]}>
                영어 단어가 자동으로 감지됩니다
              </Text>
              {/* Corner brackets */}
              <View style={[styles.corner, styles.tl, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.tr, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.bl, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.br, { borderColor: colors.primary }]} />
            </View>
          )}

          {stage === "scanning" && (
            <View style={styles.viewfinderInner}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.scanningText, { color: colors.primary }]}>단어 감지 중...</Text>
              <Text style={[styles.viewfinderSub, { color: colors.mutedForeground }]}>
                OCR로 텍스트를 분석하고 있습니다
              </Text>
            </View>
          )}

          {stage === "results" && (
            <View style={styles.resultsInner}>
              <View style={[styles.resultsHeader, { borderBottomColor: colors.border }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.resultsTitle, { color: colors.primary }]}>
                  {detectedWords.length}개 단어 감지됨
                </Text>
              </View>
              <View style={styles.wordChips}>
                {detectedWords.map((w) => (
                  <TouchableOpacity
                    key={w}
                    onPress={() => handleWordSelect(w)}
                    style={[
                      styles.wordChip,
                      {
                        backgroundColor: colors.primary + "18",
                        borderColor: colors.primary + "44",
                        borderRadius: colors.radius / 2,
                      },
                    ]}
                  >
                    <Text style={[styles.wordChipText, { color: colors.primary }]}>{w}</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {stage === "error" && (
            <View style={styles.viewfinderInner}>
              <Ionicons name="alert-circle" size={48} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>스캔 실패</Text>
              <Text style={[styles.viewfinderSub, { color: colors.mutedForeground }]}>
                밝은 곳에서 다시 시도해 주세요
              </Text>
            </View>
          )}
        </View>

        {/* Action hints */}
        {stage === "idle" && (
          <View style={[styles.hints, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            {[
              { icon: "sunny-outline", text: "밝은 환경에서 촬영" },
              { icon: "text-outline", text: "텍스트가 선명하게 보이도록" },
              { icon: "crop-outline", text: "단어가 화면 안에 들어오도록" },
            ].map((h) => (
              <View key={h.text} style={styles.hintRow}>
                <Ionicons name={h.icon as any} size={16} color={colors.mutedForeground} />
                <Text style={[styles.hintText, { color: colors.mutedForeground }]}>{h.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Buttons */}
        {stage === "idle" && (
          <View style={styles.btnGroup}>
            <PrimaryButton
              title="카메라로 촬영"
              onPress={simulateScan}
              size="lg"
            />
            <PrimaryButton
              title="갤러리에서 선택"
              onPress={simulateScan}
              variant="ghost"
              size="lg"
            />
          </View>
        )}

        {stage === "results" && (
          <View style={styles.btnGroup}>
            <PrimaryButton
              title="원하는 단어를 선택하세요"
              onPress={() => {}}
              variant="secondary"
              size="lg"
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
          <PrimaryButton
            title="다시 시도"
            onPress={handleReset}
            size="lg"
            style={styles.retryBtn}
          />
        )}
      </ScrollView>
    </View>
  );
}

const CORNER_SIZE = 20;
const CORNER_THICKNESS = 3;

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
  headerTitle: {
    fontSize: 17,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  viewfinder: {
    width: "100%",
    minHeight: 300,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  viewfinderInner: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 30,
  },
  viewfinderText: {
    fontSize: 15,
    fontFamily: "NotoSansKR_500Medium",
    textAlign: "center",
  },
  viewfinderSub: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
  },
  scanningText: {
    fontSize: 16,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  // Viewfinder corner brackets
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderWidth: CORNER_THICKNESS,
  },
  tl: { top: 16, left: 16, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 4 },
  tr: { top: 16, right: 16, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 4 },
  bl: { bottom: 16, left: 16, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 4 },
  br: { bottom: 16, right: 16, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 4 },
  resultsInner: {
    flex: 1,
    minHeight: 300,
    padding: 16,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 14,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  wordChips: {
    gap: 8,
  },
  wordChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  wordChipText: {
    fontSize: 16,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  hints: {
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hintText: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
  },
  btnGroup: {
    gap: 10,
  },
  retryBtn: {
    alignSelf: "stretch",
  },
});
