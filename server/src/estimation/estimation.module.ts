import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EstimationController } from './estimation.controller';
import { EstimationService } from './estimation.service';

@Module({
  imports: [HttpModule],
  controllers: [EstimationController],
  providers: [EstimationService]
})

export class EstimationModule {}
