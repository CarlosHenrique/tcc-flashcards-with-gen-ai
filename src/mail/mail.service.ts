// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_RESET_URL}?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Recuperação de Senha</h2>
        <p>Olá! Você solicitou a redefinição de senha. Clique no botão abaixo:</p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;">Redefinir Senha</a>
        <p>Se preferir, copie e cole o link abaixo no navegador:</p>
        <p>${resetLink}</p>
        <p style="font-size:12px;color:#888;">Se você não solicitou essa mudança, ignore este e-mail.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"Equipe Suporte" <${process.env.MAIL_USER}>`,
      to,
      subject: '🔐 Redefinição de Senha',
      html,
    });
  }
}
