import {
  Controller, Get, Post, Param,
  Body, Res, Req, Query, UseGuards
} from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../auth/user.entity';
import { LogsService } from '../logs/logs.service';
import type { Request, Response } from 'express';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(
    private courseService: CourseService,
    private logsService: LogsService,
  ) {}

  @Get()
  async index(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.courseService.findAll(search, Number(page) || 1);
    return res.render('courses/index', {
      title: 'Courses — EduManage',
      user: (req as any).user,
      currentPage: 'courses',
      search: search ?? '',
      ...result,
    });
  }

  @Get('add')
  addPage(@Req() req: Request, @Res() res: Response) {
    return res.render('courses/add', {
      title: 'Add Course — EduManage',
      user: (req as any).user,
      currentPage: 'courses',
      error: null,
    });
  }

  @Post('add')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    try {
      const course = await this.courseService.create({
        course_code: body.course_code,
        course_name: body.course_name,
        department: body.department,
        description: body.description,
        instructor: body.instructor,
      });
      await this.logsService.log(user, `Added course: ${course.course_name} (${course.course_code})`, 'Courses');
      return res.redirect('/api/courses');
    } catch (error) {
      await this.logsService.log(user, `Failed to add course: ${error.message}`, 'Courses', 'error');
      return res.render('courses/add', {
        title: 'Add Course — EduManage',
        user,
        currentPage: 'courses',
        error: error.message,
      });
    }
  }

  @Get(':id/edit')
  async editPage(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const course = await this.courseService.findOne(Number(id));
      return res.render('courses/edit', {
        title: 'Edit Course — EduManage',
        user: (req as any).user,
        currentPage: 'courses',
        course,
        error: null,
      });
    } catch {
      return res.redirect('/api/courses');
    }
  }

  @Post(':id/edit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    try {
      await this.courseService.update(Number(id), {
        course_code: body.course_code,
        course_name: body.course_name,
        department: body.department,
        description: body.description,
        instructor: body.instructor,
        is_active: body.is_active === 'true',
      });
      await this.logsService.log(user, `Updated course ID ${id}: ${body.course_name}`, 'Courses');
      return res.redirect('/api/courses');
    } catch (error) {
      await this.logsService.log(user, `Failed to update course ID ${id}: ${error.message}`, 'Courses', 'error');
      const course = await this.courseService.findOne(Number(id));
      return res.render('courses/edit', {
        title: 'Edit Course — EduManage',
        user,
        currentPage: 'courses',
        course,
        error: error.message,
      });
    }
  }

  @Post(':id/delete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    await this.courseService.remove(Number(id));
    await this.logsService.log(user, `Deleted course ID ${id}`, 'Courses');
    return res.redirect('/api/courses');
  }
}