import { Controller, Get, Post, Param, Body, Res, Req, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceStatus } from './attendance.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LogsService } from '../logs/logs.service';
import type { Request, Response } from 'express';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(
    private attendanceService: AttendanceService,
    private logsService: LogsService,
  ) {}

  @Get()
  async index(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('date') date?: string,
  ) {
    const result = await this.attendanceService.findAll(Number(page) || 1, 10, search, date);
    const stats = await this.attendanceService.getStats();

    return res.render('attendance/index', {
      title: 'Attendance — EduManage',
      user: (req as any).user,
      currentPage: 'attendance',
      search: search ?? '',
      date: date ?? '',
      ...result,
      ...stats,
    });
  }

  @Get('mark')
  async markPage(@Req() req: Request, @Res() res: Response) {
    const students = await this.attendanceService.getAllStudents();
    const courses = await this.attendanceService.getAllCourses();
    const today = new Date().toISOString().split('T')[0];

    return res.render('attendance/mark', {
      title: 'Mark Attendance — EduManage',
      user: (req as any).user,
      currentPage: 'attendance',
      students,
      courses,
      today,
      error: null,
      success: null,
    });
  }

  @Post('mark')
  async markAttendance(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    try {
      await this.attendanceService.markAttendance(
        parseInt(body.student_id),
        parseInt(body.course_id),
        body.date,
        body.status as AttendanceStatus,
        user,
      );
      await this.logsService.log(
        user,
        `Marked attendance: Student ${body.student_id}, Course ${body.course_id} — ${body.status} on ${body.date}`,
        'Attendance',
      );

      const students = await this.attendanceService.getAllStudents();
      const courses = await this.attendanceService.getAllCourses();
      const today = new Date().toISOString().split('T')[0];

      return res.render('attendance/mark', {
        title: 'Mark Attendance — EduManage',
        user,
        currentPage: 'attendance',
        students,
        courses,
        today,
        error: null,
        success: 'Attendance marked successfully!',
      });
    } catch (error) {
      await this.logsService.log(user, `Attendance marking failed: ${error.message}`, 'Attendance', 'error');
      const students = await this.attendanceService.getAllStudents();
      const courses = await this.attendanceService.getAllCourses();
      const today = new Date().toISOString().split('T')[0];

      return res.render('attendance/mark', {
        title: 'Mark Attendance — EduManage',
        user,
        currentPage: 'attendance',
        students,
        courses,
        today,
        error: error.message,
        success: null,
      });
    }
  }

  @Post(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    await this.attendanceService.updateStatus(Number(id), body.status as AttendanceStatus);
    await this.logsService.log(user, `Updated attendance ID ${id} to ${body.status}`, 'Attendance');
    return res.redirect('/api/attendance');
  }
}