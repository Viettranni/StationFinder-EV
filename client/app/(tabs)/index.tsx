// src/screens/HomeScreen.tsx
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
} from "react-native";
import { observer } from "mobx-react-lite";
import { Image } from "expo-image";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HelloWave } from "@/components/hello-wave";

import { Container } from "../../src/data/di/container";
import {
  createVehicle,
  NewVehicle,
  Vehicle,
} from "../../src/domain/entities/vehicle";

const HomeScreen = observer(() => {
  const [containerReady, setContainerReady] = useState(false);
  const [vm, setVm] = useState<any>(null); // VehicleViewModel

  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [batterySizeKwh, setBatterySizeKwh] = useState("50");
  const [currentBatteryState, setCurrentBatteryState] = useState("100");
  const [averageConsumption, setAverageConsumption] = useState("10");
  const [latitude, setLatitude] = useState("0");
  const [longitude, setLongitude] = useState("0");
  const [favourites, setFavourites] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") {
      (async () => {
        try {
          const container = await Container.getInstance();
          setVm(container.vehicleViewModel);
          await container.vehicleViewModel.fetchVehicles();
          setContainerReady(true);
        } catch (err) {
          console.error("Container init failed:", err);
        }
      })();
    }
  }, []);

  if (!containerReady || !vm) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">⏳ Initializing repository...</ThemedText>
      </ThemedView>
    );
  }

  const saveVehicle = async () => {
    if (!brand || !model || !year) {
      Alert.alert("Validation", "Brand, model, and year are required.");
      return;
    }

    const vehicleData: NewVehicle = createVehicle({
      brand,
      model,
      year: Number(year),
      batterySizeKwh: Number(batterySizeKwh),
      currentBatteryState: Number(currentBatteryState),
      averageConsumption: Number(averageConsumption),
      latitude: Number(latitude),
      longitude: Number(longitude),
      favourites: favourites ? "true" : "false",
      createdAt: new Date().toISOString(),
    });

    try {
      if (editingId !== null) {
        await vm.updateVehicle(editingId, vehicleData);
        setEditingId(null);
      } else {
        await vm.addVehicle(vehicleData);
      }

      // Reset form
      setBrand("");
      setModel("");
      setYear("");
      setBatterySizeKwh("50");
      setCurrentBatteryState("100");
      setAverageConsumption("10");
      setLatitude("0");
      setLongitude("0");
      setFavourites(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Operation failed");
    }
  };

  const startEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setBrand(vehicle.brand);
    setModel(vehicle.model);
    setYear(vehicle.year.toString());
    setBatterySizeKwh(vehicle.batterySizeKwh.toString());
    setCurrentBatteryState(vehicle.currentBatteryState.toString());
    setAverageConsumption(vehicle.averageConsumption.toString());
    setLatitude(vehicle.latitude.toString());
    setLongitude(vehicle.longitude.toString());
    setFavourites(vehicle.favourites === "true");
  };

  const deleteVehicle = async (id: number) => {
    Alert.alert("Confirm Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => await vm.deleteVehicle(id),
      },
    ]);
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <View style={styles.vehicleItem}>
      <ThemedText>
        {item.brand} {item.model} ({item.year})
      </ThemedText>
      <ThemedText>
        Battery: {item.currentBatteryState}/{item.batterySizeKwh} kWh
      </ThemedText>
      <ThemedText>
        Avg Consumption: {item.averageConsumption} kWh/100km
      </ThemedText>
      <ThemedText>
        Location: {item.latitude}, {item.longitude}
      </ThemedText>
      <ThemedText>Favourites: {item.favourites}</ThemedText>
      <View style={styles.itemButtons}>
        <Button title="Edit" onPress={() => startEdit(item)} />
        <Button
          title="Delete"
          color="red"
          onPress={() => deleteVehicle(item.id)}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ThemedView style={{ flex: 1 }}>
        {/* Form */}
        <FlatList
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <Image
                source={require("@/assets/images/partial-react-logo.png")}
                style={styles.reactLogo}
              />
              <ThemedText type="title">
                {editingId !== null ? "Edit Vehicle" : "Add Vehicle"}
              </ThemedText>
              <HelloWave />

              <View style={styles.formContainer}>
                <TextInput
                  placeholder="Brand"
                  value={brand}
                  onChangeText={setBrand}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Model"
                  value={model}
                  onChangeText={setModel}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Year"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  placeholder="Battery Size kWh"
                  value={batterySizeKwh}
                  onChangeText={setBatterySizeKwh}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  placeholder="Current Battery State"
                  value={currentBatteryState}
                  onChangeText={setCurrentBatteryState}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  placeholder="Average Consumption"
                  value={averageConsumption}
                  onChangeText={setAverageConsumption}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  placeholder="Latitude"
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  placeholder="Longitude"
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                  style={styles.input}
                />

                <View style={styles.toggleContainer}>
                  <ThemedText>Favourites</ThemedText>
                  <Switch value={favourites} onValueChange={setFavourites} />
                </View>

                <Button
                  title={editingId !== null ? "Update Vehicle" : "Add Vehicle"}
                  onPress={saveVehicle}
                />
              </View>

              {vm.state.error && (
                <ThemedText style={{ marginTop: 10 }}>
                  {vm.state.error}
                </ThemedText>
              )}
              {vm.state.loading && (
                <ActivityIndicator size="small" style={{ marginTop: 10 }} />
              )}
            </View>
          }
          data={vm.state.vehicles}
          keyExtractor={(item: Vehicle) => item.id.toString()}
          renderItem={renderVehicleItem}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </ThemedView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  headerContainer: { padding: 16, alignItems: "center" },
  formContainer: { width: "100%", marginTop: 16, gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    width: "100%",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
    width: "100%",
  },
  vehicleItem: {
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "flex-start",
  },
  itemButtons: { flexDirection: "row", gap: 8, marginTop: 8 },
  reactLogo: { height: 120, width: 120, marginBottom: 8 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default HomeScreen;
