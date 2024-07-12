import { IsNotEmpty, IsString } from "class-validator";

export default class SchoolInfoDto {
  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @IsString()
  @IsNotEmpty()
  schoolCode: string;

  @IsString()
  @IsNotEmpty()
  officeCode: string;
}