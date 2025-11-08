// BatterySelectionScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { observer } from "mobx-react-lite";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { containerPromise } from "../../src/di/container";
import { VehicleViewModel } from "../../src/presentation/viewmodels/VehicleViewModel";

const BatterySelectionScreen: React.FC = observer(() => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const [vm, setVm] = useState<VehicleViewModel>();

  useEffect(() => {
    (async () => {
      const container = await containerPromise;
      setVm(container.vehicleViewModel);
    })();
  }, []);

  if (!vm) return null;

  const handleSelectBattery = (value: number) => {
    vm.selectBattery(value);
    navigation.navigate("screens/ChargingSpeedSelectionScreen");
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: isDark ? "#121212" : "#fff",
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}>
          {vm.uiState.selectedVehicle?.brand} {vm.uiState.selectedVehicle?.make}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        Choose Battery Size
      </Text>

      <ScrollView contentContainerStyle={styles.optionsList}>
        {vm.batteryOptions.map((b, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.optionItem,
              {
                backgroundColor:
                  vm.selectedBattery === b
                    ? isDark
                      ? "#444"
                      : "#ddd"
                    : isDark
                    ? "#1a1a1a"
                    : "#f8f8f8",
              },
            ]}
            onPress={() => handleSelectBattery(b)}
          >
            <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 16 }}>
              {b} kWh
            </Text>
            <Text style={{ color: isDark ? "#aaa" : "#555", fontSize: 16 }}>
              ›
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.optionItem,
            { backgroundColor: isDark ? "#1a1a1a" : "#f8f8f8" },
          ]}
          onPress={() => handleSelectBattery(0)}
        >
          <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 16 }}>
            Input Manually
          </Text>
          <Text style={{ color: isDark ? "#aaa" : "#555", fontSize: 16 }}>
            ›
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
});

export default BatterySelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  optionsList: { paddingHorizontal: 16, paddingBottom: 32 },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
});
