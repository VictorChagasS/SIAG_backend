import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MailService } from './domain/services/mail.service';
import { mailConfig } from './mail.config';

@Module({
  imports: [
    ConfigModule.forFeature(() => ({
      mail: mailConfig,
    })),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
