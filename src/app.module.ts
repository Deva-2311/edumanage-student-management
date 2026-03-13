import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { User } from './auth/user.entity';
import { Student } from './students/student.entity';
import { Course } from './courses/course.entity';
import { Enrollment } from './enrollment/enrollment.entity';
import { Attendance } from './attendance/attendance.entity';
import { Mark } from './marks/marks.entity';
import { Log } from './logs/log.entity';
import { StudentModule } from './students/student.module';
import { CourseModule } from './courses/course.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { AttendanceModule } from './attendance/attendance.module';
import { MarksModule } from './marks/marks.module';
import { LogsModule } from './logs/logs.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT') ?? '5432', 10),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        entities: [User, Student, Course, Enrollment, Attendance, Mark, Log],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    LogsModule,
    AuthModule,
    DashboardModule,
    StudentModule,
    CourseModule,
    EnrollmentModule,
    AttendanceModule,
    MarksModule,
    SettingsModule,
  ],
})
export class AppModule {}