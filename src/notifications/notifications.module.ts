import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { WebhookService } from './webhook.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [NotificationsService, WebhookService],
  exports: [NotificationsService, WebhookService],
})
export class NotificationsModule {}
