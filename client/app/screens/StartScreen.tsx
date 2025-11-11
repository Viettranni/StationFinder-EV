import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";

const AddVehicleScreenNative = () => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleAddCar = () => {
    navigation.navigate("screens/ChooseCarScreen");
  };

  const handleSkip = () => {
    navigation.navigate("screens/VehicleDetailsScreen");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#fff" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Icon in header */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isDark ? "#1e1e1e" : "#e6f5e6" },
        ]}
      >
        <Ionicons
          name="car-outline"
          size={30}
          color={isDark ? "#22c55e" : "#38a169"}
        />
      </View>

      <Text style={[styles.heading, { color: isDark ? "#F9FAFB" : "#1a202c" }]}>
        Add your vehicle to unlock all features
      </Text>

      <Text
        style={[styles.description, { color: isDark ? "#cbd5e1" : "#4a5568" }]}
      >
        Get personalized route planning, real-time battery tracking, and more
      </Text>

      {/* Large Icon */}
      <View style={styles.largeIconWrapper}>
        <Ionicons
          name="car-sport-outline"
          size={150}
          color={isDark ? "#fff" : "#333"}
        />
        <Ionicons
          name="flash-outline"
          size={30}
          color="#22c55e"
          style={styles.chargingBadge}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDark ? "#22c55e" : "#38a169" },
        ]}
        activeOpacity={0.8}
        onPress={handleAddCar}
      >
        <Text style={styles.buttonText}>Add your car</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip}>
        <Text
          style={[styles.skipLink, { color: isDark ? "#cbd5e1" : "#4a5568" }]}
        >
          Skip to the map
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  iconContainer: {
    borderRadius: 50,
    padding: 15,
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    marginBottom: 40,
    textAlign: "center",
    maxWidth: 300,
  },
  largeIconWrapper: {
    marginBottom: 50,
    position: "relative",
    padding: 20,
  },
  chargingBadge: {
    position: "absolute",
    bottom: 30,
    right: 5,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  button: {
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginBottom: 25,
    width: "100%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  skipLink: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddVehicleScreenNative;
