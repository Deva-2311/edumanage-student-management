import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../students/student.entity';
import { Course } from '../courses/course.entity';
import { Attendance } from '../attendance/attendance.entity';
import { Enrollment } from '../enrollment/enrollment.entity';
import { Log } from '../logs/log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Course, Attendance, Enrollment, Log]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}