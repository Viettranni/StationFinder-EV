// =============================================================================
// SCREEN 1: Battery Size Input (pure MobX version, no local state, no prefill)
// =============================================================================
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { containerPromise } from "../../src/di/container";
import { VehicleViewModel } from "../../src/presentation/viewmodels/VehicleViewModel";
import { ChevronLeft } from "lucide-react-native";

const BatterySizeInputScreen: React.FC = observer(() => {
  const [vm, setVm] = useState<VehicleViewModel | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

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

  const currentValue = vm.selectedBattery ?? 0;
  const displayValue = currentValue.toString();

  const handleNumberPress = (num: string) => {
    const newValue = currentValue === 0 ? num : `${currentValue}${num}`;
    vm.selectBattery(Number(newValue));
  };

  const handleBackspace = () => {
    const str = currentValue.toString();
    if (str.length > 1) {
      vm.selectBattery(Number(str.slice(0, -1)));
    } else {
      vm.selectBattery(0);
    }
  };

  const handleContinue = () => {
    if (!vm.selectedBattery || vm.selectedBattery <= 0) {
      alert("Please enter a valid battery size before continuing.");
      return;
    }
    navigation.navigate("screens/ChargingSpeedSelectionScreen");
  };

  const isDisabled = !vm.selectedBattery || vm.selectedBattery <= 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#121212" : "#fff",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}
          >
            {vm.uiState.selectedVehicle?.make || "Select Vehicle"}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            What's your battery size?
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#555" }]}>
            Enter the usable capacity for your vehicle.
          </Text>
        </View>

        {/* Display */}
        <View style={styles.inputDisplay}>
          <Text style={[styles.inputText, { color: isDark ? "#fff" : "#000" }]}>
            {displayValue}
          </Text>
          <Text style={[styles.unitText, { color: isDark ? "#aaa" : "#555" }]}>
            kWh
          </Text>
        </View>

        {/* Number Pad */}
        <View style={styles.numberPad}>
          {[
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
          ].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.numberRow}>
              {row.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(num)}
                >
                  <Text
                    style={[
                      styles.numberText,
                      { color: isDark ? "#fff" : "#000" },
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={styles.numberRow}>
            <View style={styles.numberButton} />
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => handleNumberPress("0")}
            >
              <Text
                style={[styles.numberText, { color: isDark ? "#fff" : "#000" }]}
              >
                0
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.numberButton}
              onPress={handleBackspace}
            >
              <Text
                style={[styles.numberText, { color: isDark ? "#fff" : "#000" }]}
              >
                ⌫
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: isDisabled
                ? isDark
                  ? "#333"
                  : "#ccc"
                : isDark
                ? "#fff"
                : "#000",
            },
          ]}
          onPress={handleContinue}
          disabled={isDisabled}
        >
          <Text
            style={[
              styles.continueText,
              { color: isDisabled ? "#888" : isDark ? "#000" : "#fff" },
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.bottomIndicator,
          { backgroundColor: isDark ? "#333" : "#eee" },
        ]}
      />
    </View>
  );
});

export default BatterySizeInputScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "space-between", padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  placeholder: { width: 28 },
  titleContainer: { alignItems: "center", marginBottom: 40 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 14, marginTop: 6, textAlign: "center" },
  inputDisplay: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginVertical: 40,
  },
  inputText: { fontSize: 64, fontWeight: "bold" },
  unitText: { fontSize: 20, marginLeft: 8, marginBottom: 10 },
  numberPad: { alignItems: "center" },
  numberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginVertical: 8,
  },
  numberButton: {
    flex: 1,
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  numberText: { fontSize: 28, fontWeight: "600" },
  continueButton: {
    marginTop: 32,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: { fontSize: 16, fontWeight: "600" },
  bottomIndicator: {
    height: 4,
    alignSelf: "center",
    width: "20%",
    borderRadius: 2,
    marginBottom: 8,
  },
});
