import { Controller, Get, Post, Param, Body, Res, Req, Query, UseGuards } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentStatus } from './enrollment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../auth/user.entity';
import { LogsService } from '../logs/logs.service';
import type { Request, Response } from 'express';

@Controller('enrollment')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(
    private enrollmentService: EnrollmentService,
    private logsService: LogsService,
  ) {}

  @Get()
  async index(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.enrollmentService.findAll(Number(page) || 1, 10, search);
    const stats = await this.enrollmentService.getStats();
    const students = await this.enrollmentService.getAllStudents();
    const courses = await this.enrollmentService.getAllCourses();

    return res.render('enrollment/index', {
      title: 'Enrollment — EduManage',
      user: (req as any).user,
      currentPage: 'enrollment',
      search: search ?? '',
      students,
      courses,
      ...result,
      ...stats,
    });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    try {
      const enrollment = await this.enrollmentService.create(
        parseInt(body.student_id),
        parseInt(body.course_id),
      );
      await this.logsService.log(
        user,
        `Enrolled student ID ${body.student_id} in course ID ${body.course_id}`,
        'Enrollment',
      );
      return res.redirect('/api/enrollment');
    } catch (error) {
      await this.logsService.log(user, `Enrollment failed: ${error.message}`, 'Enrollment', 'error');
      const result = await this.enrollmentService.findAll();
      const stats = await this.enrollmentService.getStats();
      const students = await this.enrollmentService.getAllStudents();
      const courses = await this.enrollmentService.getAllCourses();
      return res.render('enrollment/index', {
        title: 'Enrollment — EduManage',
        user,
        currentPage: 'enrollment',
        search: '',
        students,
        courses,
        error: error.message,
        ...result,
        ...stats,
      });
    }
  }

  @Post(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    await this.enrollmentService.updateStatus(Number(id), body.status as EnrollmentStatus);
    await this.logsService.log(user, `Updated enrollment ID ${id} status to ${body.status}`, 'Enrollment');
    return res.redirect('/api/enrollment');
  }

  @Post(':id/delete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    await this.enrollmentService.remove(Number(id));
    await this.logsService.log(user, `Removed enrollment ID ${id}`, 'Enrollment');
    return res.redirect('/api/enrollment');
  }
}