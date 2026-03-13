import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  course_code?: string;

  @IsOptional()
  @IsString()
  course_name?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructor?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}