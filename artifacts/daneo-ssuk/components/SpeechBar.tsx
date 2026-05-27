import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { SpeechSpeed } from "@/hooks/useSpeech";

const SPEEDS: SpeechSpeed[] = [0.8, 1.0, 1.2];
const SPEED_LABELS: Record<SpeechSpeed, string> = {
  0.8: "0.8x",
  1.0: "1.0x",
  1.2: "1.2x",
};

interface Props {
  pronunciation: string;
  isSpeaking: boolean;
  speechError: boolean;
  speed: SpeechSpeed;
  onToggle: () => void;
  onSpeedChange: (s: SpeechSpeed) => void;
  onReplay: () => void;
  compact?: boolean;
}

export function SpeechBar({
  pronunciation,
  isSpeaking,
  speechError,
  speed,
  onToggle,
  onSpeedChange,
  onReplay,
  compact = false,
}: Props) {
  const colors = useColors();

  const handleSpeedChange = (s: SpeechSpeed) => {
    Haptics.selectionAsync();
    onSpeedChange(s);
  };

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const handleReplay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReplay();
  };

  const mainColor = speechError ? colors.forgot : colors.primary;
  const bgColor = isSpeaking
    ? colors.primary + "18"
    : speechError
    ? colors.forgot + "12"
    : colors.secondary;
  const borderColor = isSpeaking
    ? colors.primary + "55"
    : speechError
    ? colors.forgot + "44"
    : "transparent";

  return (
    <View style={styles.wrapper}>
      {/* Main play row */}
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.75}
        style={[
          styles.row,
          {
            backgroundColor: bgColor,
            borderColor,
            borderRadius: colors.radius,
          },
          compact && styles.rowCompact,
        ]}
      >
        <Ionicons
          name={
            speechError
              ? "alert-circle"
              : isSpeaking
              ? "stop-circle"
              : "volume-high"
          }
          size={compact ? 16 : 18}
          color={mainColor}
        />
        <Text
          style={[
            styles.pronText,
            { color: colors.mutedForeground },
            compact && styles.pronTextCompact,
          ]}
          numberOfLines={1}
        >
          {pronunciation}
        </Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: isSpeaking
                ? colors.primary
                : speechError
                ? colors.forgot + "22"
                : colors.primary + "22",
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: isSpeaking ? "#fff" : speechError ? colors.forgot : colors.primary,
              },
            ]}
          >
            {speechError ? "오류" : isSpeaking ? "정지" : "듣기"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Speed + replay controls */}
      <View style={styles.controls}>
        {/* Speed pills */}
        <View style={styles.speedGroup}>
          {SPEEDS.map((s) => {
            const active = speed === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => handleSpeedChange(s)}
                activeOpacity={0.7}
                style={[
                  styles.speedPill,
                  {
                    backgroundColor: active ? colors.primary : colors.secondary,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: 99,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.speedText,
                    { color: active ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  {SPEED_LABELS[s]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Replay button */}
        <TouchableOpacity
          onPress={handleReplay}
          activeOpacity={0.7}
          style={[
            styles.replayBtn,
            {
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
          hitSlop={8}
        >
          <Ionicons name="refresh" size={14} color={colors.mutedForeground} />
          <Text style={[styles.replayText, { color: colors.mutedForeground }]}>다시</Text>
        </TouchableOpacity>
      </View>

      {/* Error fallback message */}
      {speechError && (
        <Text style={[styles.errorText, { color: colors.forgot }]}>
          발음을 재생할 수 없습니다 · 기기 TTS를 확인하세요
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    width: "100%",
  },
  rowCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pronText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "NotoSansKR_400Regular",
  },
  pronTextCompact: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  speedGroup: {
    flexDirection: "row",
    gap: 6,
  },
  speedPill: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
  },
  speedText: {
    fontSize: 12,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  replayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  replayText: {
    fontSize: 12,
    fontFamily: "NotoSansKR_500Medium",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
  },
});
