/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Args, Resolver, Mutation, Context, Query } from '@nestjs/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordInput,
  LoginResponse,
  LoginUserInput,
  ResetPasswordInput,
} from './entities/auth.entity';
import { User, CreateUserInput } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from './gql.auth.guard';
@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => LoginResponse)
  async login(
    @Args({ name: 'input', type: () => LoginUserInput })
    loginUserInput: LoginUserInput,
  ): Promise<string> {
    return this.authService.login(loginUserInput);
  }

  @Mutation(() => User)
  async signUp(
    @Args({ name: 'input', type: () => CreateUserInput })
    createUserInput: CreateUserInput,
  ) {
    return this.authService.signUp(createUserInput);
  }
  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  async verifyToken(@Context() context): Promise<User> {
    console.log('🛠️ Usuário no contexto:', context.req.user); // Verificar se o usuário está correto
    if (!context.req.user) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
    return context.req.user;
  }

  @Mutation(() => String)
  async forgotPassword(
    @Args('input') input: ForgotPasswordInput,
  ): Promise<string> {
    return this.authService.forgotPassword(input.email);
  }

  @Mutation(() => String)
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<string> {
    return this.authService.resetPassword(input.token, input.newPassword);
  }
}
