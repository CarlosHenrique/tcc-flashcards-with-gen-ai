import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/gql.auth.guard';
import {
  CreateQuizInput,
  CreateUserQuizResponseInput,
  Quiz,
  UserQuizResponse,
} from './entities/quiz.entity';
import { QuizService } from './quiz.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Quiz)
export class QuizResolver {
  constructor(private readonly quizService: QuizService) {}

  @Query(() => [Quiz])
  async getAllQuizzes(): Promise<Quiz[]> {
    return this.quizService.findAllQuizzes();
  }

  @Query(() => Quiz)
  async getQuizById(
    @Args({ name: 'id', type: () => String }) id: string,
  ): Promise<Quiz> {
    return this.quizService.findQuizById(id);
  }

  @Mutation(() => Quiz)
  async createQuiz(
    @Args({ name: 'input', type: () => CreateQuizInput }) data: CreateQuizInput,
  ): Promise<Quiz> {
    return this.quizService.createQuiz(data);
  }

  @Mutation(() => UserQuizResponse)
  async createUserQuizResponse(
    @Args({ name: 'input', type: () => CreateUserQuizResponseInput })
    data: CreateUserQuizResponseInput,
  ): Promise<UserQuizResponse> {
    return this.quizService.createUserQuizResponse(data);
  }

  @Query(() => [UserQuizResponse])
  async getUserQuizResponses(
    @Args({ name: 'userId', type: () => String }) userId: string,
  ): Promise<UserQuizResponse[]> {
    return this.quizService.findUserQuizResponses(userId);
  }
}
