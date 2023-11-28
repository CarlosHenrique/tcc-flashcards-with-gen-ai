import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User, CreateUserInput } from './entities/user.entity';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/gql.auth.guard';
import { UseGuards } from '@nestjs/common';
import { BoardQuestionInput } from 'src/openai/entities/openai.entity';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  @UseGuards(JwtAuthGuard)
  async getUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }
}
