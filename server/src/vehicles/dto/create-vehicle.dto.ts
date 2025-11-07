export class CreateVehicleDto {
  readonly brand: string;
  readonly make: string;
  readonly batterySizeKwh?: number | number[];
  readonly efficiency?: number;
  readonly maxChargingSpeed_kW?: number | number[];
  readonly imageUrl?: string;
}
