import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plug } from "lucide-react-native";
import { ChargingStationViewModel } from "../../src/presentation/viewmodels/ChargingStationViewModel";
import { observer } from "mobx-react-lite";

export type PlugOption = {
  value: string;
  label: string;
  description?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  vm: ChargingStationViewModel;
  plugOptions: PlugOption[];
};

const FiltersModal: React.FC<Props> = observer(
  ({ isOpen, onClose, vm, plugOptions }) => {
    // ======================== LOG UI STATE ========================
    const logUIState = () => {
      if (!vm) return;

      const state = vm.uiState;

      console.log("[FiltersModal] UI State:", {
        availableStations: state.availableStations.length,
        filteredStations: state.filteredStations.length,
        selectedStation: state.selectedStation,
        savedStation: state.savedStation,
        loading: state.loading,
        error: state.error,
        searchQuery: state.searchQuery,
        selectedStatus: state.selectedStatus,
        selectedConnectors: state.selectedConnectors,
        selectedAvailable: state.showOnlyAvailable,
      });
    };

    // ======================== EFFECT ========================
    useEffect(() => {
      if (isOpen) {
        // Reset to VM's current state
        vm.setSelectedConnectors(vm.uiState.selectedConnectors || []);
        vm.setShowOnlyAvailable?.(vm.uiState.showOnlyAvailable || false);

        // Log initial state when modal opens
        logUIState();
      }
    }, [isOpen, vm]);

    // ======================== HELPERS ========================
    const cols = useMemo(
      () => (plugOptions.length <= 4 ? 2 : 3),
      [plugOptions.length]
    );
    const tileWidth = cols === 2 ? "48%" : "31.5%";

    const togglePlug = (value: string) => {
      const current = [...vm.uiState.selectedConnectors];
      const updated = current.includes(value)
        ? current.filter((p) => p !== value)
        : [...current, value];
      vm.setSelectedConnectors(updated);

      logUIState(); // Log after toggling
    };

    const reset = () => {
      vm.setSelectedConnectors([]);
      vm.setShowOnlyAvailable?.(false);

      logUIState(); // Log after reset
    };

    const toggleAvailability = (value: boolean) => {
      vm.setShowOnlyAvailable?.(value);
      logUIState(); // Log after toggling availability
    };

    const apply = () => {
      // Filters already applied via VM
      onClose();
    };

    // ======================== JSX ========================
    return (
      <Modal
        visible={isOpen}
        animationType="fade"
        transparent
        onRequestClose={onClose}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <SafeAreaView edges={["bottom"]}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={styles.headerBtn}
              >
                <Text style={styles.linkText}>Cancel</Text>
              </Pressable>
              <Text style={styles.headerTitle}>Map settings</Text>
              <Pressable onPress={reset} hitSlop={12} style={styles.headerBtn}>
                <Text style={styles.linkText}>Reset</Text>
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView
              style={{ maxHeight: "80%" }}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 16,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Plugs */}
              <View style={{ marginTop: 16 }}>
                <Text style={styles.sectionTitle}>Plugs</Text>
                <View style={styles.tileWrap}>
                  {plugOptions.map((opt) => {
                    const selected = vm.uiState.selectedConnectors.includes(
                      opt.value
                    );
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => togglePlug(opt.value)}
                        style={[
                          styles.tile,
                          { width: tileWidth },
                          selected ? styles.tileSelected : styles.tileDefault,
                        ]}
                      >
                        {selected && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>✓</Text>
                          </View>
                        )}
                        <View
                          style={[
                            styles.iconCircle,
                            selected
                              ? styles.iconCircleSel
                              : styles.iconCircleDef,
                          ]}
                        >
                          <Plug
                            size={24}
                            color={selected ? "#FFFFFF" : "#6B7280"}
                          />
                        </View>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.tileLabel,
                            selected && styles.tileLabelSel,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Availability */}
              {vm.uiState.showOnlyAvailable !== undefined && (
                <View style={{ marginTop: 20 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>Show only available</Text>
                    <Switch
                      value={vm.uiState.showOnlyAvailable}
                      onValueChange={toggleAvailability}
                    />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Pressable style={styles.primaryBtn} onPress={apply}>
                <Text style={styles.primaryText}>Apply</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    );
  }
);

export default FiltersModal;

// ======================== STYLES ========================
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: { padding: 4, minWidth: 60, alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  linkText: { color: "#059669", fontWeight: "600" },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },
  tileWrap: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    height: 116,
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tileDefault: { borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" },
  tileSelected: {
    borderColor: "#34D399",
    backgroundColor: "rgba(52,211,153,0.08)",
    shadowColor: "#10B981",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconCircleDef: { backgroundColor: "#F3F4F6" },
  iconCircleSel: { backgroundColor: "#10B981" },
  tileLabel: { fontSize: 13, color: "#6B7280", fontWeight: "700" },
  tileLabelSel: { color: "#111827" },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
