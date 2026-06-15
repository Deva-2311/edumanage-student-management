import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // In a real app, you would use SMTP credentials from config
    // For development/demonstration, we use a mock transport or Ethereal
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.ethereal.email'),
      port: this.configService.get('SMTP_PORT', 587),
      auth: {
        user: this.configService.get('SMTP_USER', 'test@ethereal.email'),
        pass: this.configService.get('SMTP_PASS', 'testpass'),
      },
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"EduManage System" <noreply@edumanage.com>',
        to: email,
        subject: 'Welcome to EduManage!',
        text: `Hello ${name},\n\nWelcome to EduManage. Your student portal account has been created.`,
        html: `<h3>Hello ${name},</h3><p>Welcome to EduManage. Your student portal account has been created.</p>`,
      });
      this.logger.log(`Welcome email sent to ${email}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
    }
  }

  async sendLowAttendanceAlert(email: string, courseName: string, attendance: number) {
    try {
      const info = await this.transporter.sendMail({
        from: '"EduManage Alerts" <alerts@edumanage.com>',
        to: email,
        subject: `Low Attendance Alert: ${courseName}`,
        text: `Warning: Your attendance for ${courseName} is currently at ${attendance}%.`,
      });
      this.logger.log(`Low attendance alert sent to ${email}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send low attendance alert to ${email}`, error);
    }
  }

  async sendMarksPublished(email: string, courseName: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"EduManage Academic" <academic@edumanage.com>',
        to: email,
        subject: `Marks Published: ${courseName}`,
        text: `Your marks for ${courseName} have been published. Log in to the student portal to view them.`,
      });
      this.logger.log(`Marks published email sent to ${email}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send marks published email to ${email}`, error);
    }
  }
}
