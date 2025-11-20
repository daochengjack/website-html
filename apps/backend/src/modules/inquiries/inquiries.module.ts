import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CaptchaGuard } from '../../common/guards/captcha.guard';
import { EmailService } from '../../services/email/email.service';
import { JobService } from '../../services/job/job.service';

import { InquiriesController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';

@Module({
  imports: [ConfigModule],
  controllers: [InquiriesController],
  providers: [InquiriesService, EmailService, JobService, CaptchaGuard],
  exports: [InquiriesService],
})
export class InquiriesModule {}
