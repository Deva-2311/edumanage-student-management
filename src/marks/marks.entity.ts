import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn
} from 'typeorm';
import { Student } from '../students/student.entity';
import { Course } from '../courses/course.entity';
import { User } from '../auth/user.entity';

@Entity('marks')
export class Mark {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, student => student.marks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, course => course.marks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column()
  exam_type: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  marks_obtained: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  max_marks: number;

  @Column({ nullable: true })
  grade: string;

  @CreateDateColumn()
  created_at: Date;
}