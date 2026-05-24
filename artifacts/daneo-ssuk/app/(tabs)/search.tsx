// SearchScreen — search vocabulary, recent, popular, saved
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WordCard } from "@/components/WordCard";
import { MOCK_WORDS, POPULAR_WORDS, Word } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Tab = "recent" | "popular" | "saved";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { savedWords } = useApp();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("recent");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const searchResults: Word[] = query.trim()
    ? MOCK_WORDS.filter(
        (w) =>
          w.word.toLowerCase().includes(query.toLowerCase()) ||
          w.meaning.includes(query)
      )
    : [];

  const popularWords = MOCK_WORDS.filter((w) => POPULAR_WORDS.includes(w.word));
  const savedWordsList = MOCK_WORDS.filter((w) => savedWords.some((s) => s.wordId === w.id));

  const TABS: { id: Tab; label: string }[] = [
    { id: "recent", label: "최근" },
    { id: "popular", label: "인기" },
    { id: "saved", label: "저장됨" },
  ];

  const displayWords =
    activeTab === "popular" ? popularWords : activeTab === "saved" ? savedWordsList : MOCK_WORDS.slice(0, 5);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Search header */}
      <View
        style={[
          styles.searchHeader,
          { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.secondary, borderRadius: colors.radius, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="단어 검색..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim() ? (
        // Search results
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <WordCard word={item} />}
          contentContainerStyle={styles.list}
          scrollEnabled={!!searchResults.length}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                "{query}"에 대한 결과가 없습니다
              </Text>
            </View>
          }
        />
      ) : (
        <>
          {/* Tab bar */}
          <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
            {TABS.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setActiveTab(t.id)}
                style={[
                  styles.tab,
                  activeTab === t.id && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === t.id ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={displayWords}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <WordCard word={item} />}
            contentContainerStyle={styles.list}
            scrollEnabled={!!displayWords.length}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="bookmark-outline" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  {activeTab === "saved" ? "저장한 단어가 없습니다" : "단어가 없습니다"}
                </Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  searchHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "NotoSansKR_400Regular",
    height: 44,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "NotoSansKR_600SemiBold",
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "NotoSansKR_400Regular",
    textAlign: "center",
  },
});
