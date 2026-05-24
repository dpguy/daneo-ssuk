import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_600SemiBold,
  NotoSansKR_700Bold,
  useFonts,
} from "@expo-google-fonts/noto-sans-kr";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, onboardingDone } = useApp();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!onboardingDone && !inOnboarding) {
      router.replace("/onboarding");
    } else if (onboardingDone && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, onboardingDone, segments]);

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="word-detail" options={{ headerShown: false }} />
      <Stack.Screen name="memorization" options={{ headerShown: false }} />
      <Stack.Screen name="spelling" options={{ headerShown: false }} />
      <Stack.Screen name="quiz" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_600SemiBold,
    NotoSansKR_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <OnboardingGuard>
                  <RootLayoutNav />
                </OnboardingGuard>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
