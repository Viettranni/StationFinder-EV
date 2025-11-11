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
  TextInput,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useContainer } from "../../app/_layout";
import { VehicleViewModel } from "../../src/presentation/viewmodels/VehicleViewModel";
import { ChevronLeft } from "lucide-react-native";

const BatterySizeInputScreen: React.FC = observer(() => {
  const container = useContainer();
  const [vm, setVm] = useState<VehicleViewModel | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={28} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}>
          {vm.uiState.selectedVehicle?.brand}{" "}
          {vm.uiState.selectedVehicle?.make || "Select Vehicle"}
        </Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.content}>
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
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.inputText, { color: isDark ? "#fff" : "#000" }]}
            keyboardType="numeric"
            value={displayValue}
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              vm.selectBattery(isNaN(num) ? 0 : num);
            }}
            placeholder="0"
            placeholderTextColor={isDark ? "#888" : "#ccc"}
            showSoftInputOnFocus={false}
          />
          <Text style={[styles.unitText, { color: isDark ? "#aaa" : "#555" }]}>
            kW
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: { padding: 0 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  placeholder: { width: 28 },

  // Title left-aligned
  titleContainer: { alignItems: "flex-start", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "left" },
  subtitle: { fontSize: 12, marginTop: 8, textAlign: "left" },

  // Input left-aligned with underline
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#888",
    paddingBottom: 4,
    marginVertical: 12,
    justifyContent: "space-between",
  },
  inputText: {
    flex: 1,
    fontSize: 32,
    textAlign: "left",
  },
  unitText: {
    fontSize: 20,
    marginLeft: 8,
  },

  numberPad: { alignItems: "center", flexGrow: 1, justifyContent: "flex-end" },
  numberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%", // full width
    marginVertical: 4,
  },
  numberButton: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "rgba(100,100,100,0.2)", // different shade
  },
  numberText: { fontSize: 20, fontWeight: "600" },

  continueButton: {
    marginTop: 32,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: { fontSize: 16, fontWeight: "600" },
});
