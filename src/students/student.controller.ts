import {
  Controller, Get, Post, Body, Param, Res,
  Req, Query, UseGuards, Render
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../auth/user.entity';
import { LogsService } from '../logs/logs.service';
import type { Request, Response } from 'express';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(
    private studentService: StudentService,
    private logsService: LogsService,
  ) {}

  // Student list page
  @Get()
  async index(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.studentService.findAll(search, Number(page) || 1);
    return res.render('students/index', {
      title: 'Students — EduManage',
      user: (req as any).user,
      currentPage: 'students',
      search: search ?? '',
      ...result,
    });
  }

  // Add student page
  @Get('add')
  addPage(@Req() req: Request, @Res() res: Response) {
    return res.render('students/add', {
      title: 'Add Student — EduManage',
      user: (req as any).user,
      currentPage: 'students',
      error: null,
    });
  }

  // Handle add student form — admin only
  @Post('add')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    try {
      const dto: CreateStudentDto = {
        name: body.name,
        email: body.email,
        age: parseInt(body.age),
        department: body.department,
        phone: body.phone,
        city: body.city,
      };
      const student = await this.studentService.create(dto);
      await this.logsService.log(user, `Added student: ${student.name}`, 'Students');
      return res.redirect('/api/students');
    } catch (error) {
      await this.logsService.log(user, `Failed to add student: ${error.message}`, 'Students', 'error');
      return res.render('students/add', {
        title: 'Add Student — EduManage',
        user,
        currentPage: 'students',
        error: error.message,
      });
    }
  }

  // Student profile page
  @Get(':id')
  async profile(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const student = await this.studentService.findOne(Number(id));
      return res.render('students/profile', {
        title: `${student.name} — EduManage`,
        user: (req as any).user,
        currentPage: 'students',
        student,
      });
    } catch {
      return res.redirect('/api/students');
    }
  }

  // Edit student page
  @Get(':id/edit')
  async editPage(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const student = await this.studentService.findOne(Number(id));
      return res.render('students/edit', {
        title: 'Edit Student — EduManage',
        user: (req as any).user,
        currentPage: 'students',
        student,
        error: null,
      });
    } catch {
      return res.redirect('/api/students');
    }
  }

  // Handle edit form — admin only
  @Post(':id/edit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    try {
      const dto: UpdateStudentDto = {
        name: body.name,
        email: body.email,
        age: parseInt(body.age),
        department: body.department,
        phone: body.phone,
        city: body.city,
      };
      await this.studentService.update(Number(id), dto);
      await this.logsService.log(user, `Updated student ID ${id}: ${body.name}`, 'Students');
      return res.redirect('/api/students');
    } catch (error) {
      await this.logsService.log(user, `Failed to update student ID ${id}: ${error.message}`, 'Students', 'error');
      const student = await this.studentService.findOne(Number(id));
      return res.render('students/edit', {
        title: 'Edit Student — EduManage',
        user,
        currentPage: 'students',
        student,
        error: error.message,
      });
    }
  }

  // Delete student — admin only
  @Post(':id/delete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    await this.studentService.remove(Number(id));
    await this.logsService.log(user, `Deleted student ID ${id}`, 'Students');
    return res.redirect('/api/students');
  }
}