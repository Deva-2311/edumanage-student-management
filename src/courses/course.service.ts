import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async findAll(search?: string, page = 1, limit = 10) {
    const where = search
      ? [
          { course_name: Like(`%${search}%`) },
          { course_code: Like(`%${search}%`) },
          { department: Like(`%${search}%`) },
        ]
      : {};

    const [courses, total] = await this.courseRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { courses, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['enrollments', 'enrollments.student'],
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(dto: CreateCourseDto) {
    const existing = await this.courseRepo.findOne({ where: { course_code: dto.course_code } });
    if (existing) throw new ConflictException('Course code already exists');

    const course = this.courseRepo.create(dto);
    return this.courseRepo.save(course);
  }

  async update(id: number, dto: UpdateCourseDto) {
    const course = await this.findOne(id);
    Object.assign(course, dto);
    return this.courseRepo.save(course);
  }

  async remove(id: number) {
    const course = await this.findOne(id);
    await this.courseRepo.remove(course);
    return { message: 'Course deleted successfully' };
  }
}