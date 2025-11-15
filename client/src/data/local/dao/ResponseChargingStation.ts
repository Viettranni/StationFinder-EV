export interface ResponseChargingStation {
  _id: string;
  acmId: number;
  v: number;
  address: string;
  amountCCS: number;
  amountCHAdeMO: number;
  amountType2: number;
  comments: any[];
  createdAt: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  photos: any[];
  stationName: string;
  statusType: string;
  updatedAt: string;
}
