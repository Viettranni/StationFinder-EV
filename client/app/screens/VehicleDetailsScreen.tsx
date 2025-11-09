// screens/VehicleDetailsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { observer } from "mobx-react-lite";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { VehicleViewModel } from "../../src/presentation/viewmodels/VehicleViewModel";
import { containerPromise } from "../../src/di/container";
import { ChevronLeft } from "lucide-react-native";

const VehicleDetailsScreen: React.FC = observer(() => {
  const [vm, setVm] = useState<VehicleViewModel | null>(null);
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    (async () => {
      const container = await containerPromise;
      const vehicleVm = container.vehicleViewModel;
      setVm(vehicleVm);
    })();
  }, []);

  if (!vm || !vm.uiState.selectedVehicle) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? "#121212" : "#f9fafb" },
        ]}
      >
        <Text style={{ color: isDark ? "#fff" : "#000" }}>
          Loading vehicle...
        </Text>
      </View>
    );
  }

  const vehicle = vm.uiState.selectedVehicle;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleChooseCar = () => {
    navigation.navigate("screens/ChooseCarScreen"); // Adjust route name if needed
  };

  const renderValue = (value: any) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return value?.toString() ?? "-";
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
      {/* Header with Back icon */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={28} color={isDark ? "#D1D5DB" : "#111827"} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text
          style={[
            styles.screenTitle,
            { color: isDark ? "#F9FAFB" : "#111827" },
          ]}
        >
          Vehicle Details
        </Text>

        {Object.entries(vehicle).map(([key, value]) => (
          <View
            key={key}
            style={[
              styles.item,
              { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
            ]}
          >
            <Text
              style={[styles.key, { color: isDark ? "#D1D5DB" : "#374151" }]}
            >
              {key}
            </Text>
            <Text
              style={[styles.value, { color: isDark ? "#F9FAFB" : "#111827" }]}
            >
              {renderValue(value)}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer button */}
      <Pressable
        style={[
          styles.chooseButton,
          { backgroundColor: isDark ? "#22C55E" : "#10B981" },
        ]}
        onPress={handleChooseCar}
      >
        <Text style={styles.chooseButtonText}>Go back to Car selection</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", padding: 16, alignItems: "center" },
  backButton: { padding: 4 },
  contentContainer: { padding: 16, paddingBottom: 100 },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  item: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  key: { fontWeight: "600", fontSize: 16, marginBottom: 4 },
  value: { fontSize: 16, lineHeight: 20 },
  chooseButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
  },
  chooseButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});

export default VehicleDetailsScreen;
