import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { StudentController } from './student.controller';
import { StudentPortalController } from './student-portal.controller';
import { StudentService } from './student.service';
import { Student } from './student.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    HttpModule,
    forwardRef(() => AuthModule),
    NotificationsModule,
  ],
  controllers: [StudentController, StudentPortalController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}