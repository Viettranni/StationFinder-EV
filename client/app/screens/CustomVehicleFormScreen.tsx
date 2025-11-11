import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useContainer } from "../_layout";
import { VehicleViewModel } from "../../src/presentation/viewmodels/VehicleViewModel";

const CustomVehicleFormScreen: React.FC = observer(() => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const container = useContainer();
  const [vm, setVm] = useState<VehicleViewModel | null>(null);

  useEffect(() => {
    (async () => {
      const vehicleVM = container.vehicleViewModel;
      setVm(vehicleVM);

      if (!vehicleVM.isCustomVehicleSelected) {
        vehicleVM.selectCustomVehicle();
      }
    })();
  }, []);

  if (!vm || !vm.uiState.selectedVehicle) return null;

  const vehicle = vm.uiState.selectedVehicle;
  const handleNext = () => {
    if (!vm) return;

    const vehicle = vm.uiState.selectedVehicle;
    if (!vehicle) return;

    const brandFilled = vehicle.brand.trim().length > 0;
    const makeFilled = vehicle.make.trim().length > 0;
    const efficiencyValid = vehicle.efficiency > 0;
    const maxChargingSpeedValid = (vehicle.maxChargingSpeed_kW?.[0] ?? 0) > 0;

    if (
      !brandFilled ||
      !makeFilled ||
      !efficiencyValid ||
      !maxChargingSpeedValid
    ) {
      alert("Please fill in all required fields before proceeding");
      return;
    }
    // All required fields are valid -> navigate
    navigation.navigate("screens/BatterySelectionScreen");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? "#121212" : "#fff",
            paddingTop: insets.top,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={28} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}
          >
            Custom Vehicle
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        >
          {/* Brand */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Brand
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "#f1f1f1",
                  color: isDark ? "#fff" : "#000",
                },
              ]}
              value={vehicle.brand}
              onChangeText={(text) => vm.setBrand(text)}
              placeholder="Enter brand"
              placeholderTextColor={isDark ? "#777" : "#999"}
              returnKeyType="done"
            />
          </View>

          {/* Model */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Model
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "#f1f1f1",
                  color: isDark ? "#fff" : "#000",
                },
              ]}
              value={vehicle.make}
              onChangeText={(text) => vm.setMake(text)}
              placeholder="Enter model"
              placeholderTextColor={isDark ? "#777" : "#999"}
              returnKeyType="done"
            />
          </View>

          {/* Efficiency */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Efficiency (Wh/km)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "#f1f1f1",
                  color: isDark ? "#fff" : "#000",
                },
              ]}
              value={
                vehicle.efficiency !== 0 ? vehicle.efficiency.toString() : ""
              }
              onChangeText={(text) => vm.setEfficiency(Number(text) || 0)}
              keyboardType="numeric"
              placeholder="Enter efficiency"
              placeholderTextColor={isDark ? "#777" : "#999"}
              returnKeyType="done"
            />
          </View>

          {/* Max Charging Speed */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Max Charging Speed (kW)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "#f1f1f1",
                  color: isDark ? "#fff" : "#000",
                },
              ]}
              value={vehicle.maxChargingSpeed_kW?.[0]?.toString() ?? ""}
              onChangeText={(text) => vm.setMaxChargingSpeed(Number(text) || 0)}
              keyboardType="numeric"
              placeholder="Enter charging speed"
              placeholderTextColor={isDark ? "#777" : "#999"}
              returnKeyType="done"
            />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: isDark ? "#fff" : "#000" },
            ]}
            onPress={handleNext}
          >
            <Text
              style={{
                color: isDark ? "#000" : "#fff",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Next
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
});

export default CustomVehicleFormScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
