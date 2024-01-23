import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizResolver } from './quiz.resolver';
import { Quiz, QuizSchema } from './entities/quiz.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenAiModule } from 'src/openai/openai.module';
import { DeckModule } from 'src/deck/deck.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
    OpenAiModule,
  ],
  providers: [QuizService, QuizResolver],
})
export class QuizModule {}
