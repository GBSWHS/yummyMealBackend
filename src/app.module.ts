import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/config/config.module';
import { SchoolMealModule } from './modules/school-meal/school-meal.module';

@Module({
  imports: [
    ConfigModule,
    SchoolMealModule,
  ],
})
export class AppModule {}
