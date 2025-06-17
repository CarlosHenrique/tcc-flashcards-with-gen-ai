/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserInput } from './entities/auth.entity';

import * as bcrypt from 'bcrypt';
import { CreateUserInput, User } from 'src/user/entities/user.entity';
import { QuizService } from 'src/quiz/quiz.service';
import { DeckService } from 'src/deck/deck.service';
import { randomBytes } from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private quizService: QuizService,
    private deckService: DeckService,
    private mailService: MailService, // ✅
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user?.password);

    if (user && valid) {
      const { password, ...rest } = user;
      return rest;
    }

    return null;
  }

  async login(user: LoginUserInput): Promise<any> {
    if (await this.validateUser(user.email, user.password)) {
      return {
        access_token: this.jwtService.sign({
          email: user.email,
        }),
        email: user.email,
      };
    } else {
      throw new Error('Usuário ou senha incorreta!');
    }
  }

  async signUp(user: CreateUserInput): Promise<User> {
    const userExists = await this.userService.findOneByEmail(user.email);
    if (userExists) throw new Error('User already exists!');
    const password = await bcrypt.hash(user.password, 10);

    const createdUser = this.userService.createUser({ ...user, password });
    await this.quizService.createQuizCopyForUser(user.email);
    await this.deckService.createDecksCopyForUser(user.email);
    return createdUser;
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new Error('Usuário não encontrado.');

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await this.userService.updateUser(user.email, {
      resetToken: token,
      resetTokenExpires: expires,
    });

    await this.mailService.sendResetPasswordEmail(email, token);

    return 'E-mail de recuperação enviado com sucesso.';
  }

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const user = await this.userService.findByResetToken(token);
    if (!user || user.resetTokenExpires < new Date()) {
      throw new Error('Token inválido ou expirado.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.userService.updateUser(user.email, {
      password: hashed,
      resetToken: null,
      resetTokenExpires: null,
    });

    return 'Senha redefinida com sucesso!';
  }
}
