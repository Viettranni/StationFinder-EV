import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle } from './vehicle.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(@InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>) {}

  async addVehicle(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = new this.vehicleModel(createVehicleDto);
    return vehicle.save();
  }
  
  async createMany(vehicles: CreateVehicleDto[]) {
    return this.vehicleModel.insertMany(vehicles);
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return this.vehicleModel.find().exec();
  }

  async deleteVehicleById(id: string): Promise<{ deletedCount?: number }> {
    return this.vehicleModel.deleteOne({ _id: id }).exec();
  }

  async deleteAll(): Promise<{ deletedCount?: number }> {
    return this.vehicleModel.deleteMany({});
  }
}
