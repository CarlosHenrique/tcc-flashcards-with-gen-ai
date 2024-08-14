import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(QuizService.name);

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
    this.logger.log(`Created quiz with ID: ${created.id}`);
    return created.toObject<Quiz>();
  }

  async findAllQuizzes(): Promise<Quiz[]> {
    const found = await this.quizModel.find().exec();
    this.logger.log(`Found ${found.length} quizzes`);
    return found.map((quiz) => quiz.toObject<Quiz>());
  }

  async findQuizById(id: string): Promise<Quiz> {
    const found = await this.quizModel.findOne({ id }).exec();
    if (!found) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    this.logger.log(`Found quiz with ID: ${id}`);
    return found.toObject<Quiz>();
  }

  async findQuizByDeckAssociatedId(id: string): Promise<Quiz> {
    this.logger.log(`Finding quiz with deckAssociatedId: ${id}`);
    const found = await this.quizModel.findOne({ deckAssociatedId: id }).exec();
    if (!found) {
      throw new NotFoundException(`Quiz with deckAssociatedId ${id} not found`);
    }
    this.logger.log(`Found quiz: ${found}`);
    return found.toObject<Quiz>();
  }

  async deleteQuiz(quizId: string): Promise<void> {
    await this.quizModel.findOneAndDelete({ id: quizId }).exec();
    this.logger.log(`Deleted quiz with ID: ${quizId}`);
  }

  async createUserQuizResponse(
    data: CreateUserQuizResponseInput,
  ): Promise<UserQuizResponse> {
    const created = await this.userQuizResponseModel.create(data);
    this.logger.log(`Created user quiz response with ID: ${created.id}`);
    return created.toObject<UserQuizResponse>();
  }

  async findUserQuizResponses(userId: string): Promise<UserQuizResponse[]> {
    const found = await this.userQuizResponseModel.find({ userId }).exec();
    this.logger.log(
      `Found ${found.length} user quiz responses for user ID: ${userId}`,
    );
    return found.map((response) => response.toObject<UserQuizResponse>());
  }
}
