import React, { useEffect, useState, createContext, useContext } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { containerPromise, Container } from "../src/di/container";

const ContainerContext = createContext<Container | null>(null);

export const useContainer = () => {
  const container = useContext(ContainerContext);
  if (!container)
    throw new Error("useContainer must be used within ContainerContext.Provider");
  return container;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [container, setContainer] = useState<Container | null>(null);

  useEffect(() => {
    (async () => {
      const instance = await containerPromise;
      setContainer(instance);
    })();
  }, []);

  // simple loading guard
  if (!container) return null;

  return (
    <ContainerContext.Provider value={container}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {/* Hide headers globally inside this Stack */}
        <Stack screenOptions={{ headerShown: false }}>
          {/* render the tabs group */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* fallback / not-found */}
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ContainerContext.Provider>
  );
}