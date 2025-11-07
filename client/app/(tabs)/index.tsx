import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TextInput,
  Button,
  View,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  useColorScheme,
  ScrollView,
} from "react-native";
import { observer } from "mobx-react-lite";
import { Image } from "expo-image";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HelloWave } from "@/components/hello-wave";

import { Container } from "../../src/di/container";
import { NewVehicle } from "../../src/domain/entities/Vehicle";
import { ResponseVehicle } from "../../src/data/local/dao/ResponseVehicle";

const HomeScreen = observer(() => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [containerReady, setContainerReady] = useState(false);
  const [vm, setVm] = useState<any>(null);

  // Form state
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [batterySizeKwh, setBatterySizeKwh] = useState("");
  const [currentBatteryState, setCurrentBatteryState] = useState("0");
  const [averageConsumption, setAverageConsumption] = useState("");
  const [latitude, setLatitude] = useState("0");
  const [longitude, setLongitude] = useState("0");
  const [favourites, setFavourites] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") {
      (async () => {
        try {
          const container = await Container.getInstance();
          const vehicleVM = container.vehicleViewModel;
          setVm(vehicleVM);
          await vehicleVM.fetchAvailableVehicles();
          await vehicleVM.fetchSavedVehicle();
          setContainerReady(true);
        } catch (err) {
          console.error("Container init failed:", err);
        }
      })();
    }
  }, []);

  const populateFormFromVehicle = (vehicle: ResponseVehicle) => {
    setBrand(vehicle.brand || "");
    setModel(vehicle.make || "");
    setYear(new Date().getFullYear().toString());
    setBatterySizeKwh(vehicle.batterySizeKwh?.[0]?.toString() || "");
    setAverageConsumption(vehicle.efficiency?.toString() || "");
    setCurrentBatteryState("100");
    setLatitude("0");
    setLongitude("0");
    setFavourites(false);
  };

  const handleSelectVehicle = (vehicle: ResponseVehicle) => {
    vm.selectVehicle(vehicle);
    populateFormFromVehicle(vehicle);
    Alert.alert("Vehicle Selected", `${vehicle.brand} ${vehicle.make}`);
  };

  const handleSaveOrUpdate = async () => {
    try {
      const inputValues: Partial<NewVehicle> = {
        brand,
        model,
        year: Number(year),
        batterySizeKwh: Number(batterySizeKwh),
        currentBatteryState: Number(currentBatteryState),
        averageConsumption: Number(averageConsumption),
        latitude: Number(latitude),
        longitude: Number(longitude),
        favourites: favourites ? "true" : "false",
      };

      await vm.saveSelectedVehicle(inputValues);
      Alert.alert("✅ Success", "Vehicle saved locally!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save vehicle");
    }
  };

  const deleteSavedVehicle = async () => {
    Alert.alert("Confirm", "Delete saved vehicle?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => await vm.deleteSavedVehicle(),
      },
    ]);
  };

  if (!containerReady || !vm) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText type="title">Initializing...</ThemedText>
      </ThemedView>
    );
  }

  const { availableVehicles, selectedVehicle, savedVehicle, loading, error } =
    vm.uiState;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ThemedView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0d0d0d" : "#fafafa" },
        ]}
      >
        <FlatList
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <Image
                source={require("@/assets/images/partial-react-logo.png")}
                style={styles.reactLogo}
              />
              <ThemedText type="title">
                ⚡ Select, Edit & Save Your Vehicle
              </ThemedText>
              <HelloWave />

              {loading && (
                <ActivityIndicator
                  style={{ marginVertical: 8 }}
                  color={isDark ? "#80cbc4" : "#00796b"}
                />
              )}

              {error && (
                <ThemedText style={{ color: "tomato", marginVertical: 8 }}>
                  {error}
                </ThemedText>
              )}

              {/* --- Editable Form --- */}
              {selectedVehicle && (
                <ScrollView
                  style={styles.formContainer}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  <ThemedText type="subtitle" style={{ marginBottom: 6 }}>
                    Editing: {selectedVehicle.brand} {selectedVehicle.make}
                  </ThemedText>

                  {[
                    { label: "Brand", value: brand, setter: setBrand },
                    { label: "Model", value: model, setter: setModel },
                    { label: "Year", value: year, setter: setYear },
                    {
                      label: "Battery Size (kWh)",
                      value: batterySizeKwh,
                      setter: setBatterySizeKwh,
                    },
                    {
                      label: "Current Battery State",
                      value: currentBatteryState,
                      setter: setCurrentBatteryState,
                    },
                    {
                      label: "Average Consumption (kWh/100km)",
                      value: averageConsumption,
                      setter: setAverageConsumption,
                    },
                    {
                      label: "Latitude",
                      value: latitude,
                      setter: setLatitude,
                    },
                    {
                      label: "Longitude",
                      value: longitude,
                      setter: setLongitude,
                    },
                  ].map((input, index) => (
                    <View key={index} style={{ width: "100%" }}>
                      <ThemedText
                        style={{
                          color: isDark ? "#ccc" : "#333",
                          marginBottom: 4,
                        }}
                      >
                        {input.label}
                      </ThemedText>
                      <TextInput
                        placeholder={input.label}
                        value={input.value}
                        onChangeText={input.setter}
                        keyboardType={
                          ["Brand", "Model"].includes(input.label)
                            ? "default"
                            : "numeric"
                        }
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? "#1c1c1e" : "#fff",
                            color: isDark ? "#e0e0e0" : "#000",
                            borderColor: isDark ? "#333" : "#ccc",
                          },
                        ]}
                        placeholderTextColor={isDark ? "#888" : "#999"}
                      />
                    </View>
                  ))}

                  <View style={styles.toggleContainer}>
                    <ThemedText>Favourites</ThemedText>
                    <Switch
                      value={favourites}
                      onValueChange={setFavourites}
                      thumbColor={favourites ? "#00bfa5" : "#ccc"}
                      trackColor={{
                        false: isDark ? "#444" : "#ccc",
                        true: isDark ? "#00796b" : "#80cbc4",
                      }}
                    />
                  </View>

                  <Button
                    title={
                      savedVehicle
                        ? "🔄 Update Saved Vehicle"
                        : "💾 Save Vehicle Locally"
                    }
                    color={isDark ? "#00bfa5" : "#00796b"}
                    onPress={handleSaveOrUpdate}
                  />
                </ScrollView>
              )}
              {savedVehicle && (
                <View
                  style={[
                    styles.savedVehicleCard,
                    { backgroundColor: isDark ? "#1c1c1c" : "#f1f8e9" },
                  ]}
                >
                  <ThemedText type="subtitle">
                    Saved Vehicle: {savedVehicle.brand} {savedVehicle.model}
                  </ThemedText>
                  <Button
                    title="Delete Saved Vehicle"
                    color={isDark ? "#ff6b6b" : "red"}
                    onPress={deleteSavedVehicle}
                  />
                </View>
              )}
            </View>
          }
          data={availableVehicles}
          keyExtractor={(item: ResponseVehicle) => `${item.brand}-${item.make}`}
          renderItem={({ item }) => (
            <View
              style={[
                styles.vehicleItem,
                {
                  backgroundColor:
                    selectedVehicle &&
                    selectedVehicle.make === item.make &&
                    selectedVehicle.brand === item.brand
                      ? isDark
                        ? "#003d33"
                        : "#e0f7fa"
                      : isDark
                      ? "#121212"
                      : "#fff",
                },
              ]}
            >
              <ThemedText>
                {item.brand} {item.make}
              </ThemedText>
              <ThemedText>
                Battery sizes: {item.batterySizeKwh.join(", ")} kWh
              </ThemedText>
              <ThemedText>Efficiency: {item.efficiency} kWh/100km</ThemedText>
              <Button
                title="Select"
                color={isDark ? "#00bfa5" : "#00796b"}
                onPress={() => handleSelectVehicle(item)}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </ThemedView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { padding: 16, alignItems: "center" },
  formContainer: { width: "100%", marginTop: 16 },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    width: "100%",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
    width: "100%",
  },
  vehicleItem: {
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#333",
    alignItems: "flex-start",
  },
  savedVehicleCard: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    width: "100%",
  },
  reactLogo: { height: 120, width: 120, marginBottom: 8 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default HomeScreen;
