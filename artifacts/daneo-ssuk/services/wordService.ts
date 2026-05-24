// Word service — saved words persistence.
// Strategy: Supabase when available, AsyncStorage otherwise.
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { SavedWord } from "@/constants/mockData";

import { getCurrentUserId, getSupabase, isSupabaseEnabled } from "./supabase";

const STORAGE_KEY = "dss:savedWords";

// ── AsyncStorage helpers ───────────────────────────────────────────────────────

async function localGetSavedWords(): Promise<SavedWord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedWord[]) : [];
  } catch {
    return [];
  }
}

async function localSetSavedWords(words: SavedWord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getSavedWords(): Promise<SavedWord[]> {
  if (isSupabaseEnabled) {
    const userId = await getCurrentUserId();
    if (userId) {
      const { data, error } = await getSupabase()
        .from("saved_words")
        .select("word_id, saved_at")
        .eq("user_id", userId)
        .order("saved_at", { ascending: false });

      if (!error && data) {
        return (data as { word_id: string; saved_at: string }[]).map((row) => ({
          wordId: row.word_id,
          savedAt: row.saved_at,
        }));
      }
    }
  }
  return localGetSavedWords();
}

export async function saveWord(wordId: string): Promise<void> {
  if (isSupabaseEnabled) {
    const userId = await getCurrentUserId();
    if (userId) {
      await getSupabase()
        .from("saved_words")
        .upsert({ user_id: userId, word_id: wordId }, { onConflict: "user_id,word_id" });
      return;
    }
  }
  const current = await localGetSavedWords();
  if (current.some((s) => s.wordId === wordId)) return;
  await localSetSavedWords([...current, { wordId, savedAt: new Date().toISOString() }]);
}

export async function unsaveWord(wordId: string): Promise<void> {
  if (isSupabaseEnabled) {
    const userId = await getCurrentUserId();
    if (userId) {
      await getSupabase()
        .from("saved_words")
        .delete()
        .eq("user_id", userId)
        .eq("word_id", wordId);
      return;
    }
  }
  const current = await localGetSavedWords();
  await localSetSavedWords(current.filter((s) => s.wordId !== wordId));
}

export async function isWordSavedRemote(wordId: string): Promise<boolean> {
  const words = await getSavedWords();
  return words.some((s) => s.wordId === wordId);
}

// Sync local AsyncStorage → Supabase (call after sign-in)
export async function syncLocalToSupabase(): Promise<void> {
  if (!isSupabaseEnabled) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  const local = await localGetSavedWords();
  if (local.length === 0) return;

  const rows = local.map((s) => ({ user_id: userId, word_id: s.wordId }));
  await getSupabase()
    .from("saved_words")
    .upsert(rows, { onConflict: "user_id,word_id" });
}
