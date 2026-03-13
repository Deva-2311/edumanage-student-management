import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany
} from 'typeorm';
import { Enrollment } from '../enrollment/enrollment.entity';
import { Attendance } from '../attendance/attendance.entity';
import { Mark } from '../marks/marks.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  age: number;

  @Column()
  department: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  city: string;

  @OneToMany(() => Enrollment, enrollment => enrollment.student)
  enrollments: Enrollment[];

  @OneToMany(() => Attendance, attendance => attendance.student)
  attendance: Attendance[];

  @OneToMany(() => Mark, mark => mark.student)
  marks: Mark[];

  @CreateDateColumn()
  created_at: Date;
}