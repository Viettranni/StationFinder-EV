import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Service to fetch weather data from OpenWeather API
// Copyright: CC BY-SA 4.0
// Weather factors used for EV efficiency adjustment: 
// temperature (°C) - tempC, wind speed (m/s) - windMs, and weather conditions - cond

@Injectable()
export class WeatherService {
  constructor(private readonly httpService: HttpService) {}
 
  async getByLatLon(lat: number, lon: number) {
    const apiKey = process.env.OPENWEATHER_API_KEY!;
    const url = 'https://api.openweathermap.org/data/2.5/weather';
    const params = { lat, lon, appid: apiKey, units: 'metric' }; 

    try {
        const res = await firstValueFrom(this.httpService.get(url, { params }));
        const data = res.data;

        return {
            tempC: data.main?.temp,
            windMs: data.wind?.speed,
            cond: data.weather?.[0]?.main,
        };
    } catch (error) {
        // Return null values on error to avoid breaking the flow
        console.error('Weather API error:', error.response?.data || error.message);
        return {
            tempC: null,
            windMs: null,
            cond: null,
        };
    }
  }
}
