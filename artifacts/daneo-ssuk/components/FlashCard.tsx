import React, { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SpeechBar } from "@/components/SpeechBar";
import { Word } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";
import { SpeechSpeed } from "@/hooks/useSpeech";

export interface FlashCardSpeechProps {
  isSpeaking: boolean;
  speechError: boolean;
  speed: SpeechSpeed;
  onToggle: () => void;
  onSpeedChange: (s: SpeechSpeed) => void;
  onReplay: () => void;
}

interface Props {
  word: Word;
  onFlip?: (flipped: boolean) => void;
  speechProps?: FlashCardSpeechProps;
}

export function FlashCard({ word, onFlip, speechProps }: Props) {
  const colors = useColors();
  const [flipped, setFlipped] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;
  const isFlipping = useRef(false);

  const frontInterpolate = animValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const handleFlip = () => {
    if (isFlipping.current) return;
    isFlipping.current = true;
    const toValue = flipped ? 0 : 180;
    Animated.spring(animValue, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => {
      isFlipping.current = false;
      const newFlipped = !flipped;
      setFlipped(newFlipped);
      onFlip?.(newFlipped);
    });
  };

  return (
    <TouchableOpacity onPress={handleFlip} activeOpacity={1} style={styles.container}>
      {/* Front */}
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderRadius: colors.radius,
            borderColor: colors.primary + "44",
            transform: [{ rotateY: frontInterpolate }],
            backfaceVisibility: "hidden",
          },
        ]}
      >
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>탭하여 뒤집기</Text>
        <Text style={[styles.frontWord, { color: colors.foreground }]}>{word.word}</Text>

        {/* Speech bar — compact mode inside card */}
        {speechProps ? (
          <View style={styles.speechWrapper}>
            <SpeechBar
              pronunciation={word.pronunciation}
              isSpeaking={speechProps.isSpeaking}
              speechError={speechProps.speechError}
              speed={speechProps.speed}
              onToggle={speechProps.onToggle}
              onSpeedChange={speechProps.onSpeedChange}
              onReplay={speechProps.onReplay}
              compact
            />
          </View>
        ) : (
          <Text style={[styles.pronunciation, { color: colors.mutedForeground }]}>
            {word.pronunciation}
          </Text>
        )}

        <View style={[styles.tapHint, { backgroundColor: colors.primary + "11" }]}>
          <Text style={[styles.tapText, { color: colors.primary }]}>의미 확인하기</Text>
        </View>
      </Animated.View>

      {/* Back */}
      <Animated.View
        style={[
          styles.card,
          styles.back,
          {
            backgroundColor: colors.primary + "0D",
            borderRadius: colors.radius,
            borderColor: colors.primary + "44",
            transform: [{ rotateY: backInterpolate }],
            backfaceVisibility: "hidden",
          },
        ]}
      >
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>단어 의미</Text>
        <Text style={[styles.backMeaning, { color: colors.foreground }]}>{word.meaning}</Text>
        <Text style={[styles.backExample, { color: colors.mutedForeground }]}>
          {word.example}
        </Text>
        <Text style={[styles.backExampleKr, { color: colors.primary }]}>
          {word.exampleKorean}
        </Text>
        <View style={[styles.tipBox, { backgroundColor: colors.accent + "22", borderRadius: colors.radius }]}>
          <Text style={[styles.tipLabel, { color: colors.accent }]}>암기 팁</Text>
          <Text style={[styles.tipText, { color: colors.foreground }]}>{word.memoryTip}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 400,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderWidth: 1.5,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  back: {
    justifyContent: "flex-start",
    paddingTop: 32,
  },
  hint: {
    fontSize: 12,
    fontFamily: "NotoSansKR_400Regular",
    position: "absolute",
    top: 20,
  },
  frontWord: {
    fontSize: 36,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -1,
    textAlign: "center",
  },
  speechWrapper: {
    width: "100%",
    marginTop: 4,
  },
  pronunciation: {
    fontSize: 16,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
  },
  tapHint: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    marginTop: 4,
  },
  tapText: {
    fontSize: 13,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  backMeaning: {
    fontSize: 28,
    fontFamily: "NotoSansKR_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
    marginTop: 16,
  },
  backExample: {
    fontSize: 14,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  backExampleKr: {
    fontSize: 13,
    fontFamily: "NotoSansKR_500Medium",
    textAlign: "center",
  },
  tipBox: {
    width: "100%",
    padding: 14,
    gap: 4,
    marginTop: 8,
  },
  tipLabel: {
    fontSize: 11,
    fontFamily: "NotoSansKR_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tipText: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
    lineHeight: 18,
  },
});
