export class CreateVehicleDto {
  readonly brand: string;
  readonly make: string;
  readonly year?: number;
  readonly batterySizeKwh?: number;
  readonly efficiency?: number;
  readonly imageUrl?: string;
}
