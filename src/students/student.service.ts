import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Student } from './student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { NotificationsService } from '../notifications/notifications.service';
import { WebhookService } from '../notifications/webhook.service';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    private httpService: HttpService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private webhookService: WebhookService,
  ) {}

  // Get all students with optional search + pagination
  async findAll(search?: string, page = 1, limit = 10) {
    const where = search
      ? [
          { name: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
          { department: Like(`%${search}%`) },
        ]
      : {};

    const [students, total] = await this.studentRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { students, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Get one student by ID
  async findOne(id: number) {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['enrollments', 'enrollments.course', 'attendance', 'marks', 'marks.course'],
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  // Create new student + fire webhook
  async create(dto: CreateStudentDto) {
    const existing = await this.studentRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already exists');

    const student = this.studentRepo.create(dto);
    const saved = await this.studentRepo.save(student);

    // Fire webhook for n8n/Zapier and send email
    await this.webhookService.notifyNewStudent(saved);
    await this.notificationsService.sendWelcomeEmail(saved.email, saved.name);

    return saved;
  }

  // Update student
  async update(id: number, dto: UpdateStudentDto) {
    const student = await this.findOne(id);
    Object.assign(student, dto);
    return this.studentRepo.save(student);
  }

  // Delete student
  async remove(id: number) {
    const student = await this.findOne(id);
    await this.studentRepo.remove(student);
    return { message: 'Student deleted successfully' };
  }


}