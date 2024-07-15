import { Injectable } from '@nestjs/common';
import axios from 'axios';
import SchoolInfoDto from './dto/school-info.dto';
import { plainToInstance } from 'class-transformer';
import { format } from 'date-fns';
import { MealType } from './dto/meal-type.enum';
import SchoolMealDto from './dto/school-meal.dto';
import { ConfigService } from '@nestjs/config';
import { Canvas, createCanvas, registerFont } from 'canvas';
import * as path from 'path';

@Injectable()
export class SchoolMealService {
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('NEIS_API_KEY');
    const fontsPath = path.join(__dirname, '../../', 'assets/fonts');
    registerFont(path.join(fontsPath, 'IstokWeb-Bold.ttf'), { family: 'Istok Web', weight: 'bold' });
    registerFont(path.join(fontsPath, 'GothicA1-SemiBold.ttf'), { family: 'Gothic A1', weight: '600' });
  }

  async getSchoolInfo(schoolName: string): Promise<SchoolInfoDto> {
    const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${this.apiKey}&Type=json&pIndex=1&pSize=100&SCHUL_NM=${encodeURIComponent(schoolName)}`;

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

  async getSchoolMeal(
    schoolName: string,
    mealType?: MealType,
  ): Promise<SchoolMealDto[]> {
    const schoolInfo = await this.getSchoolInfo(schoolName);

    const date = format(new Date(), 'yyyyMMdd');
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${this.apiKey}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${schoolInfo.officeCode}&SD_SCHUL_CODE=${schoolInfo.schoolCode}&MLSV_YMD=${date} `;
    const response = await axios.get(url);
    const mealDataArray = response.data.mealServiceDietInfo[1].row;

    return mealDataArray
      .filter((mealData) => {
        if (mealType) {
          return mealData.MMEAL_SC_NM === mealType;
        }
        return true;
      })
      .map((mealData) =>
        plainToInstance(SchoolMealDto, {
          date: mealData.MLSV_YMD,
          type: mealData.MMEAL_SC_NM,
          calories: mealData.CAL_INFO,
          meals: mealData.DDISH_NM.split('<br/>').map((meal: string) =>
            meal.replace(/\s*\([^)]*\)/g, '').trim(),
          ),
        }),
      );
  }

  async createMealImage(
    schoolName: string,
    mealType: MealType,
  ): Promise<Canvas> {
    const schoolMeals = await this.getSchoolMeal(schoolName, mealType);

    const width = 1080;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#25252A';
    ctx.fillRect(0, 0, width, height);

    ctx.font = 'bold 40px "Istok Web"';
    ctx.fillStyle = 'white';
    const today = new Date();
    ctx.fillText(`${today.getMonth() + 1}월${today.getDate()}일 오늘의 아침은 🍔`, 50, 70);

    ctx.font = 'semibold 30px "Gothic A1"';
    ctx.fillStyle = 'white';
    const schoolText = schoolName;
    const schoolTextWidth = ctx.measureText(schoolText).width;
    ctx.fillText(schoolText, width - schoolTextWidth - 20, 70);

    const boxWidth = 300;
    const boxHeight = 95;
    const boxY = 110;
    const boxGap = 40;
    const radius = 5;

    const mealTypes = ['아침', '점심', '저녁'];
    for (let i = 0; i < 3; i++) {
      const boxX = 50 + (boxWidth + boxGap) * i;
      ctx.fillStyle = '#8E8E8E';
      ctx.beginPath();
      ctx.moveTo(boxX + radius, boxY);
      ctx.arcTo(
        boxX + boxWidth,
        boxY,
        boxX + boxWidth,
        boxY + boxHeight,
        radius,
      );
      ctx.arcTo(
        boxX + boxWidth,
        boxY + boxHeight,
        boxX,
        boxY + boxHeight,
        radius,
      );
      ctx.arcTo(boxX, boxY + boxHeight, boxX, boxY, radius);
      ctx.arcTo(boxX, boxY, boxX + boxWidth, boxY, radius);
      ctx.closePath();
      ctx.fill();

      ctx.font = '40px "Inter"';
      ctx.fillStyle = 'white';
      const boxText = `${mealTypes[i]}`;
      const textWidth = ctx.measureText(boxText).width;
      const textX = boxX + (boxWidth - textWidth) / 2;
      const textY = boxY + (boxHeight + 40) / 2;
      ctx.fillText(boxText, textX, textY);
    }

    const kcalY = boxY + boxHeight + 50;
    ctx.font = 'semibold 30px "Inter"';
    ctx.fillStyle = 'white';
    ctx.fillText('922.2 kcal', 50, kcalY);

    ctx.font = 'regular 40px "Inter"';
    const lineHeight = 40 + 30;

    schoolMeals[0].meals.forEach((meal, idx) => {
      const mealY = kcalY + 40 + lineHeight * (idx + 1);
      ctx.fillText(meal, 50, mealY);
    });

    return canvas;
  }
}
