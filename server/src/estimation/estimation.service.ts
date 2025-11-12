import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EstimationService {
  constructor(private readonly httpService: HttpService) {}

   // This endpoint will provide the estimated on arrival battery, routing points and kilometer from departure to destination
  async getEvRoute(origin: string, destination: string, currentBattery: number, batterySize: number, efficiency: number, maxChargingSpeedInKw: number) {
    const apiKey = process.env.TOMTOM_API_KEY;
    const url = `https://api.tomtom.com/routing/1/calculateLongDistanceEVRoute/${origin}:${destination}/json`;

    // Increasing the efficiency as the speed rises
    const constantCalculationSlow = 0.85 * efficiency
    const constantCalculationFast = 1.37 * efficiency


    const params = {
      key: apiKey,
      vehicleEngineType: 'electric',
      constantSpeedConsumptionInkWhPerHundredkm: `50,${constantCalculationSlow}:80,${efficiency}:120,${constantCalculationFast}`,
      currentChargeInkWh: currentBattery,
      maxChargeInkWh: batterySize,
      minChargeAtDestinationInkWh: 5,
      criticalMinChargeAtDestinationInkWh: 2,
      minChargeAtChargingStopsInkWh: 5
    };

    const body = {
      chargingParameters: {
        batteryCurve: [
          { stateOfChargeInkWh: 50.0, maxPowerInkW: 200 },
          { stateOfChargeInkWh: 70.0, maxPowerInkW: 100 },
          { stateOfChargeInkWh: 80.0, maxPowerInkW: 40 }
        ],
        chargingConnectors: [
          {
            currentType: 'AC3',
            plugTypes: [
              'IEC_62196_Type_2_Outlet',
              'IEC_62196_Type_2_Connector_Cable_Attached',
              'Combo_to_IEC_62196_Type_2_Base'
            ],
            efficiency: 0.9,
            baseLoadInkW: 0.2,
            maxPowerInkW: 11
          },
          {
            currentType: 'DC',
            plugTypes: [
              'IEC_62196_Type_2_Outlet',
              'IEC_62196_Type_2_Connector_Cable_Attached',
              'Combo_to_IEC_62196_Type_2_Base'
            ],
            voltageRange: { minVoltageInV: 0, maxVoltageInV: 500 },
            efficiency: 0.9,
            baseLoadInkW: 0.2,
            maxPowerInkW: `${maxChargingSpeedInKw}`
          },
          {
            currentType: 'DC',
            plugTypes: [
              'IEC_62196_Type_2_Outlet',
              'IEC_62196_Type_2_Connector_Cable_Attached',
              'Combo_to_IEC_62196_Type_2_Base'
            ],
            voltageRange: { minVoltageInV: 500, maxVoltageInV: 2000 },
            efficiency: 0.9,
            baseLoadInkW: 0.2
          }
        ],
        chargingTimeOffsetInSec: 60
      }
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, body, { params })
      );
      return response.data;
    } catch (error) {
      console.error('TomTom error:', error.response?.data || error.message);
      return { error: 'Failed to fetch EV route from TomTom API' };
    }
  }
}
