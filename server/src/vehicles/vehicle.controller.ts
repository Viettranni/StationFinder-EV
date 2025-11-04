import { Controller, Post, Get, Body } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.addVehicle(createVehicleDto);
  }

  @Get()
  findAll() {
    return this.vehicleService.getAllVehicles();
  }
}
