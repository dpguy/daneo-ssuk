import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  title: string;
  content: string;
  highlight?: string;
  color?: string;
}

export function WordInfoCard({ title, content, highlight, color }: Props) {
  const colors = useColors();
  const accentColor = color ?? colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: accentColor + "0D",
          borderRadius: colors.radius,
          borderColor: accentColor + "33",
        },
      ]}
    >
      <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
      <Text style={[styles.content, { color: colors.foreground }]}>{content}</Text>
      {highlight && (
        <Text style={[styles.highlight, { color: colors.mutedForeground }]}>{highlight}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: 11,
    fontFamily: "NotoSansKR_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  content: {
    fontSize: 15,
    fontFamily: "NotoSansKR_500Medium",
    lineHeight: 22,
  },
  highlight: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
    lineHeight: 18,
  },
});
