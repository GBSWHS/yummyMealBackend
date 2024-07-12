import { Module } from '@nestjs/common';
import { SchoolMealService } from './school-meal.service';
import { SchoolMealController } from './school-meal.controller';

@Module({
  controllers: [SchoolMealController],
  providers: [SchoolMealService],
})
export class SchoolMealModule {}
