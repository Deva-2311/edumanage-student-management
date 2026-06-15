import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { StudentModule } from '../students/student.module';

@Module({
  imports: [StudentModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
