import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  LayoutChangeEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Search,
  SlidersHorizontal,
  Moon,
  Sun,
  Crosshair,
  ChevronUp,
} from "lucide-react-native";


const GAP_ABOVE_TAB = 10;
const SHEET_HEADER_HEIGHT = 56;
const SHEET_BODY_MAX = 320;
const FAB_OFFSET_ABOVE_SHEET = 16;

const MapViewScreen: React.FC = () => {
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

  return (
    <View style={styles.root}>
      <View style={styles.mapBackground} />
      <SafeAreaView style={styles.safeAreaTop}>
        <View style={[styles.topWrap, { paddingTop: insets.top + 16 }]}>
          <View style={styles.searchRow}>
            <Pressable style={styles.iconBtn}>
              <SlidersHorizontal size={20} color="#374151" />
            </Pressable>

            <View style={styles.searchBox}>
              <View style={styles.searchInnerRow}>
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Select the destination..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                />
              </View>
            </View>
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

      <View style={[styles.fabs, { bottom: fabsBottom }]}>
        <Pressable
          style={styles.fab}
          onPress={() => setIsDarkMode((v) => !v)}
          accessibilityLabel="Toggle dark mode"
        >
          {isDark ? <Sun size={22} color="#374151" /> : <Moon size={22} color="#374151" />}
        </Pressable>

        <Pressable
          style={styles.fab}
          onPress={() => {
          }}
          accessibilityLabel="Center to your location"
        >
          <Crosshair size={22} color="#374151" />
        </Pressable>
      </View>

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
              style={{
                transform: [{ rotate: isModalExpanded ? "180deg" : "0deg" }],
              }}
            />
          </Pressable>

          {isModalExpanded && (
            <View style={[styles.sheetBody, { maxHeight: SHEET_BODY_MAX }]}>
              <View style={styles.sheetEmpty}>
                <Text style={styles.sheetEmptyText}>Charger list will appear here</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default MapViewScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF", // replace with your Map view later
    zIndex: 0,
  },

  // SafeArea only for top overlays
  safeAreaTop: { backgroundColor: "transparent" },

  // Top overlays
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
  sheetEmpty: {
    paddingVertical: 28,
    alignItems: "center",
  },
  sheetEmptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
