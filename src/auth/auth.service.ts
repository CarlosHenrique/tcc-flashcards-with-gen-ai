/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserInput } from './entities/auth.entity';

import * as bcrypt from 'bcrypt';
import { CreateUserInput, User } from 'src/user/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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

    return this.userService.createUser({ ...user, password });
  }
}
