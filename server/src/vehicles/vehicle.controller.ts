import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.addVehicle(createVehicleDto);
  }

  @Post('bulk')
  async createVehicles(@Body() vehicles: CreateVehicleDto[]) {
    return this.vehicleService.createMany(vehicles);
  }

  @Get()
  findAll() {
    return this.vehicleService.getAllVehicles();
  }

  @Delete('deleteAll')
  deleteAllVehicles() {
    return this.vehicleService.deleteAll();
  }
  
  @Delete(':id')
  deleteVehicleById(@Param('id') id: string) {
    return this.vehicleService.deleteVehicleById(id);
  }

  
}

