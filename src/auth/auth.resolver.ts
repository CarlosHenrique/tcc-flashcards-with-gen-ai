/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Args, Resolver, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponse, LoginUserInput } from './entities/auth.entity';
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
}
