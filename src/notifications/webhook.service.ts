import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private webhookUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.webhookUrl = this.configService.get('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook/edumanage');
  }

  async notifyNewStudent(studentData: any) {
    try {
      this.logger.log(`Sending new student webhook payload for: ${studentData.name}`);
      // Send webhook asynchronously without blocking
      firstValueFrom(
        this.httpService.post(this.webhookUrl, {
          event: 'student_created',
          data: studentData,
          timestamp: new Date().toISOString(),
        }).pipe(
          catchError((error) => {
            this.logger.warn(`Failed to send webhook to n8n (is it running?): ${error.message}`);
            throw 'Webhook failed';
          })
        )
      ).catch(() => {}); // Catch safely
    } catch (error) {
      // Ignored
    }
  }
}
