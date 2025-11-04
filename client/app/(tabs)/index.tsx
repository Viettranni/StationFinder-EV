import React, { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { Image } from "expo-image";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HelloWave } from "@/components/hello-wave";

import { initDB } from "../../src/data/local/database";
import { VehicleDao } from "../../src/data/dao/VehicleDao";
import { LocalVehicleRepository } from "../../src/data/repositories/LocalVehicleRepository";
import { createVehicle, NewVehicle } from "../../src/domain/entities/vehicle";

export default function HomeScreen() {
  useEffect(() => {
    if (Platform.OS !== "web") {
      (async () => {
        try {
          // Initialize DB
          await initDB();
          console.log("✅ Database ready.");

          // Setup repository via dependency injection
          const dao = new VehicleDao();
          const vehicleRepo = new LocalVehicleRepository(dao);

          // Helper to log vehicles
          async function logAllVehicles(label: string) {
            const vehicles = await vehicleRepo.getAllVehicles();
            console.log(`📋 ${label}:`, vehicles);
            return vehicles;
          }

          // -----------------------
          // 1️⃣ Insert valid vehicles
          // -----------------------
          const vehicle1: NewVehicle = createVehicle({
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

          const vehicle2: NewVehicle = createVehicle({
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

          const id1 = await vehicleRepo.addVehicle(vehicle1);
          console.log("🚗 Inserted vehicle1 with ID:", id1);

          const id2 = await vehicleRepo.addVehicle(vehicle2);
          console.log("🚗 Inserted vehicle2 with ID:", id2);

          await logAllVehicles("After inserts");

          // -----------------------
          // 2️⃣ Update scenarios
          // -----------------------
          await vehicleRepo.updateVehicle(id1, { favourites: "true" });
          console.log("💾 Updated vehicle1 favourites to true");

          await vehicleRepo.updateVehicle(id2, {
            batterySizeKwh: 45,
            currentBatteryState: 75,
          });
          console.log(
            "💾 Updated vehicle2 batterySizeKwh and currentBatteryState"
          );

          await logAllVehicles("After updates");

          // -----------------------
          // 3️⃣ Fetch scenarios
          // -----------------------
          const fetched1 = await vehicleRepo.getVehicleById(id1);
          console.log("🔍 Fetched vehicle1 by ID:", fetched1);

          const fetched2 = await vehicleRepo.getVehicleById(9999);
          console.log("🔍 Fetched non-existent ID (should be null):", fetched2);

          // -----------------------
          // 4️⃣ Delete scenarios
          // -----------------------
          await vehicleRepo.deleteVehicle(id1);
          await vehicleRepo.deleteVehicle(id2);
          console.log("🗑️ Deleted vehicle1 and vehicle2");

          await logAllVehicles("After deletions");

          // -----------------------
          // 5️⃣ Validation & errors
          // -----------------------
          try {
            createVehicle({ model: "Unknown" } as any); // missing brand
          } catch (err) {
            console.log(
              "⚠️ Validation error (missing brand):",
              (err as Error).message
            );
          }

          try {
            await vehicleRepo.addVehicle({
              ...vehicle1,
              brand: "" as any,
            });
          } catch (err) {
            console.log(
              "⚠️ Repository insert failed with empty brand:",
              (err as Error).message
            );
          }

          // -----------------------
          // 6️⃣ Edge cases
          // -----------------------
          const maxStringVehicle = createVehicle({
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

          const maxId = await vehicleRepo.addVehicle(maxStringVehicle);
          console.log("🚀 Inserted max-length vehicle with ID:", maxId);
          await logAllVehicles("After max-length insert");

          // -----------------------
          // 7️⃣ Concurrency & transaction
          // -----------------------
          console.log("⏱️ Testing concurrent inserts...");
          const promises: Promise<number>[] = [];
          for (let i = 0; i < 5; i++) {
            promises.push(
              vehicleRepo.addVehicle(
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
          const ids = await Promise.all(promises);
          console.log("🚀 Concurrent inserts completed, IDs:", ids);

          await logAllVehicles("After concurrent inserts");

          console.log("✅ Repository-based DAO test completed.");
        } catch (error) {
          console.error("❌ Repository test failed:", error);
        }
      })();
    } else {
      console.log("ℹ️ Skipping SQLite init on web.");
    }
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Vehicle Repository Test</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">
          Check console for detailed repository test logs
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepContainer: { gap: 8, marginBottom: 8 },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
