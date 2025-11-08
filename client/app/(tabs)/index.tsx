import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
  useColorScheme,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Search, ChevronRight, Car } from "lucide-react-native";
import { containerPromise } from "../../src/di/container";
import { VehicleViewModel } from "../../src/presentation/viewmodels/VehicleViewModel";

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

  const {
    filteredVehicles,
    savedVehicle,
    selectedVehicle,
    formValues,
    searchQuery,
    selectedCategory,
  } = vm.uiState;

  const handleSave = async () => {
    try {
      await vm.saveSelectedVehicle();
      Alert.alert("Success", "Vehicle saved successfully!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save vehicle";
      Alert.alert("Error", message);
    }
  };

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
      <View
        style={[styles.header, { borderBottomColor: isDark ? "#333" : "#eee" }]}
      >
        <TouchableOpacity
          onPress={() => vm.clearSelectedVehicle()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}>
          {selectedVehicle ? "Edit Vehicle" : "Choose a Car"}
        </Text>
      </View>

      {/* FORM */}
      {selectedVehicle ? (
        <ScrollView style={{ padding: 16 }}>
          {Object.entries(formValues).map(([key, value]) => (
            <View key={key} style={{ marginBottom: 12 }}>
              <Text
                style={{ color: isDark ? "#fff" : "#000", marginBottom: 6 }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#1e1e1e" : "#f1f1f1",
                    color: isDark ? "#fff" : "#000",
                  },
                ]}
                value={String(value ?? "")}
                onChangeText={(text) =>
                  vm.updateFormValue(key as any, text as any)
                }
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.saveButton,
              { backgroundColor: isDark ? "#fff" : "#000" },
            ]}
          >
            <Text
              style={{ color: isDark ? "#000" : "#fff", fontWeight: "700" }}
            >
              Save Vehicle
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
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
                  style={[
                    styles.searchInput,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                  placeholder="Search your model"
                  placeholderTextColor={isDark ? "#777" : "#999"}
                  value={searchQuery}
                  onChangeText={(text) => vm.setSearchQuery(text)}
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

          {/* Saved Vehicle */}
          {savedVehicle && (
            <View
              style={[
                styles.savedVehicleCard,
                { backgroundColor: isDark ? "#1c1c1c" : "#f1f8e9" },
              ]}
            >
              <Text
                style={[
                  styles.savedVehicleTitle,
                  { color: isDark ? "#fff" : "#000" },
                ]}
              >
                Saved Vehicle
              </Text>
              <Text style={{ color: isDark ? "#ccc" : "#333" }}>
                {savedVehicle.brand} {savedVehicle.model} ({savedVehicle.year})
              </Text>
              <Text style={{ color: isDark ? "#aaa" : "#555" }}>
                Battery: {savedVehicle.batterySizeKwh} kWh
              </Text>
              <TouchableOpacity
                onPress={() => vm.deleteSavedVehicle()}
                style={[
                  styles.deleteButton,
                  { backgroundColor: isDark ? "#e74c3c" : "#d32f2f" },
                ]}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Delete Saved Vehicle
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
        </>
      )}
    </View>
  );
});

export default ChooseCarScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: 12 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  searchTabsWrapper: { paddingHorizontal: 12, paddingBottom: 4 },
  searchContainer: { marginTop: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 15,
    paddingVertical: 2,
  },
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
  savedVehicleCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 12,
  },
  savedVehicleTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  carRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  input: {
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
