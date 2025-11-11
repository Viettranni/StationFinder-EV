import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { EstimationController } from './estimation.controller';
import { EstimationService } from './estimation.service';
import { WeatherService } from './weather.service';
import { GeminiService } from './gemini.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [EstimationController],
  providers: [EstimationService, WeatherService, GeminiService]
})

export class EstimationModule {}
