import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Car, ChevronRight, Search } from "lucide-react-native";
import { containerPromise } from "../../src/di/container";
import { VehicleViewModel } from "../../src/presentation/viewmodels/VehicleViewModel";
import BatterySelectionModal from "../screens/BatterySelectionModal";

const ChooseCarScreen: React.FC = observer(() => {
  const [vm, setVm] = React.useState<VehicleViewModel>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      const container = await containerPromise;
      const vehicleVM = container.vehicleViewModel;
      setVm(vehicleVM);

      await vehicleVM.fetchAvailableVehicles();
      await vehicleVM.fetchSavedVehicle();
    })();
  }, []);

  if (!vm || vm.uiState.loading) {
    return (
      <View
        style={[
          styles.container,
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

  const { filteredVehicles, searchQuery, selectedCategory } = vm.uiState;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#121212" : "#fff",
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Search + Categories */}
      <View style={styles.searchTabsWrapper}>
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: isDark ? "#1e1e1e" : "#f1f1f1" },
            ]}
          >
            <Search size={18} color={isDark ? "#ccc" : "#555"} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? "#fff" : "#000" }]}
              placeholder="Search your model"
              placeholderTextColor={isDark ? "#777" : "#999"}
              value={searchQuery}
              onChangeText={(t) => vm.setSearchQuery(t)}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {vm.categories.map((c) => {
            const active = selectedCategory === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => vm.setSelectedCategory(c.id)}
                style={[
                  styles.categoryTab,
                  {
                    backgroundColor: active
                      ? isDark
                        ? "#fff"
                        : "#000"
                      : "transparent",
                    borderColor: isDark ? "#555" : "#ccc",
                  },
                ]}
              >
                <Text
                  style={{
                    color: active
                      ? isDark
                        ? "#000"
                        : "#fff"
                      : isDark
                      ? "#ccc"
                      : "#333",
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Vehicle List */}
      <ScrollView style={styles.listContainer}>
        {filteredVehicles.map((car, i) => (
          <TouchableOpacity
            key={`${car.brand}-${car.make}-${i}`}
            style={[
              styles.carRow,
              { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
            ]}
            onPress={() => vm.selectVehicle(car)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isDark ? "#333" : "#eee" },
              ]}
            >
              <Car size={28} color={isDark ? "#fff" : "#333"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: isDark ? "#fff" : "#000",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                {car.brand} {car.make}
              </Text>
              <Text style={{ color: isDark ? "#aaa" : "#555" }}>
                Efficiency: {car.efficiency} Wh/km
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? "#aaa" : "#888"} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Battery Modal */}
      {vm && <BatterySelectionModal vm={vm} />}
    </View>
  );
});

export default ChooseCarScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchTabsWrapper: { paddingHorizontal: 12, paddingBottom: 4 },
  searchContainer: { marginTop: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 15, paddingVertical: 2 },
  categoryContainer: {
    flexDirection: "row",
    paddingVertical: 4,
    gap: 16,
    alignItems: "center",
    marginTop: 6,
  },
  categoryTab: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: { flex: 1, paddingTop: 4 },
  carRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
});
