import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateQuizInput,
  CreateUserQuizResponseInput,
  Quiz,
  QuizDocument,
  UserQuizResponse,
  UserQuizResponseDocument,
} from './entities/quiz.entity';
import { DeckService } from './../deck/deck.service';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
    @InjectModel(UserQuizResponse.name)
    private readonly userQuizResponseModel: Model<UserQuizResponseDocument>,
    private readonly deckService: DeckService,
  ) {}

  async createQuiz(data: CreateQuizInput): Promise<Quiz> {
    const { deckAssociatedId, title, description, questions } = data;
    const quiz = {
      id: uuidv4(),
      deckAssociatedId,
      title,
      description,
      questions,
    };
    const created = await this.quizModel.create(quiz);
    return created.toObject<Quiz>();
  }

  async findAllQuizzes(): Promise<Quiz[]> {
    const found = await this.quizModel.find().exec();
    return found.map((quiz) => quiz.toObject<Quiz>());
  }

  async findQuizById(id: string): Promise<Quiz> {
    const found = await this.quizModel.findOne({ id }).exec();
    return found.toObject<Quiz>();
  }

  async deleteQuiz(quizId: string): Promise<void> {
    await this.quizModel.findOneAndDelete({ id: quizId }).exec();
  }

  async createUserQuizResponse(
    data: CreateUserQuizResponseInput,
  ): Promise<UserQuizResponse> {
    const created = await this.userQuizResponseModel.create(data);
    return created.toObject<UserQuizResponse>();
  }

  async findUserQuizResponses(userId: string): Promise<UserQuizResponse[]> {
    const found = await this.userQuizResponseModel.find({ userId }).exec();
    return found.map((response) => response.toObject<UserQuizResponse>());
  }
}
