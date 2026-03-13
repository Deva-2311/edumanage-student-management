import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMarksDto {
  @IsNotEmpty()
  @IsNumber()
  student_id: number;

  @IsNotEmpty()
  @IsNumber()
  course_id: number;

  @IsNotEmpty()
  @IsString()
  exam_type: string;

  @IsNotEmpty()
  @IsNumber()
  marks_obtained: number;

  @IsNotEmpty()
  @IsNumber()
  max_marks: number;
}