import { Controller, Get, Post, Body, Req, Res, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../auth/user.entity';
import { StudentService } from './student.service';
import { AuthService } from '../auth/auth.service';
import type { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';

/**
 * Student Portal — read-only views for students + password management.
 * Accessed after student login at /api/student-portal
 */
@Controller('student-portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentPortalController {
  constructor(
    private studentService: StudentService,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
  ) {}

  private async getStudent(req: Request) {
    const user = (req as any).user;
    const studentId = user?.studentId;
    if (!studentId) return null;
    try {
      return await this.studentService.findOne(studentId);
    } catch {
      return null;
    }
  }

  @Get()
  async dashboard(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    const student = await this.getStudent(req);
    return res.render('student-portal/dashboard', {
      title: 'My Dashboard',
      currentPage: 'portal-dashboard',
      user,
      student,
    });
  }

  @Get('marks')
  async marks(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    const student = await this.getStudent(req);
    return res.render('student-portal/marks', {
      title: 'My Marks',
      currentPage: 'portal-marks',
      user,
      student,
      marks: student?.marks ?? [],
    });
  }

  @Get('attendance')
  async attendance(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    const student = await this.getStudent(req);
    return res.render('student-portal/attendance', {
      title: 'My Attendance',
      currentPage: 'portal-attendance',
      user,
      student,
      records: student?.attendance ?? [],
    });
  }

  // ── Password Management ─────────────────────────────────────
  @Get('password')
  passwordPage(@Req() req: Request, @Res() res: Response) {
    return res.render('student-portal/password', {
      title: 'Change Password',
      currentPage: 'portal-password',
      user: (req as any).user,
      error: null,
      success: false,
    });
  }

  @Post('password')
  async changePassword(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    const fullUser = await this.authService.findById(user.id);
    const renderOpts = (error: string | null, success: boolean) =>
      res.render('student-portal/password', {
        title: 'Change Password',
        currentPage: 'portal-password',
        user,
        error,
        success,
      });

    if (!fullUser) return renderOpts('User not found.', false);
    if (!body.new_password || body.new_password !== body.confirm_password) {
      return renderOpts('New passwords do not match.', false);
    }

    const valid = await bcrypt.compare(body.current_password, fullUser.password);
    if (!valid) return renderOpts('Current password is incorrect.', false);

    await this.authService.resetPassword(fullUser.email, body.new_password, UserRole.STUDENT);
    return renderOpts(null, true);
  }
}
