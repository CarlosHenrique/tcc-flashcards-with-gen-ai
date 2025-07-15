import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/gql.auth.guard';
import {
  CreateQuizInput,
  CreateUserQuizResponseInput,
  PrivateQuiz,
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

  @Query(() => [PrivateQuiz])
  async getAllQuizzesFromUser(
    @Args({ name: 'id', type: () => String }) id: string,
  ): Promise<PrivateQuiz[]> {
    return this.quizService.findAllQuizzesFromUser(id);
  }

  @Query(() => Quiz)
  async getQuizByDeckAssociatedId(
    @Args({ name: 'id', type: () => String }) id: string,
  ): Promise<Quiz> {
    return this.quizService.findQuizByDeckAssociatedId(id);
  }

  @Mutation(() => UserQuizResponse)
  async createUserQuizResponse(
    @Args({ name: 'input', type: () => CreateUserQuizResponseInput })
    data: CreateUserQuizResponseInput,
  ): Promise<UserQuizResponse> {
    return this.quizService.calculateAndSaveQuizResponse(data);
  }

  @Query(() => PrivateQuiz, { nullable: true })
  async getQuizFromUser(
    @Args('userId', { type: () => String }) userId: string,
    @Args('deckId', { type: () => String }) deckId: string,
  ): Promise<PrivateQuiz | null> {
    return this.quizService.findQuizFromUser(userId, deckId);
  }
}
