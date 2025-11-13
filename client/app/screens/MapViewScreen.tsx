// client/app/screens/MapViewScreen.tsx
import React, { useMemo, useRef, useState } from "react";
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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Search,
  SlidersHorizontal,
  Moon,
  Sun,
  Crosshair,
  ChevronUp,
  Zap,
  X,
  MapPin,
  Clock,
} from "lucide-react-native";

const GAP_ABOVE_TAB = 10;
const SHEET_HEADER_HEIGHT = 56;
const SHEET_BODY_MAX = 320;
const FAB_OFFSET_ABOVE_SHEET = 16;

// mock chargers (unchanged except provider field)
const mockChargers = [
  { id: 1, name: "Tesla Supercharger", location: "Downtown Center, 123 Main St", provider: "Tesla", price: 0.35, distance: 0.8, available: 6, total: 8, speed: "fast" },
  { id: 2, name: "EVgo Fast Charging", location: "Park Plaza, 456 Oak Ave", provider: "EVgo", price: 0.42, distance: 1.2, available: 3, total: 4, speed: "fast" },
  { id: 3, name: "ChargePoint Station", location: "Mall Parking Lot B", provider: "ChargePoint", price: 0.25, distance: 1.5, available: 8, total: 10, speed: "fast" },
  { id: 4, name: "Shell Recharge", location: "Highway 101 Exit 45", provider: "Shell", price: 0.38, distance: 2.1, available: 2, total: 6, speed: "fast" },
  { id: 5, name: "Public Charging Hub", location: "City Hall Parking", provider: "Public", price: 0.2, distance: 0.5, available: 12, total: 15, speed: "fast" },
  { id: 6, name: "EcoCharge Station", location: "Library Street, 78 Book Rd", provider: "EcoCharge", price: 0.15, distance: 1.8, available: 4, total: 5, speed: "slow" },
  { id: 7, name: "GreenPower Point", location: "Community Center", provider: "GreenPower", price: 0.18, distance: 2.3, available: 2, total: 3, speed: "slow" },
  { id: 8, name: "Basic Charge Spot", location: "Riverside Park", provider: "Basic", price: 0.12, distance: 3.0, available: 1, total: 2, speed: "slow" },
];

// mock search data
type Place = { id: string; title: string; subtitle: string };
const recentSearches: Place[] = [
  { id: "r1", title: "Helsinki", subtitle: "Finland" },
  { id: "r2", title: "Vantaa", subtitle: "Finland" },
];

const helsinkiResults: Place[] = [
  { id: "s1", title: "Helsinki", subtitle: "Finland" },
  { id: "s2", title: "Helsinki Airport (HEL)", subtitle: "Lentoasemantie, Vantaa, Finland" },
  { id: "s3", title: "Helsinki Outlet", subtitle: "Tatti, Helsinki, Finland" },
  { id: "s4", title: "Helsinki Central Station", subtitle: "Kaivokatu, Helsinki, Finland" },
];

