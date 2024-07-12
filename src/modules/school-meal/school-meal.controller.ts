import { Controller, Get, Query } from '@nestjs/common';
import { SchoolMealService } from './school-meal.service';
import { MealType } from './dto/meal-type.enum';
import SchoolMealDto from './dto/school-meal.dto';

@Controller('school-meal')
export class SchoolMealController {
  constructor(private readonly schoolMealService: SchoolMealService) {}

  @Get()
  async getSchoolMeal(
    @Query('school_name') schoolName: string,
    @Query('meal_type') mealType: MealType,
  ): Promise<SchoolMealDto[]> {
    return await this.schoolMealService.getSchoolMeal(schoolName, mealType);
  }
}
