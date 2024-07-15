import { IsNotEmpty, IsString, IsArray, IsEnum } from 'class-validator';
import { MealType } from './meal-type.enum';

export default class SchoolMealDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsEnum(MealType)
  @IsNotEmpty()
  type: MealType;

  @IsString()
  @IsNotEmpty()
  calories: string;

  @IsArray()
  @IsNotEmpty()
  meals: string[];
}
