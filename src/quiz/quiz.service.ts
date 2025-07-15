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
  async findQuizFromUser(
    userId: string,
    deckId: string,
  ): Promise<PrivateQuiz | null> {
    const quiz = await this.privateQuizModel
      .findOne({ ownerId: userId, deckAssociatedId: deckId })
      .exec();
    if (!quiz) {
      this.logger.warn(
        `No quiz found for user ID: ${userId} and deck ID: ${deckId}`,
      );
      return null;
    }
    this.logger.log(`Found quiz for user ID: ${userId} and deck ID: ${deckId}`);
    return quiz.toObject<PrivateQuiz>();
  }

  async deleteQuiz(quizId: string): Promise<void> {
    await this.quizModel.findOneAndDelete({ id: quizId }).exec();
    this.logger.log(`Deleted quiz with ID: ${quizId}`);
  }
  async calculateAndSaveQuizResponse(
    data: CreateUserQuizResponseInput,
  ): Promise<UserQuizResponse> {
    const { userId, quizId, score } = data;
    const newScore = Number(score); // 🔹 Garante que `score` é um número

    console.log(
      `✅ [calculateAndSaveQuizResponse] Iniciando processamento para UserID: ${userId}, QuizID: ${quizId}, Score: ${newScore}`,
    );

    // 🔹 1. Buscar o `privateQuiz`
    const privateQuiz = await this.privateQuizModel.findOne({
      id: quizId,
      ownerId: userId,
    });

    if (!privateQuiz) {
      console.error(
        `❌ [calculateAndSaveQuizResponse] Private quiz não encontrado para ID: ${quizId}`,
      );
      throw new Error('Private quiz not found.');
    }

    console.log(
      `🎯 [calculateAndSaveQuizResponse] Quiz encontrado: ${privateQuiz.title}, Score Atual: ${privateQuiz.score}, Novo Score: ${newScore}`,
    );

    // 🔹 2. Criar o objeto de atualização
    const updateFields: Partial<{ score: number; lastAccessed: Date }> = {
      lastAccessed: new Date(), // Sempre atualiza `lastAccessed`
    };

    // Aqui mantemos a lógica de 'melhor pontuação' para o histórico do jogador,
    // mas o desbloqueio não dependerá mais disso.
    if (newScore > privateQuiz.score) {
      updateFields.score = newScore; // Atualiza `score` apenas se for maior
    }

    // 🔹 3. Atualizar o `privateQuiz`
    await this.privateQuizModel.findOneAndUpdate(
      { id: quizId, ownerId: userId },
      { $set: updateFields },
      { new: true },
    );

    // 🔹 REMOÇÃO DA TRAVA: Desbloquear o próximo quiz independentemente da pontuação.
    // A próxima fase será desbloqueada assim que o quiz atual for completado e a pontuação registrada.
    console.log(
      `🔓 [calculateAndSaveQuizResponse] Tentando desbloquear próximo quiz (independente da pontuação)...`,
    );

    const currentPhaseNumber = this.getPhaseOrder(privateQuiz.title);
    console.log(
      `🔍 [calculateAndAndSaveQuizResponse] Fase atual identificada: ${currentPhaseNumber}`,
    );

    // 🔹 5. Criar a resposta do usuário para o quiz
    // Isso permanece inalterado, pois é o registro da tentativa para análise.
    const userQuizResponse = await this.userQuizResponseModel.create({
      userId,
      quizId,
      selectedQuestionIds: data.selectedQuestionIds,
      totalQuizTime: data.totalQuizTime,
      score: newScore, // Pegamos o `score` diretamente do frontend
      questionMetrics: data.questionMetrics.map((metric) => ({
        questionId: metric.questionId,
        attempts: metric.attempts,
        correct: metric.correct,
        timeSpent: metric.timeSpent,
        lastAttemptDate: data.date,
      })),
      date: data.date,
    });

    return userQuizResponse.toObject<UserQuizResponse>();
  }

  // 🔹 Função para extrair o número da fase do título
  private getPhaseOrder(title: string): number | null {
    console.log(`📌 [getPhaseOrder] Extraindo fase do título: ${title}`);
    const match = title.match(/Fase (\d+)/);
    return match ? parseInt(match[1], 10) : null;
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

          score: 0, // Default score
          lastAccessed: new Date(), // Set current date as last accessed
        };

        // Save the new quiz to the private collection
        const newPrivateQuiz = new this.privateQuizModel(privateQuizData);
        const savedPrivateQuiz = await newPrivateQuiz.save();
        if (savedPrivateQuiz.id === '6dab54e6-321c-4c5a-b24f-e14f295cb334') {
          this.logger.debug('savedPrivateQuiz -->', savedPrivateQuiz);
        }

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
