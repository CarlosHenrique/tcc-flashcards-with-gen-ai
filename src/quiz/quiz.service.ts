import { Injectable } from '@nestjs/common';
import { OpenAiService } from 'src/openai/openai.service';
import {
  Quiz,
  QuizDocument,
  OwnerQuizInput,
  CreateQuizInput,
} from './entities/Quiz.entity';
import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { v1 as uuidv1 } from 'uuid';
import { ChatCompletionResponseMessage } from 'openai';
@Injectable()
export class QuizService {
  constructor(
    private readonly openAiService: OpenAiService,
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  formatGptAnswer<T>(completion: ChatCompletionResponseMessage): T {
    let quizObject;
    try {
      quizObject = JSON.parse(completion.content);
    } catch (error) {
      throw new Error('Erro ao avaliar o código JavaScript.');
    }
    console.log(quizObject);
    return quizObject?.Quiz as T;
  }
  async createQuiz(quizQuestions: CreateQuizInput): Promise<Quiz> {
    console.log('SERVICE LEVEL', quizQuestions);
    const rawAnswer = await this.openAiService.getGptAnswer(quizQuestions);

    const quizWithoutId = this.formatGptAnswer<Quiz>(rawAnswer);

    const quiz = {
      ...quizWithoutId,
      owner: quizQuestions.owner,
      deckAssociatedId: quizQuestions.deckAssociatedId,
      id: uuidv4(),
    };
    console.log(quiz);
    const created = await this.quizModel.create(quiz);
    return created.toObject<Quiz>();
  }

  async findQuizzesByEmail(data: OwnerQuizInput): Promise<Quiz[]> {
    const found = await this.quizModel.find(data);
    const quizzes = found.map((Quiz) => Quiz.toObject<Quiz>());

    return quizzes;
  }

  async findQuizById(id: string): Promise<Quiz> {
    const found = await this.quizModel.findOne({ id });

    return found.toObject<Quiz>();
  }

  async deleteQuizBasedOnId(quizId: string, userUid: string): Promise<void> {
    return await this.quizModel.findOneAndDelete({
      id: quizId,
      owner: userUid,
    });
  }
}
