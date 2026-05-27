// EditCustomWordModal — lets the user fill in meaning, example, and memory tip
// for a word not found in the dataset before saving it as a custom word.
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

export interface CustomWordFields {
  meaning: string;
  example: string;
  exampleKorean: string;
  memoryTip: string;
}

interface Props {
  visible: boolean;
  wordText: string;
  onSave: (fields: CustomWordFields) => void;
  onClose: () => void;
}

/**
 * Bottom-sheet style modal for editing custom word details before saving.
 * All fields are optional — sensible defaults are applied on save.
 */
export function EditCustomWordModal({ visible, wordText, onSave, onClose }: Props) {
  const colors = useColors();

  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [exampleKorean, setExampleKorean] = useState("");
  const [memoryTip, setMemoryTip] = useState("");

  const handleSave = () => {
    onSave({ meaning, example, exampleKorean, memoryTip });
    // Reset for next use
    setMeaning("");
    setExample("");
    setExampleKorean("");
    setMemoryTip("");
  };

  const handleClose = () => {
    setMeaning("");
    setExample("");
    setExampleKorean("");
    setMemoryTip("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderTopLeftRadius: colors.radius * 2,
              borderTopRightRadius: colors.radius * 2,
            },
          ]}
        >
          {/* Handle bar */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Text style={[styles.title, { color: colors.foreground }]}>
              커스텀 단어 추가
            </Text>
            <Text style={[styles.wordLabel, { color: colors.primary }]}>
              {wordText}
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              아래 정보를 입력하면 내 단어장에 저장됩니다.{"\n"}
              비워두면 기본값이 사용됩니다.
            </Text>

            {/* Meaning */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                한국어 뜻 <Text style={{ color: colors.hard }}>*</Text>
              </Text>
              <TextInput
                value={meaning}
                onChangeText={setMeaning}
                placeholder="예: 용기"
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
                returnKeyType="next"
              />
            </View>

            {/* Example */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                영어 예문
              </Text>
              <TextInput
                value={example}
                onChangeText={setExample}
                placeholder="예: She showed great courage."
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
                returnKeyType="next"
              />
            </View>

            {/* Example Korean */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                예문 해석
              </Text>
              <TextInput
                value={exampleKorean}
                onChangeText={setExampleKorean}
                placeholder="예: 그녀는 큰 용기를 보여주었다."
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
                returnKeyType="next"
              />
            </View>

            {/* Memory tip */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                암기 팁
              </Text>
              <TextInput
                value={memoryTip}
                onChangeText={setMemoryTip}
                placeholder="예: 어원이나 연상 이미지를 적어보세요"
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                style={[
                  styles.input,
                  styles.inputMultiline,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
                returnKeyType="done"
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleClose}
                style={[
                  styles.cancelBtn,
                  { borderColor: colors.border, borderRadius: colors.radius },
                ]}
              >
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
                  취소
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: colors.radius,
                    opacity: meaning.trim() ? 1 : 0.5,
                  },
                ]}
              >
                <Text style={styles.saveBtnText}>내 단어장에 저장</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "NotoSansKR_700Bold",
  },
  wordLabel: {
    fontSize: 28,
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: -1,
    marginTop: -4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "NotoSansKR_400Regular",
    lineHeight: 20,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    fontFamily: "NotoSansKR_400Regular",
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: "top",
    paddingTop: 11,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "NotoSansKR_700Bold",
    color: "#fff",
  },
});
