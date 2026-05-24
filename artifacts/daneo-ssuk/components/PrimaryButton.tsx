import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
}: Props) {
  const colors = useColors();

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const bgColor =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
      ? colors.secondary
      : variant === "danger"
      ? colors.destructive
      : "transparent";

  const textColor =
    variant === "primary"
      ? colors.primaryForeground
      : variant === "danger"
      ? colors.destructiveForeground
      : variant === "ghost"
      ? colors.primary
      : colors.secondaryForeground;

  const height = size === "sm" ? 36 : size === "lg" ? 56 : 48;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 17 : 15;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[
        styles.btn,
        {
          backgroundColor: bgColor,
          height,
          borderRadius: colors.radius,
          opacity: disabled ? 0.5 : 1,
          borderWidth: variant === "ghost" ? 1.5 : 0,
          borderColor: variant === "ghost" ? colors.primary : "transparent",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  text: {
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -0.3,
  },
});
