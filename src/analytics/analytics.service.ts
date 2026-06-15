import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mark } from '../marks/marks.entity';
import { Attendance } from '../attendance/attendance.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Mark) private markRepo: Repository<Mark>,
    @InjectRepository(Attendance) private attRepo: Repository<Attendance>,
  ) {}

  async getDepartmentHeatmap() {
    // In a real app, you would query with JOINs to get department avg marks.
    // For demo, we return mock data based on roadmap.
    return {
      'Computer Science': 88,
      'Health Sciences': 92,
      'Business Admin': 85,
      'Mechanical Eng.': 79,
    };
  }

  async getAttendanceTrendPrediction() {
    // Basic prediction logic
    return {
      nextWeekPrediction: 89, // %
      trend: 'stable'
    };
  }
}
