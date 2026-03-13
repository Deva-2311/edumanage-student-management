import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from './attendance.entity';
import { Student } from '../students/student.entity';
import { Course } from '../courses/course.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async findAll(page = 1, limit = 10, search?: string, date?: string) {
    const query = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.course', 'course')
      .orderBy('attendance.date', 'DESC')
      .addOrderBy('attendance.created_at', 'DESC');

    if (search) {
      query.where('student.name ILIKE :search OR course.course_name ILIKE :search',
        { search: `%${search}%` });
    }

    if (date) {
      query.andWhere('attendance.date = :date', { date });
    }

    const total = await query.getCount();
    const records = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { records, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAttendance(
    student_id: number,
    course_id: number,
    date: string,
    status: AttendanceStatus,
    teacher: User,
  ) {
    const student = await this.studentRepo.findOne({ where: { id: student_id } });
    if (!student) throw new NotFoundException('Student not found');

    const course = await this.courseRepo.findOne({ where: { id: course_id } });
    if (!course) throw new NotFoundException('Course not found');

    // Check if attendance already marked for this student+course+date
    let attendance = await this.attendanceRepo.findOne({
      where: { student: { id: student_id }, course: { id: course_id }, date },
    });

    if (attendance) {
      // Update existing
      attendance.status = status;
    } else {
      // Create new
      attendance = this.attendanceRepo.create({ student, course, date, status, teacher });
    }

    return this.attendanceRepo.save(attendance);
  }

  async updateStatus(id: number, status: AttendanceStatus) {
    const attendance = await this.attendanceRepo.findOne({ where: { id } });
    if (!attendance) throw new NotFoundException('Attendance record not found');
    attendance.status = status;
    return this.attendanceRepo.save(attendance);
  }

  async getStats() {
    const total = await this.attendanceRepo.count();
    const present = await this.attendanceRepo.count({
      where: { status: AttendanceStatus.PRESENT },
    });
    const absent = await this.attendanceRepo.count({
      where: { status: AttendanceStatus.ABSENT },
    });
    const late = await this.attendanceRepo.count({
      where: { status: AttendanceStatus.LATE },
    });
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, rate };
  }

  async getAllStudents() {
    return this.studentRepo.find({ order: { name: 'ASC' } });
  }

  async getAllCourses() {
    return this.courseRepo.find({ where: { is_active: true }, order: { course_name: 'ASC' } });
  }
}