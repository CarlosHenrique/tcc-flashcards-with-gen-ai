import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { OpenAiService } from 'src/openai/openai.service';
import { OwnerQuizInput, Quiz, QuizDocument } from './entities/Quiz.entity';

import { InjectModel } from '@nestjs/mongoose';
import { ChatCompletionResponseMessage } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { DeckService } from './../deck/deck.service';
@Injectable()
export class QuizService {
  constructor(
    private readonly openAiService: OpenAiService,
    private readonly deckService: DeckService,
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  formatGptAnswer(completion: ChatCompletionResponseMessage) {
    let quizObject;
    try {
      quizObject = JSON.parse(completion.content);
    } catch (error) {
      throw new Error('Erro ao avaliar o código JavaScript.');
    }
    console.log(quizObject);
    return quizObject;
  }

  async createQuiz(deckId: string): Promise<Quiz> {
    const { cards, owner } = await this.deckService.findDeckById(deckId);
    const gptInput = {
      deckAssociatedId: deckId,
      cards,
      owner,
    };
    const question = gptInput.cards.map((card) => {
      question: card.question;
      answer: card.answer;
    });
    console.log('SERIALIZED', question);
    console.log('CARDS:', gptInput.cards);
    const rawAnswer = await this.openAiService.getGptAnswer(gptInput);
    console.log(rawAnswer);

    const quizWithoutId = this.formatGptAnswer(rawAnswer);

    const quiz = {
      owner,
      deckAssociatedId: deckId,
      id: uuidv4(),
      ...quizWithoutId,
    };
    console.log('QUIZZ', quiz);
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
