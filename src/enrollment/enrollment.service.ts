import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './enrollment.entity';
import { Student } from '../students/student.entity';
import { Course } from '../courses/course.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const query = this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course')
      .orderBy('enrollment.enrolled_at', 'DESC');

    if (search) {
      query.where(
        'student.name ILIKE :search OR course.course_name ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const total = await query.getCount();
    const enrollments = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { enrollments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(student_id: number, course_id: number) {
    const student = await this.studentRepo.findOne({ where: { id: student_id } });
    if (!student) throw new NotFoundException('Student not found');

    const course = await this.courseRepo.findOne({ where: { id: course_id } });
    if (!course) throw new NotFoundException('Course not found');

    // Check if already enrolled
    const existing = await this.enrollmentRepo.findOne({
      where: { student: { id: student_id }, course: { id: course_id } },
    });
    if (existing) throw new ConflictException('Student already enrolled in this course');

    const enrollment = this.enrollmentRepo.create({ student, course });
    return this.enrollmentRepo.save(enrollment);
  }

  async updateStatus(id: number, status: EnrollmentStatus) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    enrollment.status = status;
    return this.enrollmentRepo.save(enrollment);
  }

  async remove(id: number) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    await this.enrollmentRepo.remove(enrollment);
    return { message: 'Enrollment removed successfully' };
  }

  async getStats() {
    const total = await this.enrollmentRepo.count();
    const active = await this.enrollmentRepo.count({
      where: { status: EnrollmentStatus.ACTIVE },
    });
    const completed = await this.enrollmentRepo.count({
      where: { status: EnrollmentStatus.COMPLETED },
    });
    const dropped = await this.enrollmentRepo.count({
      where: { status: EnrollmentStatus.DROPPED },
    });
    return { total, active, completed, dropped };
  }

  async getAllStudents() {
    return this.studentRepo.find({ order: { name: 'ASC' } });
  }

  async getAllCourses() {
    return this.courseRepo.find({ where: { is_active: true }, order: { course_name: 'ASC' } });
  }
}