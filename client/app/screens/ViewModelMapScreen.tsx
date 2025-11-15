import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  LayoutChangeEvent,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { observer } from "mobx-react-lite";
import {
  Search,
  SlidersHorizontal,
  Moon,
  Sun,
  Crosshair,
  ChevronUp,
} from "lucide-react-native";
import { useContainer } from "../../app/_layout";
import { ChargingStationViewModel } from "../../src/presentation/viewmodels/ChargingStationViewModel";

const GAP_ABOVE_TAB = 10;
const SHEET_HEADER_HEIGHT = 56;
const SHEET_BODY_MAX = 320;
const FAB_OFFSET_ABOVE_SHEET = 16;

const ViewModelMapViewScreen: React.FC = observer(() => {
  const container = useContainer();
  const [vm, setVm] = useState<ChargingStationViewModel>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalExpanded, setIsModalExpanded] = useState(false);
  const [sheetMeasuredHeight, setSheetMeasuredHeight] =
    useState<number>(SHEET_HEADER_HEIGHT);
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = isDarkMode || scheme === "dark";

  const sheetBottom = GAP_ABOVE_TAB;
  const fabsBottom = sheetBottom + sheetMeasuredHeight + FAB_OFFSET_ABOVE_SHEET;

  const onSheetLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h !== sheetMeasuredHeight) setSheetMeasuredHeight(h);
  };

  // ======================== VIEWMODEL INIT ========================
  useEffect(() => {
    (async () => {
      const chargingVM = container.chargingStationViewModel;
      setVm(chargingVM);

      console.log("[MapViewScreen] Preloading stations and connectors...");
      await Promise.all([
        chargingVM.fetchAvailableStations(),
        chargingVM.fetchSavedConnectors(),
      ]);
      console.log("[MapViewScreen] Preloading complete");
    })();
  }, [container]);

  if (!vm || vm.uiState.loading) {
    return (
      <View
        style={[
          styles.root,
          {
            backgroundColor: isDark ? "#121212" : "#fff",
            paddingTop: insets.top,
          },
        ]}
      >
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
      </View>
    );
  }

  const { filteredStations, searchQuery } = vm.uiState;

  // ======================== LOG FUNCTION ========================
  const logUIState = () => {
    if (!vm) return;
    const state = vm.uiState;
    console.log("[MapViewScreen] UI State:", {
      availableStations: state.availableStations.length,
      filteredStations: state.filteredStations.length,
      selectedStation: state.selectedStation,
      savedStation: state.savedStation,
      loading: state.loading,
      error: state.error,
      searchQuery: state.searchQuery,
      selectedStatus: state.selectedStatus,
      selectedConnectors: state.selectedConnectors,
    });
  };

  // ======================== WRAPPERS ========================
  const handleSearchChange = (text: string) => {
    console.log("[MapViewScreen] Search query changed:", text);
    vm?.setSearchQuery(text);
    logUIState();
  };

  const handleConnectorPress = (connectorId: string) => {
    console.log("[MapViewScreen] Connector selected:", connectorId);
    vm?.setSelectedConnectors([connectorId]);
    logUIState();
  };

  const handleToggleDarkMode = () => {
    console.log("[MapViewScreen] Dark mode toggled:", !isDarkMode);
    setIsDarkMode((v) => !v);
    logUIState();
  };

  const handleCenterPress = () => {
    console.log("[MapViewScreen] Center map pressed");
    logUIState();
  };

  const handleToggleSheet = () => {
    console.log("[MapViewScreen] Sheet expanded toggled:", !isModalExpanded);
    setIsModalExpanded((v) => !v);
    logUIState();
  };

  // ======================== RENDER ========================
  return (
    <View
      style={[styles.root, { backgroundColor: isDark ? "#121212" : "#fff" }]}
    >
      <View
        style={[
          styles.mapBackground,
          { backgroundColor: isDark ? "#1E1E1E" : "#E5E5E5" },
        ]}
      />

      <SafeAreaView style={styles.safeAreaTop}>
        <View style={[styles.topWrap, { paddingTop: insets.top + 16 }]}>
          <View style={styles.searchRow}>
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: isDark ? "#2C2C2C" : "#fff" },
              ]}
            >
              <SlidersHorizontal
                size={20}
                color={isDark ? "#E5E7EB" : "#374151"}
              />
            </Pressable>

            <View
              style={[
                styles.searchBox,
                { backgroundColor: isDark ? "#2C2C2C" : "#fff" },
              ]}
            >
              <View style={styles.searchInnerRow}>
                <Search size={20} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
                <TextInput
                  placeholder="Select the destination..."
                  placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                  style={[
                    styles.searchInput,
                    { color: isDark ? "#E5E7EB" : "#111827" },
                  ]}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                />
              </View>
            </View>
          </View>

          <View style={styles.chipsRow}>
            {vm.connectorTypes.map((c) => {
              const isSelected = vm.uiState.selectedConnectors.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? "#4B5563"
                          : "#E0E7FF"
                        : isDark
                        ? "#2C2C2C"
                        : "#fff",
                    },
                  ]}
                  onPress={() => handleConnectorPress(c.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected
                          ? isDark
                            ? "#fff"
                            : "#1D4ED8"
                          : isDark
                          ? "#E5E7EB"
                          : "#1F2937",
                      },
                    ]}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </SafeAreaView>

      <View style={[styles.fabs, { bottom: fabsBottom }]}>
        <Pressable
          style={[styles.fab, { backgroundColor: isDark ? "#2C2C2C" : "#fff" }]}
          onPress={handleToggleDarkMode}
        >
          {isDark ? (
            <Sun size={22} color="#E5E7EB" />
          ) : (
            <Moon size={22} color="#374151" />
          )}
        </Pressable>

        <Pressable
          style={[styles.fab, { backgroundColor: isDark ? "#2C2C2C" : "#fff" }]}
          onPress={handleCenterPress}
        >
          <Crosshair size={22} color={isDark ? "#E5E7EB" : "#374151"} />
        </Pressable>
      </View>

      <View style={[styles.sheetWrap, { bottom: sheetBottom }]}>
        <View
          style={[
            styles.sheetCard,
            { backgroundColor: isDark ? "#1F1F1F" : "#fff" },
          ]}
          onLayout={onSheetLayout}
        >
          <Pressable
            style={[styles.sheetHeader, { height: SHEET_HEADER_HEIGHT }]}
            onPress={handleToggleSheet}
          >
            <Text
              style={[
                styles.sheetTitle,
                { color: isDark ? "#E5E7EB" : "#111827" },
              ]}
            >
              Chargers in this area
            </Text>
            <ChevronUp
              size={20}
              color={isDark ? "#9CA3AF" : "#4B5563"}
              style={{
                transform: [{ rotate: isModalExpanded ? "180deg" : "0deg" }],
              }}
            />
          </Pressable>

          {isModalExpanded && (
            <View style={[styles.sheetBody, { maxHeight: SHEET_BODY_MAX }]}>
              {vm.uiState.loading ? (
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#E5E7EB" : "#374151"}
                />
              ) : filteredStations.length === 0 ? (
                <View style={styles.sheetEmpty}>
                  <Text
                    style={[
                      styles.sheetEmptyText,
                      { color: isDark ? "#9CA3AF" : "#6B7280" },
                    ]}
                  >
                    Charger list will appear here
                  </Text>
                </View>
              ) : (
                <ScrollView>
                  {filteredStations.map((station) => (
                    <View key={station.acmId} style={{ paddingVertical: 8 }}>
                      <Text style={{ color: isDark ? "#E5E7EB" : "#111827" }}>
                        {station.stationName}
                      </Text>
                      <Text
                        style={{
                          color: isDark ? "#9CA3AF" : "#6B7280",
                          fontSize: 12,
                        }}
                      >
                        {station.address}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

export default ViewModelMapViewScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  mapBackground: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  safeAreaTop: { backgroundColor: "transparent" },
  topWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 16,
  },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    height: 44,
    width: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchBox: {
    flex: 1,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchInnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 0 },
  chipsRow: { marginTop: 12, flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: 14, fontWeight: "700" },
  fabs: { position: "absolute", right: 16, zIndex: 30, gap: 12 },
  fab: {
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetWrap: { position: "absolute", left: 0, right: 0, zIndex: 25 },
  sheetCard: { marginHorizontal: 16, borderRadius: 24 },
  sheetHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { fontSize: 18, fontWeight: "700" },
  sheetBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sheetEmpty: { paddingVertical: 28, alignItems: "center" },
  sheetEmptyText: { fontSize: 14 },
});
