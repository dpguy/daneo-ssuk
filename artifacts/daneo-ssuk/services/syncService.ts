// syncService — migrate all local AsyncStorage data to Supabase after sign-in.
// Call this once immediately after a user authenticates.
import * as achievementService from "./achievementService";
import * as progressService from "./progressService";
import * as reviewService from "./reviewService";
import * as wordService from "./wordService";

export async function syncAllLocalToSupabase(): Promise<void> {
  await Promise.allSettled([
    wordService.syncLocalToSupabase(),
    reviewService.syncLocalToSupabase(),
    progressService.syncLocalToSupabase(),
    achievementService.syncLocalToSupabase(),
  ]);
}
