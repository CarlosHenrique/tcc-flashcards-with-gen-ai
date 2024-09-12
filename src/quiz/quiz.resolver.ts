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
  async getQuizById(
    @Args({ name: 'id', type: () => String }) id: string,
  ): Promise<Quiz> {
    return this.quizService.findQuizById(id);
  }

  @Query(() => Quiz)
  async getQuizByDeckAssociatedId(
    @Args({ name: 'id', type: () => String }) id: string,
  ): Promise<Quiz> {
    const quiz = await this.quizService.findQuizByDeckAssociatedId(id);
    if (!quiz) {
      throw new NotFoundException(`Quiz with deckAssociatedId ${id} not found`);
    }

    quiz.questions.forEach((question) => {
      if (!question.answer) {
        question.answer = question.type === 'multiple_choice' ? [] : '';
      }
    });
    console.log('AFTER CHANGE', quiz);
    return quiz;
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

  @Query(() => UserQuizResponse, { nullable: true })
  async getLastUserQuizResponse(
    @Args({ name: 'userId', type: () => String }) userId: string,
    @Args({ name: 'quizId', type: () => String }) quizId: string,
  ): Promise<UserQuizResponse | null> {
    return this.quizService.findLastUserQuizResponse(userId, quizId);
  }
}
