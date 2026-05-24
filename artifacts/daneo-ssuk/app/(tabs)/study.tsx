// StudyScreen — browse words by level / grade / unit
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WordCard } from "@/components/WordCard";
import { MOCK_WORDS, TEXTBOOK_STRUCTURE } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Level = "elementary" | "middle" | "high";

interface Selection {
  level: Level | null;
  grade: number | null;
  unit: number | null;
}

export default function StudyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isUnitComplete } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [sel, setSel] = useState<Selection>({ level: null, grade: null, unit: null });

  const levelColors: Record<Level, string> = {
    elementary: colors.primary,
    middle: colors.info,
    high: colors.hard,
  };

  const selectedWords =
    sel.level && sel.grade && sel.unit
      ? MOCK_WORDS.filter((w) => w.level === sel.level && w.grade === sel.grade && w.unit === sel.unit)
      : [];

  const struct = sel.level ? TEXTBOOK_STRUCTURE[sel.level] : null;

  const reset = (to: "level" | "grade" | "unit") => {
    if (to === "level") setSel({ level: null, grade: null, unit: null });
    else if (to === "grade") setSel((s) => ({ ...s, grade: null, unit: null }));
    else setSel((s) => ({ ...s, unit: null }));
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>교과서 학습</Text>

        {/* Breadcrumb */}
        {sel.level && (
          <View style={styles.breadcrumb}>
            <TouchableOpacity onPress={() => reset("level")}>
              <Text style={[styles.crumb, { color: colors.primary }]}>
                {TEXTBOOK_STRUCTURE[sel.level].label}
              </Text>
            </TouchableOpacity>
            {sel.grade && (
              <>
                <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
                <TouchableOpacity onPress={() => reset("grade")}>
                  <Text style={[styles.crumb, { color: colors.primary }]}>{sel.grade}학년</Text>
                </TouchableOpacity>
              </>
            )}
            {sel.unit && (
              <>
                <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
                <Text style={[styles.crumb, { color: colors.mutedForeground }]}>{sel.unit}단원</Text>
              </>
            )}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
        {/* Level selection */}
        {!sel.level && (
          <View style={styles.grid}>
            {(Object.keys(TEXTBOOK_STRUCTURE) as Level[]).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                onPress={() => setSel({ level: lvl, grade: null, unit: null })}
                activeOpacity={0.82}
                style={[
                  styles.levelCard,
                  { backgroundColor: levelColors[lvl] + "18", borderColor: levelColors[lvl] + "44", borderRadius: colors.radius },
                ]}
              >
                <Ionicons name="school" size={28} color={levelColors[lvl]} />
                <Text style={[styles.levelLabel, { color: levelColors[lvl] }]}>
                  {TEXTBOOK_STRUCTURE[lvl].label}
                </Text>
                <Text style={[styles.levelSub, { color: colors.mutedForeground }]}>
                  {TEXTBOOK_STRUCTURE[lvl].grades[0]}~{TEXTBOOK_STRUCTURE[lvl].grades[TEXTBOOK_STRUCTURE[lvl].grades.length - 1]}학년
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Grade selection */}
        {sel.level && !sel.grade && struct && (
          <View style={styles.chipGrid}>
            {struct.grades.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setSel((s) => ({ ...s, grade: g }))}
                style={[
                  styles.chip,
                  {
                    backgroundColor: levelColors[sel.level!] + "18",
                    borderColor: levelColors[sel.level!] + "44",
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: levelColors[sel.level!] }]}>{g}학년</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Unit selection */}
        {sel.level && sel.grade && !sel.unit && struct && (
          <View style={styles.unitGrid}>
            {Array.from({ length: struct.unitsPerGrade }, (_, i) => i + 1).map((u) => {
              const done = isUnitComplete(sel.grade!, u);
              return (
                <TouchableOpacity
                  key={u}
                  onPress={() => setSel((s) => ({ ...s, unit: u }))}
                  style={[
                    styles.unitChip,
                    {
                      backgroundColor: done ? levelColors[sel.level!] : colors.card,
                      borderColor: done ? levelColors[sel.level!] : colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Text style={[styles.unitNum, { color: done ? "#fff" : colors.foreground }]}>
                    {u}단원
                  </Text>
                  {done && <Ionicons name="checkmark" size={14} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Vocabulary list */}
        {sel.unit && (
          <>
            {selectedWords.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="document-text-outline" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  이 단원의 단어가 없습니다
                </Text>
              </View>
            ) : (
              selectedWords.map((w) => <WordCard key={w.id} word={w} />)
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: "NotoSansKR_700Bold",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  crumb: {
    fontSize: 13,
    fontFamily: "NotoSansKR_500Medium",
  },
  content: { padding: 20, gap: 12 },
  grid: { gap: 12 },
  levelCard: {
    borderWidth: 1.5,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  levelLabel: {
    fontSize: 18,
    fontFamily: "NotoSansKR_700Bold",
  },
  levelSub: {
    fontSize: 12,
    fontFamily: "NotoSansKR_400Regular",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    borderWidth: 1.5,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minWidth: "44%",
    alignItems: "center",
  },
  chipText: {
    fontSize: 16,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  unitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  unitChip: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: "29%",
    justifyContent: "center",
  },
  unitNum: {
    fontSize: 14,
    fontFamily: "NotoSansKR_500Medium",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "NotoSansKR_400Regular",
  },
});
