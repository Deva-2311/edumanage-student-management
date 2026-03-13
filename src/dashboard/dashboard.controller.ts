import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request, Response } from 'express';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async index(@Req() req: Request, @Res() res: Response) {
    try {
      const stats = await this.dashboardService.getStats();
      return res.render('dashboard/index', {
        title: 'Dashboard — EduManage',
        user: (req as any).user,
        ...stats,
      });
    } catch (error) {
      return res.redirect('/api/dashboard');
    }
  }
}