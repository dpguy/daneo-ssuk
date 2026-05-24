// Service layer barrel export
export * as wordService from "./wordService";
export * as reviewService from "./reviewService";
export * as progressService from "./progressService";
export * as achievementService from "./achievementService";
export * from "./syncService";
export { isSupabaseEnabled, getSupabase, getCurrentUserId } from "./supabase";
