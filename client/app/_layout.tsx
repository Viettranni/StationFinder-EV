import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Main tab layout */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Hidden screens */}
        <Stack.Screen
          name="screens/ChooseCarScreen"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="screens/BatterySelectionScreen"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="screens/ChargingSpeedSelectionScreen"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="screens/CustomVehicleFormScreen"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="screens/BatterySizeInputScreen"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="screens/ChargingSpeedInputScreen"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="screens/VehicleSummaryScreen"
          options={{ headerShown: false, presentation: "card" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
