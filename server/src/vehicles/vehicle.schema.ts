import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Vehicle extends Document {
  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  make: string;

  @Prop()
  year: number;

  @Prop({ type: [Number], required: true })
  batterySizeKwh: number[];

  @Prop({ type: [Number], required: true })
  maxChargingSpeed_kW: number[];

  @Prop()
  efficiency: number;

  @Prop()
  imageUrl: string;

}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
