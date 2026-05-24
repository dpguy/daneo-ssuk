// Review service — spaced repetition schedule persistence.
// Strategy: Supabase when available, AsyncStorage otherwise.
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Review } from "@/constants/mockData";

import { getCurrentUserId, getSupabase, isSupabaseEnabled } from "./supabase";

const STORAGE_KEY = "dss:reviews";

interface ReviewRow {
  word_id: string;
  next_review: string;
  interval: number;
  ease_factor: number;
  repetitions: number;
}

// ── AsyncStorage helpers ───────────────────────────────────────────────────────

async function localGetReviews(): Promise<Review[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

async function localSetReviews(reviews: Review[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

// ── Spaced repetition ─────────────────────────────────────────────────────────

export function calcNextInterval(
  difficulty: "easy" | "hard" | "forgot",
  current: Review
): number {
  const { interval, repetitions } = current;
  if (difficulty === "forgot") return 1;
  if (difficulty === "hard") return Math.max(1, Math.floor(interval * 1.2));
  if (repetitions === 0) return 1;
  if (repetitions === 1) return 3;
  if (repetitions === 2) return 7;
  if (repetitions === 3) return 14;
  return 30;
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getReviews(): Promise<Review[]> {
  if (isSupabaseEnabled) {
    const userId = await getCurrentUserId();
    if (userId) {
      const { data, error } = await getSupabase()
        .from("review_schedule")
        .select("word_id, next_review, interval, ease_factor, repetitions")
        .eq("user_id", userId);

      if (!error && data) {
        return (data as ReviewRow[]).map((row) => ({
          wordId: row.word_id,
          nextReview: row.next_review,
          interval: row.interval,
          easeFactor: row.ease_factor,
          repetitions: row.repetitions,
        }));
      }
    }
  }
  return localGetReviews();
}

export async function addReview(wordId: string): Promise<void> {
  const nextReview = addDays(1);

  if (isSupabaseEnabled) {
    const userId = await getCurrentUserId();
    if (userId) {
      await getSupabase()
        .from("review_schedule")
        .upsert(
          {
            user_id: userId,
            word_id: wordId,
            next_review: nextReview,
            interval: 1,
            ease_factor: 2.5,
            repetitions: 0,
          },
          { onConflict: "user_id,word_id" }
        );
      return;
    }
  }
  const current = await localGetReviews();
  if (current.some((r) => r.wordId === wordId)) return;
  await localSetReviews([
    ...current,
    { wordId, nextReview, interval: 1, easeFactor: 2.5, repetitions: 0 },
  ]);
}

export async function updateReview(
  wordId: string,
  difficulty: "easy" | "hard" | "forgot"
): Promise<void> {
  const reviews = await getReviews();
  const current = reviews.find((r) => r.wordId === wordId);
  if (!current) return;

  const nextInterval = calcNextInterval(difficulty, current);
  const newRep = difficulty === "forgot" ? 0 : current.repetitions + 1;
  const nextReview = addDays(nextInterval);

  if (isSupabaseEnabled) {
    const userId = await getCurrentUserId();
    if (userId) {
      await getSupabase()
        .from("review_schedule")
        .update({
          next_review: nextReview,
          interval: nextInterval,
          repetitions: newRep,
          last_difficulty: difficulty,
        })
        .eq("user_id", userId)
        .eq("word_id", wordId);
      return;
    }
  }
  const updated = reviews.map((r) =>
    r.wordId === wordId
      ? { ...r, nextReview, interval: nextInterval, repetitions: newRep }
      : r
  );
  await localSetReviews(updated);
}

export function filterTodayReviews(reviews: Review[]): Review[] {
  const today = todayStr();
  return reviews.filter(
    (r) => new Date(r.nextReview).toISOString().split("T")[0] <= today
  );
}

export function filterUpcomingReviews(reviews: Review[]): Review[] {
  const today = todayStr();
  return reviews
    .filter((r) => new Date(r.nextReview).toISOString().split("T")[0] > today)
    .sort((a, b) => a.nextReview.localeCompare(b.nextReview));
}

// Sync local AsyncStorage → Supabase (call after sign-in)
export async function syncLocalToSupabase(): Promise<void> {
  if (!isSupabaseEnabled) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  const local = await localGetReviews();
  if (local.length === 0) return;

  const rows = local.map((r) => ({
    user_id: userId,
    word_id: r.wordId,
    next_review: r.nextReview,
    interval: r.interval,
    ease_factor: r.easeFactor,
    repetitions: r.repetitions,
  }));
  await getSupabase()
    .from("review_schedule")
    .upsert(rows, { onConflict: "user_id,word_id" });
}
