import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';

import { mailConfig } from '../../mail.config';
import { IMailService, ISendMailParams, ISendPasswordResetParams } from '../interfaces/mail.interface';

@Injectable()
export class MailService implements IMailService {
  private transporter;

  constructor() {
    this.transporter = createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      auth: {
        user: mailConfig.auth.user,
        pass: mailConfig.auth.pass,
      },
    });
  }

  async sendMail(params: ISendMailParams): Promise<void> {
    await this.transporter.sendMail({
      from: 'noreply@siag.com.br',
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  }

  async sendPasswordReset(params: ISendPasswordResetParams): Promise<void> {
    const html = `
      <h1>Olá ${params.name},</h1>
      <p>Você solicitou a redefinição de senha da sua conta no SIAG.</p>
      <p>Sua nova senha é: <strong>${params.password}</strong></p>
      <p>Por favor, altere sua senha após fazer login por questões de segurança.</p>
      <br>
      <p>Atenciosamente,</p>
      <p>Equipe SIAG</p>
    `;

    await this.sendMail({
      to: params.to,
      subject: 'SIAG - Redefinição de Senha',
      html,
    });
  }
}
