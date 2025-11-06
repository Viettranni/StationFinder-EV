import { Controller, Get, Query, ParseFloatPipe } from '@nestjs/common';
import { EstimationService } from './estimation.service';

@Controller('ev-routing')
export class EstimationController {
  constructor(private readonly estimationService: EstimationService) {}

  @Get()
  async getEvRoute(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('batterySize', ParseFloatPipe) batterySize: number,
    @Query('currentBattery', ParseFloatPipe) currentBattery: number,
    @Query('maxChargingSpeedInKw', ParseFloatPipe) maxChargingSpeedInKw: number,
    @Query('efficiency', ParseFloatPipe) efficiency: number,
    @Query('plugType') plugType: string,
  ) {
    return this.estimationService.getEvRoute(
      origin,
      destination,
      currentBattery,
      batterySize,
      efficiency,
      maxChargingSpeedInKw,
      plugType,
    );
  }
}
