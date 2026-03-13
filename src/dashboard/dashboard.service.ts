import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/student.entity';
import { Course } from '../courses/course.entity';
import { Attendance } from '../attendance/attendance.entity';
import { Enrollment } from '../enrollment/enrollment.entity';
import { Log } from '../logs/log.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Student)
        private studentRepo: Repository<Student>,
        @InjectRepository(Course)
        private courseRepo: Repository<Course>,
        @InjectRepository(Attendance)
        private attendanceRepo: Repository<Attendance>,
        @InjectRepository(Enrollment)
        private enrollmentRepo: Repository<Enrollment>,
        @InjectRepository(Log)
        private logRepo: Repository<Log>,
    ) { }

    async getStats() {
        const totalStudents = await this.studentRepo.count();
        const totalCourses = await this.courseRepo.count();
        const totalEnrollments = await this.enrollmentRepo.count();

        // Today's attendance rate
        const today = new Date().toISOString().split('T')[0];
        const todayTotal = await this.attendanceRepo.count({
            where: { date: today }
        });
        const todayPresent = await this.attendanceRepo.count({
            where: { date: today, status: 'present' as any }
        });
        const attendanceRate = todayTotal > 0
            ? Math.round((todayPresent / todayTotal) * 100)
            : 0;

        // Recent logs
        const recentLogs = await this.logRepo.find({
            relations: ['user'],
            order: { timestamp: 'DESC' },
            take: 5,
        });

        // Recent enrollments
        const recentEnrollments = await this.enrollmentRepo.find({
            relations: ['student', 'course'],
            order: { enrolled_at: 'DESC' },
            take: 5,
        });

        return {
            totalStudents,
            totalCourses,
            totalEnrollments,
            attendanceRate,
            recentLogs,
            recentEnrollments,
        };
    }
}