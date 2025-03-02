import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeckModule } from 'src/deck/deck.module';

import {
  PrivateQuizSchema,
  PrivateQuiz,
  Quiz,
  QuizSchema,
  UserQuizResponse,
  UserQuizResponseSchema,
} from './entities/quiz.entity';
import { QuizResolver } from './quiz.resolver';
import { QuizService } from './quiz.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: UserQuizResponse.name, schema: UserQuizResponseSchema },
      { name: PrivateQuiz.name, schema: PrivateQuizSchema },
    ]),
    DeckModule,
  ],
  providers: [QuizService, QuizResolver],
  exports: [QuizService, QuizResolver],
})
export class QuizModule {}
