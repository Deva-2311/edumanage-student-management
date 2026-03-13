import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMarksDto {
  @IsOptional()
  @IsString()
  exam_type?: string;

  @IsOptional()
  @IsNumber()
  marks_obtained?: number;

  @IsOptional()
  @IsNumber()
  max_marks?: number;
}