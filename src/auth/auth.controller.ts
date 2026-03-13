import {
  Controller, Post, Body, Get, Render, Res, Req,
  UseGuards, Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogsService } from '../logs/logs.service';
import { StudentService } from '../students/student.service';
import type { Request, Response } from 'express';
import { UserRole } from './user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/roles.decorator';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private logsService: LogsService,
    private studentService: StudentService,
  ) {}

  // ───── Portal ─────────────────────────────────────────────
  @Get('login')
  @Render('auth/portal')
  portal() {
    return { title: 'EduManage — Select Portal' };
  }

  // ───── Login pages ────────────────────────────────────────
  @Get('login/admin')
  @Render('auth/login-admin')
  adminLoginPage() {
    return { title: 'Admin Login', error: null };
  }

  @Get('login/teacher')
  @Render('auth/login-teacher')
  teacherLoginPage() {
    return { title: 'Teacher Login', error: null };
  }

  @Get('login/student')
  @Render('auth/login-student')
  studentLoginPage() {
    return { title: 'Student Login', error: null };
  }

  // ───── Reset Password pages (teacher & student only) ──────
  @Get('reset-password/teacher')
  resetPasswordTeacherPage(@Res() res: Response) {
    return res.render('auth/reset-password', {
      title: 'Reset Password — Teacher',
      role: 'teacher',
      color: 'emerald',
      icon: '👩‍🏫',
      portalLabel: 'Teacher',
      backUrl: '/api/login/teacher',
      error: null,
      success: false,
    });
  }

  @Get('reset-password/student')
  resetPasswordStudentPage(@Res() res: Response) {
    return res.render('auth/reset-password', {
      title: 'Reset Password — Student',
      role: 'student',
      color: 'purple',
      icon: '🎒',
      portalLabel: 'Student',
      backUrl: '/api/login/student',
      error: null,
      success: false,
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any, @Res() res: Response) {
    const role = body.role as UserRole;
    const isTeacher = role === UserRole.TEACHER;
    const color = isTeacher ? 'emerald' : 'purple';
    const icon = isTeacher ? '👩‍🏫' : '🎒';
    const portalLabel = isTeacher ? 'Teacher' : 'Student';
    const backUrl = isTeacher ? '/api/login/teacher' : '/api/login/student';

    if (!body.new_password || body.new_password !== body.confirm_password) {
      return res.render('auth/reset-password', {
        title: `Reset Password — ${portalLabel}`,
        role, color, icon, portalLabel, backUrl,
        error: 'Passwords do not match or are empty.',
        success: false,
      });
    }

    try {
      await this.authService.resetPassword(body.email, body.new_password, role);
      return res.render('auth/reset-password', {
        title: `Reset Password — ${portalLabel}`,
        role, color, icon, portalLabel, backUrl,
        error: null,
        success: true,
      });
    } catch (err: any) {
      return res.render('auth/reset-password', {
        title: `Reset Password — ${portalLabel}`,
        role, color, icon, portalLabel, backUrl,
        error: err.message ?? 'Reset failed. Please check your email.',
        success: false,
      });
    }
  }

  // ───── POST login ──────────────────────────────────────────
  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      const result = await this.authService.login(body.email, body.password);
      res.cookie('token', result.token, { httpOnly: true });
      res.cookie('role', result.role);
      res.cookie('name', result.name);

      const user = await this.authService.findByEmail(body.email);
      await this.logsService.log(user, `User logged in (${result.role})`, 'Auth');

      if (result.role === UserRole.STUDENT) {
        return res.redirect('/api/student-portal');
      }
      return res.redirect('/api/dashboard');
    } catch (error) {
      const roleHint = body.role ?? 'admin';
      let view = 'auth/login-admin';
      if (roleHint === 'teacher') view = 'auth/login-teacher';
      if (roleHint === 'student') view = 'auth/login-student';
      return res.render(view, { title: 'Login', error: 'Invalid email or password' });
    }
  }

  // ───── Logout ──────────────────────────────────────────────
  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const user = (req as any).user;
      if (user) await this.logsService.log(user, 'User logged out', 'Auth');
    } catch { /* ignore */ }
    res.clearCookie('token');
    res.clearCookie('role');
    res.clearCookie('name');
    return res.redirect('/api/login');
  }

  // ───── Admin: User Management ──────────────────────────────
  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async usersPage(@Req() req: Request, @Res() res: Response) {
    try {
      const users = await this.authService.findAll();
      const all = await this.studentService.findAll(undefined, 1, 1000);
      const user = (req as any).user;
      return res.render('admin/users', {
        title: 'User Management',
        currentPage: 'users',
        users,
        students: all.students,
        user,
        error: null,
        success: null,
      });
    } catch (err) {
      const user = (req as any).user;
      return res.render('admin/users', {
        title: 'User Management',
        currentPage: 'users',
        users: [],
        students: [],
        user,
        error: 'Failed to load users',
        success: null,
      });
    }
  }

  @Post('admin/users/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    try {
      const role = (body.role as UserRole) ?? UserRole.TEACHER;
      const studentId = body.studentId ? parseInt(body.studentId) : undefined;
      await this.authService.register(body.name, body.email, body.password, role, studentId);
      const user = (req as any).user;
      await this.logsService.log(user, `Created ${role} account: ${body.email}`, 'Admin');
    } catch { /* redirect handles feedback */ }
    return res.redirect('/api/admin/users');
  }

  @Post('admin/users/:id/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      await this.authService.deleteUser(parseInt(id));
      const user = (req as any).user;
      await this.logsService.log(user, `Deleted user ID: ${id}`, 'Admin');
    } catch { /* swallow */ }
    return res.redirect('/api/admin/users');
  }

  // ───── Profile (own info) ──────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const user = (req as any).user;
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}