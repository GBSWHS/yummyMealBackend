import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchoolMealModule } from './modules/school-meal/school-meal.module';

@Module({
  imports: [
    ConfigModule,
    SchoolMealModule,
  ],
})
export class AppModule {}
