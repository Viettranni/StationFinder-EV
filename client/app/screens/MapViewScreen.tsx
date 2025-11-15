import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  LayoutChangeEvent,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
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
  X,
  MapPin,
  Zap,
} from "lucide-react-native";
import FiltersModal from "./FiltersModal";
import { ChargingStationViewModel } from "../../src/presentation/viewmodels/ChargingStationViewModel";
import { useContainer } from "../_layout";

const GAP_ABOVE_TAB = 10;
const SHEET_HEADER_HEIGHT = 56;
const SHEET_BODY_MAX = 320;
const FAB_OFFSET_ABOVE_SHEET = 16;

const MapViewScreen: React.FC = observer(() => {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const container = useContainer();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalExpanded, setIsModalExpanded] = useState(false);
  const [sheetMeasuredHeight, setSheetMeasuredHeight] =
    useState(SHEET_HEADER_HEIGHT);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [dragY] = useState(new Animated.Value(0));
  const [vm, setVm] = useState<ChargingStationViewModel | null>(null);

  const searchInputRef = useRef<TextInput>(null);

  const isDark = isDarkMode || scheme === "dark";
  const sheetBottom = GAP_ABOVE_TAB;
  const fabsBottom = sheetBottom + sheetMeasuredHeight + FAB_OFFSET_ABOVE_SHEET;

  const onSheetLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h !== sheetMeasuredHeight) setSheetMeasuredHeight(h);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 4,
      onPanResponderMove: Animated.event([null, { dy: dragY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80) {
          Animated.timing(dragY, {
            toValue: 300,
            duration: 180,
            useNativeDriver: false,
          }).start(() => {
            dragY.setValue(0);
            setIsSearchOpen(false);
          });
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

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

  // Safe destructuring to avoid conditional hooks
  const filteredStations = vm?.uiState.filteredStations ?? [];
  const searchQuery = vm?.uiState.searchQuery ?? "";
  const selectedConnectors = vm?.uiState.selectedConnectors ?? [];

  // ======================== FUNCTION ========================
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
      selectedAvailable: state.showOnlyAvailable,
    });
  };

  // ======================== WRAPPERS ========================
  const handleSearchChange = (text: string) => {
    console.log("[MapViewScreen] Search query changed:", text);
    vm?.setSearchQuery(text);
    logUIState();
  };

  const handleConnectorToggle = (connectorId: string) => {
    console.log("[MapViewScreen] Connector selected/toggled:", connectorId);
    const selected = vm?.uiState.selectedConnectors.includes(connectorId)
      ? vm.uiState.selectedConnectors.filter((c) => c !== connectorId)
      : [...vm!.uiState.selectedConnectors, connectorId];

    vm?.setSelectedConnectors(selected);
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

  const getFastBoltCount = (station: (typeof filteredStations)[number]) => {
    const ultraFast = station.amountCCS ?? 0;
    const fast = station.amountCHAdeMO ?? 0;
    const slow = station.amountType2 ?? 0;

    if (ultraFast > 0) return 3; // Ultra-fast
    if (fast > 0) return 2; // Fast
    if (slow > 0) return 1; // Slow
    return 0; // No connectors
  };

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

  return (
    <View
      style={[styles.root, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}
    >
      <View
        style={[
          styles.mapBackground,
          { backgroundColor: isDark ? "#1E1E1E" : "#E5E5E5" },
        ]}
      />

      {/* Top search bar */}
      <SafeAreaView style={styles.safeAreaTop}>
        <View style={[styles.topWrap, { paddingTop: insets.top + 16 }]}>
          <View style={styles.searchRow}>
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: isDark ? "#2C2C2C" : "#FFFFFF" },
              ]}
              onPress={() => setIsFiltersOpen(true)}
            >
              <SlidersHorizontal
                size={20}
                color={isDark ? "#E5E7EB" : "#374151"}
              />
            </Pressable>

            <Pressable
              style={[
                styles.searchBox,
                { backgroundColor: isDark ? "#2C2C2C" : "#FFFFFF" },
              ]}
              onPress={() => setIsSearchOpen(true)}
            >
              <View style={styles.searchInnerRow}>
                <Search size={20} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
                <Text
                  style={[
                    styles.searchInput,
                    { color: isDark ? "#E5E7EB" : "#9CA3AF" },
                  ]}
                >
                  {searchQuery || "Select the destination..."}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Connector chips */}
          <View style={styles.chipsRow}>
            {vm.connectorTypes.map((c) => {
              const selected = selectedConnectors.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected
                        ? isDark
                          ? "#4B5563"
                          : "#E0E7FF"
                        : isDark
                        ? "#2C2C2C"
                        : "#FFFFFF",
                    },
                  ]}
                  onPress={() => handleConnectorToggle(c.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selected
                          ? isDark
                            ? "#FFFFFF"
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

      {/* Floating buttons */}
      <View style={[styles.fabs, { bottom: fabsBottom }]}>
        <Pressable
          style={[
            styles.fab,
            { backgroundColor: isDark ? "#2C2C2C" : "#FFFFFF" },
          ]}
          onPress={() => setIsDarkMode((v) => !v)}
        >
          {isDark ? (
            <Sun size={22} color="#E5E7EB" />
          ) : (
            <Moon size={22} color="#374151" />
          )}
        </Pressable>

        <Pressable
          style={[
            styles.fab,
            { backgroundColor: isDark ? "#2C2C2C" : "#FFFFFF" },
          ]}
        >
          <Crosshair size={22} color={isDark ? "#E5E7EB" : "#374151"} />
        </Pressable>
      </View>

      {/* Bottom sheet */}
      <View style={[styles.sheetWrap, { bottom: sheetBottom }]}>
        <View
          style={[
            styles.sheetCard,
            { backgroundColor: isDark ? "#1F1F1F" : "#FFFFFF" },
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
              {filteredStations.length === 0 ? (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>
                    No chargers found
                  </Text>
                </View>
              ) : (
                <ScrollView>
                  {filteredStations.map((station) => {
                    const selectedCount =
                      vm?.getSelectedConnectorsCount(station) ?? 0;
                    const totalConnectors =
                      (station.amountCCS ?? 0) +
                      (station.amountCHAdeMO ?? 0) +
                      (station.amountType2 ?? 0);

                    // Optional: pill color based on availability
                    const pct =
                      totalConnectors > 0 ? selectedCount / totalConnectors : 0;
                    const pillBg =
                      pct >= 0.5 ? "#10B981" : pct > 0 ? "#F59E0B" : "#EF4444";
                    const pillText = "#FFFFFF";

                    return (
                      <Pressable key={station.acmId} style={styles.stationRow}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                              flexShrink: 1,
                            }}
                          >
                            <Text
                              style={{
                                fontWeight: "700",
                                fontSize: 14,
                                color: isDark ? "#E5E7EB" : "#111827",
                              }}
                              numberOfLines={1}
                            >
                              {station.stationName}
                            </Text>

                            <View style={{ flexDirection: "row", gap: 2 }}>
                              {Array.from({
                                length: getFastBoltCount(station),
                              }).map((_, i) => (
                                <Zap key={i} size={14} color="#10B981" />
                              ))}
                            </View>
                          </View>

                          {/* Selected / Total connectors */}
                          <View
                            style={{
                              backgroundColor: pillBg,
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 999,
                            }}
                          >
                            <Text
                              style={{
                                color: pillText,
                                fontWeight: "700",
                                fontSize: 12,
                              }}
                            >
                              {selectedCount}/{totalConnectors}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={{
                            color: isDark ? "#9CA3AF" : "#6B7280",
                            fontSize: 12,
                          }}
                        >
                          {station.address}
                        </Text>

                        {/* <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            marginTop: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: "#10B981",
                              fontWeight: "700",
                              fontSize: 12,
                            }}
                          >
                            {`$${station.price?.toFixed(2) ?? "0.00"}/kWh`}
                          </Text>
                          <Text
                            style={{
                              color: isDark ? "#9CA3AF" : "#6B7280",
                              fontSize: 12,
                            }}
                          >
                            {station.distance.toFixed(1)} km
                          </Text>
                          <Text
                            style={{
                              color: isDark ? "#9CA3AF" : "#6B7280",
                              fontSize: 12,
                            }}
                          >
                            {station.provider}
                          </Text>
                        </View> */}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Search Modal */}
      <Modal visible={isSearchOpen} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => setIsSearchOpen(false)}
          />

          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.modalCard,
              { marginTop: 64, transform: [{ translateY: dragY }] },
            ]}
          >
            <SafeAreaView>
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 12,
                  paddingBottom: 8,
                }}
              >
                <View style={{ alignItems: "center", marginBottom: 8 }}>
                  <View
                    style={{
                      width: 64,
                      height: 5,
                      borderRadius: 999,
                      backgroundColor: "#E5E7EB",
                    }}
                  />
                </View>

                <Pressable
                  onPress={() => setIsSearchOpen(false)}
                  hitSlop={12}
                  style={{ padding: 6, width: 32 }}
                >
                  <X size={20} color="#111827" />
                </Pressable>
              </View>

              <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <View style={styles.modalSearchBoxFull}>
                  <Search size={18} color="#6B7280" />
                  <TextInput
                    ref={searchInputRef}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    placeholder="Search for an address or place"
                    placeholderTextColor="#9CA3AF"
                    style={styles.modalSearchInput}
                    returnKeyType="search"
                  />
                  {!!searchQuery && (
                    <Pressable
                      onPress={() => vm?.setSearchQuery("")}
                      hitSlop={12}
                      style={{ padding: 4 }}
                    >
                      <X size={16} color="#6B7280" />
                    </Pressable>
                  )}
                </View>
              </View>

              <ScrollView
                nestedScrollEnabled
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                {filteredStations.length === 0 ? (
                  <View style={{ alignItems: "center", paddingVertical: 32 }}>
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "700",
                        color: "#111827",
                        marginBottom: 6,
                      }}
                    >
                      No results found
                    </Text>
                  </View>
                ) : (
                  filteredStations.map((station) => (
                    <Pressable key={station.acmId} style={styles.resultRow}>
                      <MapPin
                        size={18}
                        color="#111827"
                        style={{ marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={styles.resultTitle}>
                          {station.stationName}
                        </Text>
                        <Text numberOfLines={1} style={styles.resultSubtitle}>
                          {station.address}
                        </Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Filters Modal */}
      <FiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        vm={vm}
        plugOptions={vm.connectorTypes.map((c) => ({
          label: c.name,
          value: c.id,
        }))}
      />
    </View>
  );
});

export default MapViewScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    zIndex: 0,
  },
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
  },
  searchBox: { flex: 1, borderRadius: 18 },
  searchInnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 0 },
  chipsRow: { marginTop: 12, flexDirection: "row", gap: 8, flexWrap: "wrap" },
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
  sheetCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
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
  stationRow: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  modalRoot: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  modalCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  modalSearchBoxFull: {
    width: "100%",
    height: 44,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 0,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  resultTitle: { fontWeight: "700", color: "#111827" },
  resultSubtitle: { color: "#6B7280", marginTop: 2, fontSize: 12 },
});
