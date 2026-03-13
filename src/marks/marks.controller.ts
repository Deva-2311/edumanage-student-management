import { Controller, Get, Post, Param, Body, Res, Req, Query, UseGuards } from '@nestjs/common';
import { MarksService } from './marks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../auth/user.entity';
import { LogsService } from '../logs/logs.service';
import type { Request, Response } from 'express';

@Controller('marks')
@UseGuards(JwtAuthGuard)
export class MarksController {
  constructor(
    private marksService: MarksService,
    private logsService: LogsService,
  ) {}

  @Get()
  async index(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.marksService.findAll(Number(page) || 1, 10, search);
    const stats = await this.marksService.getStats();
    return res.render('marks/index', {
      title: 'Marks — EduManage',
      user: (req as any).user,
      currentPage: 'marks',
      search: search ?? '',
      ...result,
      ...stats,
    });
  }

  @Get('add')
  async addPage(@Req() req: Request, @Res() res: Response) {
    const students = await this.marksService.getAllStudents();
    const courses = await this.marksService.getAllCourses();
    return res.render('marks/add', {
      title: 'Add Marks — EduManage',
      user: (req as any).user,
      currentPage: 'marks',
      students,
      courses,
      error: null,
    });
  }

  @Post('add')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    try {
      const mark = await this.marksService.create(
        parseInt(body.student_id),
        parseInt(body.course_id),
        body.exam_type,
        parseFloat(body.marks_obtained),
        parseFloat(body.max_marks),
        user,
      );
      await this.logsService.log(
        user,
        `Added marks: Student ${body.student_id}, ${body.exam_type} — ${mark.marks_obtained}/${mark.max_marks} (${mark.grade})`,
        'Marks',
      );
      return res.redirect('/api/marks');
    } catch (error) {
      await this.logsService.log(user, `Failed to add marks: ${error.message}`, 'Marks', 'error');
      const students = await this.marksService.getAllStudents();
      const courses = await this.marksService.getAllCourses();
      return res.render('marks/add', {
        title: 'Add Marks — EduManage',
        user,
        currentPage: 'marks',
        students,
        courses,
        error: error.message,
      });
    }
  }

  @Get(':id/edit')
  async editPage(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const mark = await this.marksService.findOne(Number(id));
      return res.render('marks/edit', {
        title: 'Edit Marks — EduManage',
        user: (req as any).user,
        currentPage: 'marks',
        mark,
        error: null,
      });
    } catch {
      return res.redirect('/api/marks');
    }
  }

  @Post(':id/edit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    try {
      const mark = await this.marksService.update(
        Number(id),
        body.exam_type,
        parseFloat(body.marks_obtained),
        parseFloat(body.max_marks),
      );
      await this.logsService.log(
        user,
        `Updated marks ID ${id}: ${mark.marks_obtained}/${mark.max_marks} (${mark.grade})`,
        'Marks',
      );
      return res.redirect('/api/marks');
    } catch (error) {
      await this.logsService.log(user, `Failed to update marks ID ${id}: ${error.message}`, 'Marks', 'error');
      const mark = await this.marksService.findOne(Number(id));
      return res.render('marks/edit', {
        title: 'Edit Marks — EduManage',
        user,
        currentPage: 'marks',
        mark,
        error: error.message,
      });
    }
  }

  @Post(':id/delete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    await this.marksService.remove(Number(id));
    await this.logsService.log(user, `Deleted marks record ID ${id}`, 'Marks');
    return res.redirect('/api/marks');
  }
}