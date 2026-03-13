import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsNumber()
  student_id: number;

  @IsNotEmpty()
  @IsNumber()
  course_id: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}