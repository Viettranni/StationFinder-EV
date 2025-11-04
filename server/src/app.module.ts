import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { VehicleModule } from './vehicles/vehicle.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forRoot(process.env.MONGO_URI!),
    VehicleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
