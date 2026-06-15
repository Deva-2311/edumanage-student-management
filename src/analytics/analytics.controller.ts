import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../auth/user.entity';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(@Req() req: Request, @Res() res: Response) {
    const heatmap = await this.analyticsService.getDepartmentHeatmap();
    const prediction = await this.analyticsService.getAttendanceTrendPrediction();

    return res.render('reports/analytics', {
      title: 'Advanced Analytics — EduManage',
      user: (req as any).user,
      currentPage: 'reports',
      heatmap,
      prediction,
    });
  }
}
