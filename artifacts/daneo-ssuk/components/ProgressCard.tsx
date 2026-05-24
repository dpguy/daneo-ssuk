import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function ProgressCard({ label, value, subtitle, color }: Props) {
  const colors = useColors();
  const accentColor = color ?? colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 2,
  },
  value: {
    fontSize: 28,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -1,
  },
  label: {
    fontSize: 13,
    fontFamily: "NotoSansKR_600SemiBold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
  },
});
