export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  batterySizeKwh: number;
  maxChargingSpeed_kW: number; // ✅ Added charging speed
  currentBatteryState: number;
  averageConsumption: number;
  latitude: number;
  longitude: number;
  favourites: string;
  createdAt: string;
}

export type NewVehicle = Omit<Vehicle, "id">;

// ✅ Factory to safely create a vehicle record
export function createVehicle(partial: Partial<NewVehicle>): NewVehicle {
  if (!partial.brand || !partial.model) {
    throw new Error("Brand and model are required");
  }

  return {
    brand: partial.brand,
    model: partial.model,
    year: partial.year ?? new Date().getFullYear(),
    batterySizeKwh: partial.batterySizeKwh ?? 0,
    maxChargingSpeed_kW: partial.maxChargingSpeed_kW ?? 0, // ✅ ensure default
    currentBatteryState: partial.currentBatteryState ?? 1,
    averageConsumption: partial.averageConsumption ?? 0,
    latitude: partial.latitude ?? 0,
    longitude: partial.longitude ?? 0,
    favourites: partial.favourites ?? "false",
    createdAt: partial.createdAt ?? new Date().toISOString(),
  };
}
