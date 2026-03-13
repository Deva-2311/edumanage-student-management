import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany
} from 'typeorm';
import { Enrollment } from '../enrollment/enrollment.entity';
import { Attendance } from '../attendance/attendance.entity';
import { Mark } from '../marks/marks.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  course_code: string;

  @Column()
  course_name: string;

  @Column()
  department: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  instructor: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments: Enrollment[];

  @OneToMany(() => Attendance, attendance => attendance.course)
  attendance: Attendance[];

  @OneToMany(() => Mark, mark => mark.course)
  marks: Mark[];

  @CreateDateColumn()
  created_at: Date;
}
