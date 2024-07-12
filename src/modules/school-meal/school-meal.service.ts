import { Injectable } from '@nestjs/common';
import axios from 'axios';
import SchoolInfoDto from './dto/school-info.dto';
import { plainToInstance } from 'class-transformer';
import { format } from 'date-fns';
import { MealType } from './dto/meal-type.enum';
import SchoolMealDto from './dto/school-meal.dto';

@Injectable()
export class SchoolMealService {
  async getSchoolInfo(schoolName: string): Promise<SchoolInfoDto> {
    const apiKey = '6e2fef1070a944b0a3257829670e065c';
    const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${apiKey}&Type=json&pIndex=1&pSize=100&SCHUL_NM=${encodeURIComponent(schoolName)}`;

    const response = await axios.get(url);
    const schoolData = response.data.schoolInfo[1].row[0];

    const schoolCode = schoolData.SD_SCHUL_CODE;
    const officeCode = schoolData.ATPT_OFCDC_SC_CODE;

    return plainToInstance(SchoolInfoDto, {
      schoolName: schoolData.SCHUL_NM,
      schoolCode: schoolCode,
      officeCode: officeCode,
    });
  }

  async getSchoolMeal(schoolName: string, mealType?: MealType): Promise<SchoolMealDto[]> {
    const schoolInfo = await this.getSchoolInfo(schoolName);

    const apiKey = '6e2fef1070a944b0a3257829670e065c';
    const date = format(new Date(), 'yyyyMMdd');
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${apiKey}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${schoolInfo.officeCode}&SD_SCHUL_CODE=${schoolInfo.schoolCode}&MLSV_YMD=${date}`;
    const response = await axios.get(url);
    const mealDataArray = response.data.mealServiceDietInfo[1].row;

    return mealDataArray
    .filter(mealData => {
      if(mealType) {
        return mealData.MMEAL_SC_NM === mealType;
      }
      return true;
    })
    .map(mealData => plainToInstance(SchoolMealDto, {
      date: mealData.MLSV_YMD,
      type: mealData.MMEAL_SC_NM,
      calories: mealData.CAL_INFO,
      meals: mealData.DDISH_NM.split('<br/>').map(meal => meal.replace(/\s*\([^)]*\)/g, '').trim()),
    }));
  }
}
