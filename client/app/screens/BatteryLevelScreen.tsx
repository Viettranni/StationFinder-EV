import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  useColorScheme,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VehicleViewModel } from "../../src/presentation/viewmodels/VehicleViewModel";
import { containerPromise } from "../../src/di/container";
import BatteryVisual from "../components/BatteryVisual";
import BatterySlider from "../components/BatterySlider";
import { ChevronLeft } from "lucide-react-native";

// ------------------- Battery Level Screen -------------------
const BatteryLevelScreen: React.FC = observer(() => {
  const [vm, setVm] = useState<VehicleViewModel | null>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<any>>();
  const isDark = useColorScheme() === "dark";

  useEffect(() => {
    (async () => {
      const container = await containerPromise;
      const vehicleVm = container.vehicleViewModel;
      setVm(vehicleVm);
    })();
  }, []);

  if (!vm || !vm.uiState.selectedVehicle) return null;

  const currentBattery = vm.uiState.selectedVehicle.currentBatteryState ?? 75;

  const handleSkip = () => {
    navigation.navigate("screens/VehicleDetailsScreen");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = async () => {
    try {
      await vm.saveSelectedVehicle();
      console.log("Saved vehicle:", vm.uiState.savedVehicle);
      navigation.navigate("screens/VehicleDetailsScreen");
    } catch (err: unknown) {
      Alert.alert(
        err instanceof Error ? err.message : "Failed to save battery level"
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: isDark ? "#121212" : "#f9fafb",
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={isDark ? "#F9FAFB" : "#111827"} />
        </Pressable>
        <Pressable onPress={handleSkip}>
          <Text
            style={[styles.skip, { color: isDark ? "#22C55E" : "#10B981" }]}
          >
            Skip
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <BatteryVisual percentage={currentBattery} isDark={isDark} />
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, { color: isDark ? "#F9FAFB" : "#111827" }]}
          >
            Set Your Current Battery Level
          </Text>
          <Text
            style={[
              styles.description,
              { color: isDark ? "#D1D5DB" : "#6B7280" },
            ]}
          >
            This helps us show your remaining range and charging options
            accurately, so you can plan your trips with confidence.
          </Text>
        </View>

        <BatterySlider
          value={currentBattery}
          onChange={(value) => vm.setCurrentBatteryState(value)}
          isDark={isDark}
        />
      </ScrollView>

      <Pressable
        style={[
          styles.button,
          { backgroundColor: isDark ? "#22C55E" : "#10B981" },
        ]}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  skip: { fontWeight: "600" },
  content: { flexGrow: 1, justifyContent: "flex-start" },
  titleContainer: {
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  description: { fontSize: 16, textAlign: "center" },
  button: { padding: 16, margin: 16, marginBottom: 48, borderRadius: 12 },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default BatteryLevelScreen;
