import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNotEmpty()
  @IsNumber()
  student_id: number;

  @IsNotEmpty()
  @IsNumber()
  course_id: number;

  @IsOptional()
  @IsString()
  status?: string;
}