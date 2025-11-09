import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useColorScheme,
  ScrollView,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { containerPromise } from "../../src/di/container";
import { VehicleViewModel } from "../../src/presentation/viewmodels/VehicleViewModel";
import { ChevronLeft, Car } from "lucide-react-native";

const VehicleSummaryScreen: React.FC = observer(() => {
  const [vm, setVm] = useState<VehicleViewModel | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [useCustomConsumption, setUseCustomConsumption] = useState(false);

  useEffect(() => {
    (async () => {
      const container = await containerPromise;
      const vehicleVM = container.vehicleViewModel;
      setVm(vehicleVM);

      if (!vehicleVM.uiState.selectedVehicle) {
        vehicleVM.selectCustomVehicle();
      }
    })();
  }, []);

  if (!vm || !vm.uiState.selectedVehicle) return null;

  const { selectedVehicle } = vm.uiState;
  const consumptionValue = selectedVehicle?.efficiency ?? 45;

  const handleAddVehicle = async () => {
    try {
      await vm.saveSelectedVehicle();
      alert("Vehicle added successfully!");
      console.log("Saved vehicle:", vm.uiState.savedVehicle);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add vehicle");
    }
  };

  const bgColor = isDark ? "#121212" : "#f9fafb";
  const cardColor = isDark ? "#1e1e1e" : "#fff";
  const textColor = isDark ? "#fff" : "#000";
  const secondaryTextColor = isDark ? "#a1a1aa" : "#6b7280";
  const toggleOnColor = "#16a34a";
  const toggleOffColor = isDark ? "#3f3f46" : "#d1d5db";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor, paddingTop: insets.top },
      ]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={28} color={textColor} />
            <Text style={{ color: textColor, marginLeft: 4 }}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Image */}
        <View
          style={[styles.imageContainer, { marginBottom: insets.top + 16 }]}
        >
          {selectedVehicle?.imageUrl ? (
            <Image
              source={{ uri: selectedVehicle.imageUrl }}
              style={styles.vehicleImage}
              resizeMode="contain"
            />
          ) : (
            <Car size={80} color={textColor} />
          )}
        </View>

        {/* Vehicle Info */}
        <View style={[styles.infoContainer, { backgroundColor: cardColor }]}>
          <Text style={[styles.vehicleMake, { color: textColor }]}>
            {selectedVehicle?.brand || "Unknown"}
          </Text>
          <Text style={[styles.vehicleModel, { color: secondaryTextColor }]}>
            {selectedVehicle?.make || ""} (
            {selectedVehicle?.batterySizeKwh?.[0] || 0} kWh)
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
              Battery Size
            </Text>
            <Text style={[styles.detailValue, { color: textColor }]}>
              {selectedVehicle?.batterySizeKwh?.[0] || 0} kWh
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
              Max Charging Speed
            </Text>
            <Text style={[styles.detailValue, { color: textColor }]}>
              {selectedVehicle?.maxChargingSpeed_kW?.[0] || 0} kW
            </Text>
          </View>
        </View>

        {/* Consumption Section */}
        <View
          style={[styles.consumptionContainer, { backgroundColor: cardColor }]}
        >
          <Text style={[styles.consumptionInfo, { color: secondaryTextColor }]}>
            We calculate real-world consumption based on vehicle data. If you
            prefer, you can set a custom consumption value below.
          </Text>

          {/* Average Consumption */}
          <Text style={[styles.averageConsumption, { color: textColor }]}>
            Average Consumption: 18 kWh/100km
          </Text>

          <View style={styles.customToggleRow}>
            <View>
              <Text style={[styles.toggleTitle, { color: textColor }]}>
                Set custom consumption
              </Text>
              <Text
                style={[styles.toggleSubtitle, { color: secondaryTextColor }]}
              >
                Using your custom value
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setUseCustomConsumption(!useCustomConsumption)}
              style={[
                styles.toggleSwitch,
                {
                  backgroundColor: useCustomConsumption
                    ? toggleOnColor
                    : toggleOffColor,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  {
                    transform: [{ translateX: useCustomConsumption ? 24 : 2 }],
                  },
                ]}
              />
            </TouchableOpacity>
          </View>

          {useCustomConsumption && (
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabelRow}>
                <Text style={[styles.sliderLabel, { color: textColor }]}>
                  Consumption Value
                </Text>
                <Text style={[styles.sliderValue, { color: textColor }]}>
                  {consumptionValue} kWh
                </Text>
              </View>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={10}
                maximumValue={200}
                value={consumptionValue}
                minimumTrackTintColor={toggleOnColor}
                maximumTrackTintColor={isDark ? "#3f3f46" : "#e5e7eb"}
                step={1}
                onValueChange={(val) => vm.setEfficiency(val)}
              />
              <View style={styles.sliderBounds}>
                <Text style={{ color: secondaryTextColor }}>10 kWh</Text>
                <Text style={{ color: secondaryTextColor }}>200 kWh</Text>
              </View>
            </View>
          )}
        </View>

        {/* Add Vehicle Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: toggleOnColor }]}
          onPress={handleAddVehicle}
        >
          <Text style={styles.addButtonText}>Add Vehicle</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
});

export default VehicleSummaryScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  backButton: { flexDirection: "row", alignItems: "center" },
  imageContainer: { alignItems: "center" },
  vehicleImage: { width: 200, height: 100 },
  infoContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 64,
    marginBottom: 16,
  },
  vehicleMake: { fontSize: 20, fontWeight: "700" },
  vehicleModel: { fontSize: 14, marginBottom: 12 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: "600" },
  consumptionContainer: { padding: 16, borderRadius: 12, marginBottom: 16 },
  consumptionInfo: { fontSize: 12, marginBottom: 8 },
  averageConsumption: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  customToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  toggleSwitch: {
    width: 50,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 22,
    height: 22,
    backgroundColor: "#fff",
    borderRadius: 11,
    position: "absolute",
    left: 0,
  },
  toggleTitle: { fontSize: 14, fontWeight: "600" },
  toggleSubtitle: { fontSize: 12 },
  sliderContainer: { marginBottom: 12 },
  sliderLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sliderLabel: { fontSize: 14, fontWeight: "500" },
  sliderValue: { fontSize: 14, fontWeight: "600" },
  sliderBounds: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