const MapViewScreen: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalExpanded, setIsModalExpanded] = useState(false);
  const [sheetMeasuredHeight, setSheetMeasuredHeight] = useState<number>(SHEET_HEADER_HEIGHT);

  // search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = isDarkMode || scheme === "dark";

  const sheetBottom = GAP_ABOVE_TAB;
  const fabsBottom = sheetBottom + sheetMeasuredHeight + FAB_OFFSET_ABOVE_SHEET;

  const onSheetLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h !== sheetMeasuredHeight) setSheetMeasuredHeight(h);
  };

  // ----- search modal helpers -----
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    if ("helsinki".startsWith(q)) return helsinkiResults;
    return [];
  }, [query]);

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setQuery("");
  };

  // drag-to-close for modal container
  const dragY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
      onPanResponderMove: Animated.event([null, { dy: dragY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) {
          Animated.timing(dragY, { toValue: 300, duration: 180, useNativeDriver: false }).start(() => {
            dragY.setValue(0);
            closeSearch();
          });
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.root}>
      {/* Map placeholder background */}
      <View style={styles.mapBackground} />

      {/* Top overlays */}
      <SafeAreaView style={styles.safeAreaTop}>
        <View style={[styles.topWrap, { paddingTop: insets.top + 16 }]}>
          <View style={styles.searchRow}>
            <Pressable style={styles.iconBtn}>
              <SlidersHorizontal size={20} color="#374151" />
            </Pressable>

            {/* trigger -> opens modal; looks like input */}
            <Pressable style={styles.searchBox} onPress={openSearch}>
              <View style={styles.searchInnerRow}>
                <Search size={20} color="#9CA3AF" />
                <Text style={[styles.searchInput, { color: "#9CA3AF" }]}>
                  Select the destination...
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.chipsRow}>
            {["Charger type", "Provider", "Availability"].map((label) => (
              <Pressable key={label} style={styles.chip}>
                <Text style={styles.chipText}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>

      {/* Floating buttons */}
      <View style={[styles.fabs, { bottom: fabsBottom }]}>
        <Pressable style={styles.fab} onPress={() => setIsDarkMode((v) => !v)} accessibilityLabel="Toggle dark mode">
          {isDark ? <Sun size={22} color="#374151" /> : <Moon size={22} color="#374151" />}
        </Pressable>

        <Pressable style={styles.fab} onPress={() => {}} accessibilityLabel="Center to your location">
          <Crosshair size={22} color="#374151" />
        </Pressable>
      </View>

      {/* Bottom sheet with chargers */}
      <View style={[styles.sheetWrap, { bottom: sheetBottom }]}>
        <View style={styles.sheetCard} onLayout={onSheetLayout}>
          <Pressable
            style={[styles.sheetHeader, { height: SHEET_HEADER_HEIGHT }]}
            onPress={() => setIsModalExpanded((v) => !v)}
          >
            <Text style={styles.sheetTitle}>Chargers in this area</Text>
            <ChevronUp
              size={20}
              color="#4B5563"
              style={{ transform: [{ rotate: isModalExpanded ? "180deg" : "0deg" }] }}
            />
          </Pressable>

          {isModalExpanded && (
            <View style={[styles.sheetBody, { maxHeight: SHEET_BODY_MAX }]} >
              <ScrollView
                style={{ width: "100%" }}
                contentContainerStyle={{ paddingVertical: 8 }}
                showsVerticalScrollIndicator={false}
              >
                {mockChargers.map((c) => {
                  const pct = (c.available / c.total) * 100;
                  const pillBg = pct >= 50 ? "#10B981" : pct > 0 ? "#F59E0B" : "#EF4444";
                  const pillText = "#FFFFFF";

                  return (
                    <Pressable
                      key={c.id}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 4,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: "#E5E7EB",
                      }}
                    >
                      {/* name + bolts + availability pill */}
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
                          <Text style={{ fontWeight: "700", fontSize: 14, color: "#0F172A" }} numberOfLines={1}>
                            {c.name}
                          </Text>
                          <View style={{ flexDirection: "row", gap: 2 }}>
                            <Zap size={14} color="#10B981" />
                            {c.speed === "fast" && <Zap size={14} color="#10B981" />}
                          </View>
                        </View>
                        <View style={{ backgroundColor: pillBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                          <Text style={{ color: pillText, fontWeight: "700", fontSize: 12 }}>
                            {c.available}/{c.total}
                          </Text>
                        </View>
                      </View>

                      <Text style={{ color: "#6B7280", fontSize: 12 }} numberOfLines={1}>
                        {c.location}
                      </Text>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
                        <Text style={{ color: "#10B981", fontWeight: "700", fontSize: 12 }}>
                          ${c.price.toFixed(2)}/kWh
                        </Text>
                        <Text style={{ color: "#6B7280", fontSize: 12 }}>{c.distance.toFixed(1)} km</Text>
                        <Text style={{ color: "#6B7280", fontSize: 12 }}>{c.provider}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* -------- Search Modal (partial height, draggable, auto-focus) -------- */}
      <Modal
        visible={isSearchOpen}
        transparent
        animationType="fade"
        onShow={() => setTimeout(() => searchInputRef.current?.focus(), 50)}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.select({ ios: "padding", android: undefined })}
        >
          {/* dim backdrop */}
          <Pressable style={styles.backdrop} onPress={closeSearch} />

          {/* container with top gap and rounded corners */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.modalCard,
              { marginTop: 64, transform: [{ translateY: dragY }] },
            ]}
          >
            <SafeAreaView>
              {/* top row: close button only */}
              <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
                {/* drag handle */}
                <View style={{ alignItems: "center", marginBottom: 8 }}>
                  <View style={{ width: 64, height: 5, borderRadius: 999, backgroundColor: "#E5E7EB" }} />
                </View>

                <Pressable onPress={closeSearch} hitSlop={12} style={{ padding: 6, width: 32 }}>
                  <X size={20} color="#111827" />
                </Pressable>
              </View>

              {/* FULL-WIDTH search bar under the close button */}
              <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <View style={styles.modalSearchBoxFull}>
                  <Search size={18} color="#6B7280" />
                  <TextInput
                    ref={searchInputRef}
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search for an address or place"
                    placeholderTextColor="#9CA3AF"
                    style={styles.modalSearchInput}
                    returnKeyType="search"
                  />
                  {!!query && (
                    <Pressable onPress={() => setQuery("")} hitSlop={12} style={{ padding: 4 }}>
                      <X size={16} color="#6B7280" />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* content */}
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Initial hero + recents */}
                {!query && (
                  <View>
                    {/* Hero */}
                    <View style={{ alignItems: "center", paddingVertical: 20 }}>
                      <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 4 }}>
                        Plan your route
                      </Text>
                      <Text style={{ color: "#6B7280" }}>Navigate easily with no stress — (art later)</Text>
                    </View>

                    {/* Recents */}
                    <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                        <Text style={{ fontWeight: "700", color: "#111827" }}>Recent searches</Text>
                        <Pressable onPress={() => { /* no-op in mock */ }}>
                          <Text style={{ color: "#6B7280" }}>Clear all</Text>
                        </Pressable>
                      </View>
                      {recentSearches.map((p) => (
                        <Pressable key={p.id} style={styles.resultRow}>
                          <Clock size={18} color="#6B7280" style={{ marginRight: 10 }} />
                          <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} style={styles.resultTitle}>{p.title}</Text>
                            <Text numberOfLines={1} style={styles.resultSubtitle}>{p.subtitle}</Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* Results */}
                {!!query && filteredResults.length > 0 && (
                  <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
                    <Text style={{ fontWeight: "700", color: "#111827", marginBottom: 8 }}>Search results</Text>
                    {filteredResults.map((p) => (
                      <Pressable key={p.id} style={styles.resultRow}>
                        <MapPin size={18} color="#111827" style={{ marginRight: 10 }} />
                        <View style={{ flex: 1 }}>
                          <Text numberOfLines={1} style={styles.resultTitle}>{p.title}</Text>
                          <Text numberOfLines={1} style={styles.resultSubtitle}>{p.subtitle}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* No results */}
                {!!query && filteredResults.length === 0 && (
                  <View style={{ alignItems: "center", paddingVertical: 32 }}>
                    <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 6 }}>
                      No results found
                    </Text>
                    <Text style={{ color: "#6B7280" }}>Ensure typed address is correct — (art later)</Text>
                  </View>
                )}
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    height: 44,
    width: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchBox: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 0,
  },
  chipsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },

  fabs: {
    position: "absolute",
    right: 16,
    zIndex: 30,
    gap: 12,
  },
  fab: {
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 25,
  },
  sheetCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
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
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sheetBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  // --- modal styles ---
  modalRoot: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  modalCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  // full-width search box under the close button
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
  modalSearchInput: { flex: 1, fontSize: 15, color: "#111827", paddingVertical: 0 },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  resultTitle: { fontWeight: "700", color: "#111827" },
  resultSubtitle: { color: "#6B7280", marginTop: 2, fontSize: 12 },
});
