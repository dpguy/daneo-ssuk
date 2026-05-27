// EditCustomWordModal — bottom-sheet for creating OR editing a custom word.
// mode="create" (default): empty fields, title = "커스텀 단어 추가"
// mode="edit": pre-populated from initialValues, title = "단어 수정"
import React, { useEffect, useState } from "react";
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
  idiom: string;
  idiomMeaning: string;
  memoryTip: string;
  difficulty: string;
  /** Comma-separated English words, e.g. "brave, bold". Split to array on save. */
  relatedWords: string;
}

interface Props {
  visible: boolean;
  wordText: string;
  mode?: "create" | "edit";
  /** Pre-populate fields when mode is "edit". */
  initialValues?: Partial<CustomWordFields>;
  onSave: (fields: CustomWordFields) => void;
  onClose: () => void;
}

const DIFFICULTY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "선택 안 함" },
  { value: "beginner", label: "입문" },
  { value: "easy", label: "쉬움" },
  { value: "medium", label: "보통" },
  { value: "hard", label: "어려움" },
  { value: "advanced", label: "심화" },
  { value: "custom", label: "커스텀" },
];

/**
 * Bottom-sheet modal for creating or editing custom word details.
 * Required field: 한국어 뜻 (meaning). All other fields are optional.
 */
export function EditCustomWordModal({
  visible,
  wordText,
  mode = "create",
  initialValues,
  onSave,
  onClose,
}: Props) {
  const colors = useColors();
  const isEdit = mode === "edit";

  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [exampleKorean, setExampleKorean] = useState("");
  const [idiom, setIdiom] = useState("");
  const [idiomMeaning, setIdiomMeaning] = useState("");
  const [memoryTip, setMemoryTip] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [relatedWords, setRelatedWords] = useState("");
  const [diffOpen, setDiffOpen] = useState(false);

  // Sync fields whenever the modal opens (handles both create-reset and edit-prepopulate)
  useEffect(() => {
    if (!visible) return;
    setMeaning(initialValues?.meaning ?? "");
    setExample(initialValues?.example ?? "");
    setExampleKorean(initialValues?.exampleKorean ?? "");
    setIdiom(initialValues?.idiom ?? "");
    setIdiomMeaning(initialValues?.idiomMeaning ?? "");
    setMemoryTip(initialValues?.memoryTip ?? "");
    setDifficulty(initialValues?.difficulty ?? "");
    setRelatedWords(initialValues?.relatedWords ?? "");
    setDiffOpen(false);
  }, [visible]);

  const handleSave = () => {
    onSave({ meaning, example, exampleKorean, idiom, idiomMeaning, memoryTip, difficulty, relatedWords });
  };

  const handleClose = () => {
    onClose();
  };

  const canSave = meaning.trim().length > 0;

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
              {isEdit ? "단어 수정" : "커스텀 단어 추가"}
            </Text>
            <Text style={[styles.wordLabel, { color: colors.primary }]}>
              {wordText}
            </Text>
            {!isEdit && (
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                아래 정보를 입력하면 내 단어장에 저장됩니다.{"\n"}
                비워두면 기본값이 사용됩니다.
              </Text>
            )}

            {/* ── 한국어 뜻 (required) ──────────────────────────────────────── */}
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
                    borderColor: meaning.trim() ? colors.primary + "66" : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
                returnKeyType="next"
              />
            </View>

            {/* ── 영어 예문 ──────────────────────────────────────────────────── */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>영어 예문</Text>
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

            {/* ── 예문 해석 ──────────────────────────────────────────────────── */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>예문 해석</Text>
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

            {/* ── 관용구 / 숙어 ──────────────────────────────────────────────── */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>관용구 / 숙어</Text>
              <TextInput
                value={idiom}
                onChangeText={setIdiom}
                placeholder="예: show courage"
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

            {/* ── 관용구 뜻 ──────────────────────────────────────────────────── */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>관용구 뜻</Text>
              <TextInput
                value={idiomMeaning}
                onChangeText={setIdiomMeaning}
                placeholder="예: 용기를 보여주다"
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

            {/* ── 암기 팁 ────────────────────────────────────────────────────── */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>암기 팁</Text>
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
                returnKeyType="next"
              />
            </View>

            {/* ── 관련 단어 (comma-separated) ───────────────────────────────── */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>관련 단어</Text>
              <TextInput
                value={relatedWords}
                onChangeText={setRelatedWords}
                placeholder="예: brave, bold, daring"
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
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                쉼표(,)로 구분하여 입력하세요
              </Text>
            </View>

            {/* ── 난이도 picker ─────────────────────────────────────────────── */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>난이도</Text>
              <TouchableOpacity
                onPress={() => setDiffOpen((o) => !o)}
                style={[
                  styles.input,
                  styles.picker,
                  {
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <Text style={[styles.pickerText, { color: difficulty ? colors.foreground : colors.mutedForeground }]}>
                  {DIFFICULTY_OPTIONS.find((o) => o.value === difficulty)?.label ?? "선택 안 함"}
                </Text>
                <Text style={{ color: colors.mutedForeground }}>{diffOpen ? "▲" : "▼"}</Text>
              </TouchableOpacity>
              {diffOpen && (
                <View
                  style={[
                    styles.pickerMenu,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => {
                        setDifficulty(opt.value);
                        setDiffOpen(false);
                      }}
                      style={[
                        styles.pickerItem,
                        opt.value === difficulty && { backgroundColor: colors.primary + "18" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          {
                            color: opt.value === difficulty ? colors.primary : colors.foreground,
                            fontFamily: opt.value === difficulty
                              ? "NotoSansKR_600SemiBold"
                              : "NotoSansKR_400Regular",
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* ── Actions ───────────────────────────────────────────────────── */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleClose}
                style={[
                  styles.cancelBtn,
                  { borderColor: colors.border, borderRadius: colors.radius },
                ]}
              >
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={!canSave}
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: colors.radius,
                    opacity: canSave ? 1 : 0.4,
                  },
                ]}
              >
                <Text style={styles.saveBtnText}>
                  {isEdit ? "수정 저장" : "내 단어장에 저장"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "92%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  content: { padding: 24, gap: 16 },
  title: { fontSize: 20, fontFamily: "NotoSansKR_700Bold" },
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
  fieldLabel: { fontSize: 14, fontFamily: "NotoSansKR_600SemiBold" },
  hint: { fontSize: 11, fontFamily: "NotoSansKR_400Regular" },
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
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerText: { fontSize: 15, fontFamily: "NotoSansKR_400Regular" },
  pickerMenu: {
    borderWidth: 1,
    overflow: "hidden",
    marginTop: -4,
  },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 11 },
  pickerItemText: { fontSize: 14 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontFamily: "NotoSansKR_600SemiBold" },
  saveBtn: { flex: 2, paddingVertical: 13, alignItems: "center" },
  saveBtnText: { fontSize: 15, fontFamily: "NotoSansKR_700Bold", color: "#fff" },
});
