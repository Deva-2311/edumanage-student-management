import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Mark } from '../marks/marks.entity';
import { Attendance } from '../attendance/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mark, Attendance])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
