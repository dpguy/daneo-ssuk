// Supabase database type definitions.
// These mirror the Drizzle schema in lib/db/src/schema/ and are used by
// the typed Supabase client. Re-run `supabase gen types` once you connect
// a real Supabase project — this hand-written version is the MVP placeholder.

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          supabase_id: string | null;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          level: string;
          grade: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      words: {
        Row: {
          id: string;
          word: string;
          pronunciation: string;
          meaning: string;
          example: string;
          example_korean: string;
          idiom: string | null;
          idiom_meaning: string | null;
          memory_tip: string | null;
          level: "elementary" | "middle" | "high";
          grade: number;
          unit: number;
          related_words: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["words"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["words"]["Insert"]>;
      };
      saved_words: {
        Row: {
          id: string;
          user_id: string;
          word_id: string;
          saved_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["saved_words"]["Row"], "id" | "saved_at">;
        Update: Partial<Database["public"]["Tables"]["saved_words"]["Insert"]>;
      };
      review_schedule: {
        Row: {
          id: string;
          user_id: string;
          word_id: string;
          next_review: string;
          interval: number;
          ease_factor: number;
          repetitions: number;
          last_difficulty: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["review_schedule"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["review_schedule"]["Insert"]>;
      };
      study_progress: {
        Row: {
          id: string;
          user_id: string;
          streak: number;
          longest_streak: number;
          total_learned: number;
          today_count: number;
          completed_units: string[];
          last_active_date: string | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["study_progress"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["study_progress"]["Insert"]>;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
          xp_awarded: number;
        };
        Insert: Omit<Database["public"]["Tables"]["achievements"]["Row"], "id" | "unlocked_at">;
        Update: Partial<Database["public"]["Tables"]["achievements"]["Insert"]>;
      };
    };
  };
}
