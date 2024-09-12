import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateQuizInput,
  CreateUserQuizResponseInput,
  PrivateQuiz,
  PrivateQuizDocument,
  Quiz,
  QuizDocument,
  UserQuizResponse,
  UserQuizResponseDocument,
} from './entities/quiz.entity';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
    @InjectModel(UserQuizResponse.name)
    private readonly userQuizResponseModel: Model<UserQuizResponseDocument>,
    @InjectModel(PrivateQuiz.name)
    private readonly privateQuizModel: Model<PrivateQuizDocument>,
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

  async findAllQuizzesFromUser(id: string): Promise<PrivateQuiz[]> {
    const found = await this.privateQuizModel
      .find({
        ownerId: id,
      })
      .exec();
    this.logger.log(`Found ${found.length} quizzes for user ${id}`);
    return found.map((quiz) => quiz.toObject<PrivateQuiz>());
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

  async createQuizCopyForUser(userId: string): Promise<PrivateQuiz[]> {
    const foundQuizzes = await this.quizModel.find().exec();
    this.logger.log(`Found ${foundQuizzes.length} quizzes`);

    const createdQuizzes: PrivateQuiz[] = await Promise.all(
      foundQuizzes.map(async (quiz) => {
        const { _id, ...quizData } = quiz.toObject<Quiz>(); // Clone and remove _id

        // Create a new private quiz object for the user
        const privateQuizData = {
          id: quizData.id, // Copy Quiz ID
          title: quizData.title, // Copy Quiz Title
          description: quizData.description, // Copy Quiz Description
          deckAssociatedId: quizData.deckAssociatedId, // Copy Deck ID
          questions: [...quizData.questions], // Deep copy questions array
          ownerId: userId, // Set userId as owner
          isLocked: quizData.id !== '6dab54e6-321c-4c5a-b24f-e14f295cb334', // Conditional lock
          score: 0, // Default score
          lastAccessed: new Date(), // Set current date as last accessed
        };

        // Save the new quiz to the private collection
        const newPrivateQuiz = new this.privateQuizModel(privateQuizData);
        const savedPrivateQuiz = await newPrivateQuiz.save();

        this.logger.debug('PrivateQuiz -->', privateQuizData);

        this.logger.debug('newPrivateQuiz -->', newPrivateQuiz);

        this.logger.debug('savedPrivateQuiz -->', savedPrivateQuiz);
        return savedPrivateQuiz;
      }),
    );

    this.logger.log(
      `Created ${createdQuizzes.length} quizzes for user ${userId}`,
    );
    return createdQuizzes;
  }

  async findLastUserQuizResponse(
    userId: string,
    quizId: string,
  ): Promise<UserQuizResponse | null> {
    const { id } = await this.quizModel
      .findOne({ deckAssociatedId: quizId })
      .exec();
    const found = await this.userQuizResponseModel
      .find({ userId, quizId: id })
      .sort({ date: -1 }) // Ordena por data (mais recente primeiro)
      .limit(1)
      .exec(); // Limita a 1 documento (o mais recente)
    if (found.length > 0) {
      this.logger.log(
        `Found last quiz response for user ID: ${userId} and quiz ID: ${id}`,
      );
      return found[0].toObject<UserQuizResponse>();
    } else {
      this.logger.warn(
        `No quiz responses found for user ID: ${userId} and quiz ID: ${id}`,
      );
      return null;
    }
  }
}
