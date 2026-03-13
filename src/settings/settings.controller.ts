import { Controller, Get, Post, Body, Req, Res, UseGuards, Redirect, ForbiddenException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { LogsService } from '../logs/logs.service';
import { UserRole } from '../auth/user.entity';
import type { Request, Response } from 'express';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private settingsService: SettingsService,
    private logsService: LogsService,
  ) {}

  @Get()
  redirectToSystem(@Res() res: Response) {
    return res.redirect('/api/settings/system');
  }

  @Get('system')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async systemPage(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    // If user is not admin, redirect gracefully instead of a bare 403
    if (user?.role !== UserRole.ADMIN) {
      return res.redirect('/api/settings/profile');
    }
    return res.render('settings/system', {
      title: 'System Settings — EduManage',
      user,
      currentPage: 'settings',
      startTime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || 'development',
    });
  }

  @Get('profile')
  async profilePage(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    const profile = await this.settingsService.findById(user.id);
    return res.render('settings/profile', {
      title: 'My Profile — EduManage',
      user,
      profile,
      currentPage: 'settings',
      success: null,
      error: null,
    });
  }

  @Post('profile')
  async updateProfile(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    try {
      await this.settingsService.updateProfile(user.id, body.name);
      await this.logsService.log(user, 'Updated profile name', 'Settings');
      const profile = await this.settingsService.findById(user.id);
      return res.render('settings/profile', {
        title: 'My Profile — EduManage',
        user,
        profile,
        currentPage: 'settings',
        success: 'Profile updated successfully!',
        error: null,
      });
    } catch (error) {
      const profile = await this.settingsService.findById(user.id);
      return res.render('settings/profile', {
        title: 'My Profile — EduManage',
        user,
        profile,
        currentPage: 'settings',
        success: null,
        error: error.message,
      });
    }
  }

  @Post('password')
  async changePassword(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    try {
      await this.settingsService.changePassword(user.id, body.current_password, body.new_password);
      await this.logsService.log(user, 'Changed password', 'Settings');
      const profile = await this.settingsService.findById(user.id);
      return res.render('settings/profile', {
        title: 'My Profile — EduManage',
        user,
        profile,
        currentPage: 'settings',
        success: 'Password changed successfully!',
        error: null,
      });
    } catch (error) {
      const profile = await this.settingsService.findById(user.id);
      return res.render('settings/profile', {
        title: 'My Profile — EduManage',
        user,
        profile,
        currentPage: 'settings',
        success: null,
        error: error.message,
      });
    }
  }
}
