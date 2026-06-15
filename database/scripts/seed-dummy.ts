import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Mark } from '../../src/marks/marks.entity';
import { Course } from '../../src/courses/course.entity';
import { Student } from '../../src/students/student.entity';
import { User, UserRole } from '../../src/auth/user.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'edumanage',
  entities: ['src/**/*.entity.ts'],
});

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Connected to database');

  const courseRepo = AppDataSource.getRepository(Course);
  const studentRepo = AppDataSource.getRepository(Student);
  const markRepo = AppDataSource.getRepository(Mark);
  const userRepo = AppDataSource.getRepository(User);

  // 1. Ensure courses exist
  let courses = await courseRepo.find();
  if (courses.length === 0) {
    const defaultCourses = ['Advanced Mathematics', 'Computer Science', 'Physics', 'World History', 'Literature'];
    for (const c of defaultCourses) {
      await courseRepo.save(courseRepo.create({ course_name: c, course_code: c.substring(0, 3).toUpperCase() + '101', department: 'General' }));
    }
    courses = await courseRepo.find();
    console.log('✅ Created default courses');
  }

  // 2. Ensure students exist
  let students = await studentRepo.find();
  if (students.length < 10) {
    for (let i = students.length; i < 10; i++) {
      await studentRepo.save(studentRepo.create({
        name: `Student${i + 1} Dummy`,
        email: `student${i + 1}@example.com`,
        age: 20,
        department: 'General'
      }));
    }
    students = await studentRepo.find();
    console.log('✅ Created dummy students');
  }

  // 3. Ensure teacher exists
  let teacher = await userRepo.findOne({ where: { role: UserRole.TEACHER } });
  if (!teacher) {
    teacher = await userRepo.findOne({ where: { role: UserRole.ADMIN } }); // fallback to admin
  }

  // 4. Add 10 dummy marks for each course
  for (const course of courses) {
    for (let i = 0; i < 10; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const score = Math.floor(Math.random() * 41) + 60; // 60 to 100
      let grade = 'F';
      if (score >= 90) grade = 'A';
      else if (score >= 80) grade = 'B';
      else if (score >= 70) grade = 'C';
      else if (score >= 60) grade = 'D';

      await markRepo.save(markRepo.create({
        student: student,
        course: course,
        teacher: teacher,
        exam_type: 'Midterm',
        marks_obtained: score,
        max_marks: 100,
        grade: grade
      }));
    }
    console.log(`✅ Added 10 dummy marks for course: ${course.course_name}`);
  }

  await AppDataSource.destroy();
  console.log('✅ Dummy seed complete!');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
