import React, { useEffect, useState, createContext, useContext } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { containerPromise, Container } from "../src/di/container";

const ContainerContext = createContext<Container | null>(null);

export const useContainer = () => {
  const container = useContext(ContainerContext);
  if (!container)
    throw new Error(
      "useContainer must be used within ContainerContext.Provider"
    );
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

  // You can show a loading screen or splash here
  if (!container) return null;

  return (
    <ContainerContext.Provider value={container}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Main tab layout */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Hidden or additional screens */}
          <Stack.Screen
            name="screens/ChooseCarScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/BatterySelectionScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/ChargingSpeedSelectionScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/CustomVehicleFormScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/BatterySizeInputScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/ChargingSpeedInputScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/VehicleSummaryScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/BatteryLevelScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/VehicleDetailsScreen"
            options={{ headerShown: false }}
          />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
    </ContainerContext.Provider>
  );
}
