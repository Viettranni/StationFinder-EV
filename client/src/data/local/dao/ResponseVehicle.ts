export interface ResponseVehicle {
  brand: string;
  make: string;
  batterySizeKwh: number[];
  efficiency: number;
  maxChargingSpeed_kW: number[];
  currentBatteryState?: number;
  imageUrl: string;
}
