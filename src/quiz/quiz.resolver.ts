import { UseGuards } from '@nestjs/common';
import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/gql.auth.guard';
import {
  Quiz,
  OwnerQuizInput,
  CreateQuizInput,
  DeleteQuizResult,
  DeleteQuizInput,
  DeleteQuizSuccess,
  DeleteQuizError,
} from './entities/Quiz.entity';
import { QuizService } from './quiz.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Quiz)
export class QuizResolver {
  constructor(private readonly quizService: QuizService) {}

  @Query(() => [Quiz])
  async getAllQuizzesFromUser(
    @Args({ name: 'input', type: () => OwnerQuizInput })
    data: OwnerQuizInput,
  ): Promise<Quiz[]> {
    return this.quizService.findQuizzesByEmail(data);
  }

  @Query(() => Quiz)
  async getQuizById(
    @Args({ name: 'input', type: () => String })
    id: string,
  ): Promise<Quiz> {
    return this.quizService.findQuizById(id);
  }

  @Mutation(() => Quiz)
  async createQuiz(
    @Args({ name: 'input', type: () => CreateQuizInput })
    data: CreateQuizInput,
  ): Promise<Quiz> {
    return this.quizService.createQuiz(data);
  }

  @Mutation(() => DeleteQuizResult)
  async DeleteQuizBasedOnId(
    @Args({ name: 'input', type: () => DeleteQuizInput })
    data: DeleteQuizInput,
  ): Promise<typeof DeleteQuizResult> {
    try {
      await this.quizService.deleteQuizBasedOnId(data.quizId, data.userId);
      return Object.assign(new DeleteQuizSuccess(), {});
    } catch (error) {
      const message = error;
      return Object.assign(new DeleteQuizError(), { message });
    }
  }
}
