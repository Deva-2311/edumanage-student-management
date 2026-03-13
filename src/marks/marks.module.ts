import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarksController } from './marks.controller';
import { MarksService } from './marks.service';
import { Mark } from './marks.entity';
import { Student } from '../students/student.entity';
import { Course } from '../courses/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mark, Student, Course])],
  controllers: [MarksController],
  providers: [MarksService],
  exports: [MarksService],
})
export class MarksModule {}