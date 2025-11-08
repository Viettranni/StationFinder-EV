import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from "react-native";
import { observer } from "mobx-react-lite";
import { VehicleViewModel } from "../../src/presentation/viewmodels/VehicleViewModel";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  vm: VehicleViewModel;
}

const BatterySelectionModal: React.FC<Props> = observer(({ vm }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={vm.isBatteryModalVisible}
      animationType="slide"
      transparent={false} // full screen
      onRequestClose={() => vm.closeBatteryModal()}
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
          <TouchableOpacity onPress={() => vm.closeBatteryModal()}>
            <ChevronLeft size={28} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}
          >
            {vm.uiState.selectedVehicle?.brand}{" "}
            {vm.uiState.selectedVehicle?.make}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
          Choose Battery Size
        </Text>

        {/* Battery Options */}
        <ScrollView contentContainerStyle={styles.optionsList}>
          {vm.batteryOptions.length === 0 && (
            <Text style={{ color: isDark ? "#fff" : "#000", padding: 16 }}>
              No battery options available
            </Text>
          )}
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
              onPress={() => vm.selectBattery(b)}
              activeOpacity={0.7}
            >
              <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 16 }}>
                {b} kWh
              </Text>
              <Text style={{ color: isDark ? "#aaa" : "#555", fontSize: 16 }}>
                ›
              </Text>
            </TouchableOpacity>
          ))}

          {/* Manual input */}
          <TouchableOpacity
            style={[
              styles.optionItem,
              { backgroundColor: isDark ? "#1a1a1a" : "#f8f8f8" },
            ]}
            onPress={() => vm.selectBattery(0)}
            activeOpacity={0.7}
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
    </Modal>
  );
});

export default BatterySelectionModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  optionsList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
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
