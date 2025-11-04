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
} from "react-native";
import { observer } from "mobx-react-lite";
import { Image } from "expo-image";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HelloWave } from "@/components/hello-wave";

import { Container } from "../../src/data/di/container";
import { createVehicle, NewVehicle } from "../../src/domain/entities/vehicle";

const HomeScreen = observer(() => {
  const [containerReady, setContainerReady] = useState(false);
  const [vm, setVm] = useState<any>(null); // VehicleViewModel

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      (async () => {
        try {
          const container = await Container.getInstance();
          setVm(container.vehicleViewModel);

          // Run all scenario tests
          //await runScenarioTests(container.vehicleViewModel);

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
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
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
      batterySizeKwh: 50,
      currentBatteryState: 100,
      averageConsumption: 10,
      latitude: 0,
      longitude: 0,
      favourites: "false",
    });

    try {
      if (editingId !== null) {
        await vm.repo.updateVehicle(editingId, vehicleData);
        setEditingId(null);
      } else {
        await vm.addVehicle(vehicleData);
      }
      setBrand("");
      setModel("");
      setYear("");
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const startEdit = (vehicle: any) => {
    setEditingId(vehicle.id);
    setBrand(vehicle.brand);
    setModel(vehicle.model);
    setYear(vehicle.year.toString());
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

  const renderVehicleItem = ({ item }: any) => (
    <View style={styles.vehicleItem}>
      <ThemedText>
        {item.brand} {item.model} ({item.year})
      </ThemedText>
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
    <FlatList
      data={vm.state.vehicles}
      keyExtractor={(item: any) => item.id.toString()}
      renderItem={renderVehicleItem}
      ListHeaderComponent={
        <ThemedView style={styles.headerContainer}>
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
            <Button
              title={editingId !== null ? "Update Vehicle" : "Add Vehicle"}
              onPress={saveVehicle}
            />
          </View>
        </ThemedView>
      }
      contentContainerStyle={{ paddingBottom: 50 }}
    />
  );
});

const runScenarioTests = async (vm: any) => {
  console.log("🏁 Running scenario tests...");

  // 1️⃣ Insert vehicles
  const vehicle1 = createVehicle({
    brand: "Tesla",
    model: "Model X",
    year: 2025,
    batterySizeKwh: 100,
    currentBatteryState: 90,
    averageConsumption: 15.5,
    latitude: 37.7749,
    longitude: -122.4194,
    favourites: "false",
  });

  const vehicle2 = createVehicle({
    brand: "Nissan",
    model: "Leaf",
    year: 2023,
    batterySizeKwh: 40,
    currentBatteryState: 80,
    averageConsumption: 12.3,
    latitude: 35.6895,
    longitude: 139.6917,
    favourites: "true",
  });

  const id1 = await vm.addVehicle(vehicle1);
  const id2 = await vm.addVehicle(vehicle2);

  await vm.repo.updateVehicle(id1, { favourites: "true" });
  await vm.repo.updateVehicle(id2, {
    batterySizeKwh: 45,
    currentBatteryState: 75,
  });

  const fetched1 = await vm.repo.getVehicleById(id1);
  const fetched2 = await vm.repo.getVehicleById(9999);
  console.log("Fetched vehicle1:", fetched1);
  console.log("Fetched non-existent ID:", fetched2);

  await vm.deleteVehicle(id1);
  await vm.deleteVehicle(id2);

  // Validation errors
  try {
    createVehicle({ model: "Unknown" } as any);
  } catch (err) {
    console.log(err);
  }
  try {
    await vm.addVehicle({ ...vehicle1, brand: "" as any });
  } catch (err) {
    console.log(err);
  }

  // Edge case
  const maxVehicle = createVehicle({
    brand: "B".repeat(255),
    model: "M".repeat(255),
    year: 9999,
    batterySizeKwh: 9999,
    currentBatteryState: 100,
    averageConsumption: 99.99,
    latitude: 90,
    longitude: 180,
    favourites: "true",
  });
  await vm.addVehicle(maxVehicle);

  // Concurrency
  const promises: Promise<number>[] = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      vm.addVehicle(
        createVehicle({
          brand: `Brand ${i}`,
          model: `Model ${i}`,
          year: 2025 + i,
          batterySizeKwh: 50 + i,
          currentBatteryState: 100,
          averageConsumption: 10 + i,
          latitude: 0,
          longitude: 0,
          favourites: "false",
        })
      )
    );
  }
  await Promise.all(promises);
};

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
  vehicleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  itemButtons: { flexDirection: "row", gap: 8 },
  reactLogo: { height: 120, width: 120, marginBottom: 8 },
});

export default HomeScreen;
