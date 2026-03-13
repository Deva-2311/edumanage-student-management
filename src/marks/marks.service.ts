import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mark } from './marks.entity';
import { Student } from '../students/student.entity';
import { Course } from '../courses/course.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class MarksService {
  constructor(
    @InjectRepository(Mark)
    private marksRepo: Repository<Mark>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  // Auto grade calculator
  calculateGrade(marks: number, max: number): string {
    const percentage = (marks / max) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const query = this.marksRepo
      .createQueryBuilder('mark')
      .leftJoinAndSelect('mark.student', 'student')
      .leftJoinAndSelect('mark.course', 'course')
      .orderBy('mark.created_at', 'DESC');

    if (search) {
      query.where(
        'student.name ILIKE :search OR course.course_name ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const total = await query.getCount();
    const marks = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { marks, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const mark = await this.marksRepo.findOne({
      where: { id },
      relations: ['student', 'course'],
    });
    if (!mark) throw new NotFoundException('Mark record not found');
    return mark;
  }

  async create(
    student_id: number,
    course_id: number,
    exam_type: string,
    marks_obtained: number,
    max_marks: number,
    teacher: User,
  ) {
    const student = await this.studentRepo.findOne({ where: { id: student_id } });
    if (!student) throw new NotFoundException('Student not found');

    const course = await this.courseRepo.findOne({ where: { id: course_id } });
    if (!course) throw new NotFoundException('Course not found');

    const grade = this.calculateGrade(marks_obtained, max_marks);

    const mark = this.marksRepo.create({
      student,
      course,
      exam_type,
      marks_obtained,
      max_marks,
      grade,
      teacher,
    });

    return this.marksRepo.save(mark);
  }

  async update(id: number, exam_type: string, marks_obtained: number, max_marks: number) {
    const mark = await this.findOne(id);
    mark.exam_type = exam_type;
    mark.marks_obtained = marks_obtained;
    mark.max_marks = max_marks;
    mark.grade = this.calculateGrade(marks_obtained, max_marks);
    return this.marksRepo.save(mark);
  }

  async remove(id: number) {
    const mark = await this.findOne(id);
    await this.marksRepo.remove(mark);
    return { message: 'Mark deleted successfully' };
  }

  async getStats() {
    const total = await this.marksRepo.count();
    const all = await this.marksRepo.find();
    const gradeCount = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    all.forEach(m => { if (m.grade) gradeCount[m.grade] = (gradeCount[m.grade] || 0) + 1; });
    return { total, gradeCount };
  }

  async getAllStudents() {
    return this.studentRepo.find({ order: { name: 'ASC' } });
  }

  async getAllCourses() {
    return this.courseRepo.find({ where: { is_active: true }, order: { course_name: 'ASC' } });
  }
}