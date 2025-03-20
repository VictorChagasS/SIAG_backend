import { IMailConfig } from './domain/interfaces/mail.interface';

export const mailConfig: IMailConfig = {
  host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.MAIL_PORT) || 2525,
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
  },
};
