import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  course_code: string;

  @IsNotEmpty()
  @IsString()
  course_name: string;

  @IsNotEmpty()
  @IsString()
  department: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructor?: string;
}