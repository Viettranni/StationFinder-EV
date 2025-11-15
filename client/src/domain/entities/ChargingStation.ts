// ChargingStation.ts

export interface ChargingStation {
  id: number;
  acmId: number;
  stationName: string;
  address: string;
  latitude: number;
  longitude: number;

  amountCCS: number;
  amountCHAdeMO: number;
  amountType2: number;

  statusType: string;
  openingHours: string;

  photos: string; // same structure as your Mongo response
  comments: string; // plain string, not array — matches backend
  createdAt: string;
  updatedAt: string;
}

export type NewChargingStation = Omit<ChargingStation, "id">;

// ✅ Factory to safely create a charging station record
export function createChargingStation(
  partial: Partial<NewChargingStation>
): NewChargingStation {
  if (!partial.stationName) {
    throw new Error("Station name is required");
  }
  if (partial.latitude === undefined || partial.longitude === undefined) {
    throw new Error("Latitude and longitude are required");
  }

  return {
    acmId: partial.acmId ?? 0,
    stationName: partial.stationName,
    address: partial.address ?? "",

    latitude: partial.latitude,
    longitude: partial.longitude,

    amountCCS: partial.amountCCS ?? 0,
    amountCHAdeMO: partial.amountCHAdeMO ?? 0,
    amountType2: partial.amountType2 ?? 0,

    statusType: partial.statusType ?? "unknown",
    openingHours: partial.openingHours ?? "Not specified",

    photos: partial.photos ?? "",
    comments: partial.comments ?? "",

    createdAt: partial.createdAt ?? new Date().toISOString(),
    updatedAt: partial.updatedAt ?? new Date().toISOString(),
  };
}
