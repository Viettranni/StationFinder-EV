import React, { useEffect, useState } from "react";
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
import { ChevronRight, Car, Search, ChevronLeft } from "lucide-react-native";
import { useContainer } from "../../app/_layout";
import { VehicleViewModel } from "../../src/presentation/viewmodels/VehicleViewModel";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ChooseCarScreen: React.FC = observer(() => {
  const container = useContainer();
  const [vm, setVm] = useState<VehicleViewModel>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  useEffect(() => {
    (async () => {
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("screens/StartScreen")}
        >
          <ChevronLeft size={28} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}>
          Choose a Car
        </Text>
        <View style={{ width: 28 }} />
      </View>

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
            const active =
              (selectedCategory ?? "all").toLowerCase() === c.id.toLowerCase();
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
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Custom model row — hide when search is active */}
        {searchQuery.trim().length === 0 && (
          <View style={{ marginBottom: 12 }}>
            <TouchableOpacity
              style={[
                styles.carRow,
                { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
              ]}
              onPress={() => {
                const customVehicle = {
                  id: "custom",
                  brand: "",
                  make: "",
                  batterySizeKwh: [],
                  maxChargingSpeed_kW: [],
                  efficiency: 0,
                  imageUrl: "",
                };
                vm.selectVehicle(customVehicle);
                navigation.navigate("screens/CustomVehicleFormScreen");
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isDark ? "#333" : "#eee" },
                ]}
              >
                <Ionicons
                  name="car-outline"
                  size={28}
                  color={isDark ? "#fff" : "#333"}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: isDark ? "#fff" : "#000",
                    fontWeight: "500",
                    fontSize: 16,
                  }}
                >
                  Custom model
                </Text>
                <Text style={{ color: isDark ? "#aaa" : "#555" }}>
                  Adjust yourself
                </Text>
              </View>

              <View
                style={[
                  styles.chevronContainer,
                  { backgroundColor: isDark ? "#fff" : "#000" },
                ]}
              >
                <ChevronRight size={20} color={isDark ? "#000" : "#fff"} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Existing vehicle list */}
        {filteredVehicles.map((car, i) => (
          <View
            key={`${car.brand}-${car.make}-${i}`}
            style={{ marginBottom: 12 }}
          >
            <TouchableOpacity
              style={[
                styles.carRow,
                { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
              ]}
              onPress={() => {
                vm.selectVehicle(car);
                navigation.navigate("screens/BatterySelectionScreen");
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isDark ? "#333" : "#eee" },
                ]}
              >
                <Ionicons
                  name="car-outline"
                  size={28}
                  color={isDark ? "#fff" : "#333"}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: isDark ? "#fff" : "#000",
                    fontWeight: "500",
                    fontSize: 16,
                  }}
                >
                  {car.brand} {car.make}
                </Text>
                <Text style={{ color: isDark ? "#aaa" : "#555" }}>
                  Efficiency: {car.efficiency} Wh/km
                </Text>
              </View>

              <View
                style={[
                  styles.chevronContainer,
                  { backgroundColor: isDark ? "#fff" : "#000" },
                ]}
              >
                <ChevronRight size={20} color={isDark ? "#000" : "#fff"} />
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

export default ChooseCarScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  searchTabsWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  searchContainer: { marginTop: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 15, paddingVertical: 2 },
  categoryContainer: {
    flexDirection: "row",
    paddingVertical: 4,
    gap: 8,
    alignItems: "center",
    marginTop: 6,
  },
  categoryTab: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: { flex: 1, paddingTop: 8 },
  carRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
