import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateDeckInput,
  Deck,
  DeckDocument,
  CreateUserDeckResponseInput,
  UserDeckResponse,
  UserDeckResponseDocument,
  PrivateDeck,
  PrivateDeckDocument,
  Card,
  UserCardMetrics,
} from './entities/deck.entity';
import { shuffle } from 'lodash';

@Injectable()
export class DeckService {
  private readonly logger = new Logger(DeckService.name);
  constructor(
    @InjectModel(Deck.name)
    private readonly deckModel: Model<DeckDocument>,
    @InjectModel(PrivateDeck.name)
    private readonly privateDeckModel: Model<PrivateDeckDocument>,
    @InjectModel(UserDeckResponse.name)
    private readonly userDeckResponseModel: Model<UserDeckResponseDocument>,
  ) {}

  async createDeck(deckInput: CreateDeckInput): Promise<Deck> {
    const deck = {
      ...deckInput,
      id: uuidv4(),
    };
    const created = await this.deckModel.create(deck);
    return created.toObject<Deck>();
  }

  async findAllDecks(): Promise<Deck[]> {
    const found = await this.deckModel.find().exec();

    return found.map((deck) => deck.toObject<Deck>());
  }

  async findDeckById(id: string): Promise<Deck> {
    const found = await this.deckModel.findOne({ id }).exec();

    return found.toObject<Deck>();
  }

  async createUserDeckResponse(
    responseInput: CreateUserDeckResponseInput,
  ): Promise<UserDeckResponse> {
    const { userId, deckId, totalSessionScore, cardMetrics } = responseInput;

    const privateDeck = await this.privateDeckModel.findOne({
      id: deckId,
      ownerId: userId,
    });

    if (!privateDeck) {
      throw new Error('Private deck not found.');
    }

    // Atualizar score se for maior
    if (totalSessionScore > privateDeck.score) {
      await this.privateDeckModel.findOneAndUpdate(
        { id: deckId, ownerId: userId },
        { $set: { score: totalSessionScore } },
        { new: true },
      );
    }

    // Desbloqueio de próxima fase

    const currentPhaseNumber = this.getPhaseOrder(privateDeck.title);
    this.logger.log(`Current phase: ${currentPhaseNumber}`);
    if (currentPhaseNumber !== null) {
      const nextDeck = await this.privateDeckModel.findOne({
        ownerId: userId,
        title: {
          $regex: new RegExp(`^Fase ${currentPhaseNumber + 1}:`, 'i'),
        },
      });

      if (nextDeck && nextDeck.isLocked) {
        await this.privateDeckModel.findOneAndUpdate(
          { id: nextDeck.id, ownerId: userId },
          { $set: { isLocked: false } },
          { new: true },
        );
        this.logger.log(
          `Deck "${nextDeck.title}" desbloqueado para o usuário ${userId}`,
        );
      }
    }

    // --- Algoritmo SM-2 adaptado para revisão rápida (em horas) ---
    const updatedCardMetrics: UserCardMetrics[] = [];

    for (const metric of cardMetrics) {
      const previousMetricsRecord = await this.userDeckResponseModel
        .findOne({
          userId,
          'cardMetrics.cardId': metric.cardId,
        })
        .sort({ date: -1 })
        .select('cardMetrics')
        .exec();

      let previousCardMetric: UserCardMetrics | undefined;
      if (previousMetricsRecord) {
        previousCardMetric = previousMetricsRecord.cardMetrics.find(
          (m) => m.cardId === metric.cardId,
        );
      }

      const currentAttempts = (previousCardMetric?.attempts || 0) + 1;
      let currentEaseFactor = previousCardMetric?.easeFactor || 2.5;
      const quality = metric.reviewQuality;

      // 1. Atualizar o Ease Factor (EF)
      currentEaseFactor =
        currentEaseFactor +
        (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (currentEaseFactor < 1.3) {
        currentEaseFactor = 1.3;
      }

      // 2. Intervalo em HORAS (engajamento rápido)
      let intervalHours: number;

      if (quality < 3) {
        // currentAttempts = 1; // LINHA COMENTADA PARA NÃO RESETAR SEMPRE PARA 1
        intervalHours = 4;
      } else {
        if (currentAttempts === 1) {
          intervalHours = 6;
        } else if (currentAttempts === 2) {
          intervalHours = 12;
        } else {
          const baseHours = 12;
          intervalHours = Math.ceil(baseHours * currentEaseFactor);
          if (intervalHours > 24) intervalHours = 24;
        }
      }

      const nextReviewDate = new Date();
      nextReviewDate.setHours(nextReviewDate.getHours() + intervalHours);

      updatedCardMetrics.push({
        cardId: metric.cardId,
        attempts: currentAttempts, // Agora 'attempts' deve refletir o valor correto.
        reviewQuality: quality,
        easeFactor: currentEaseFactor,
        nextReviewDate,
        lastAttempt: new Date(),
      });
    }

    // Atualiza as métricas no request
    responseInput.cardMetrics = updatedCardMetrics;

    // 🧠 Novo: calcular próxima data geral de revisão do deck
    const deckNextReviewDate =
      this.calculateDeckNextReviewDate(updatedCardMetrics);
    await this.privateDeckModel.findOneAndUpdate(
      { id: deckId, ownerId: userId },
      { $set: { nextDeckReviewDate: deckNextReviewDate } },
    );

    const created = await this.userDeckResponseModel.create(responseInput);
    return created.toObject<UserDeckResponse>();
  }

  // 🔧 Função auxiliar
  calculateDeckNextReviewDate(cardMetrics: UserCardMetrics[]): Date {
    if (!cardMetrics || cardMetrics.length === 0) return new Date();
    const sorted = cardMetrics
      .filter((m) => m.nextReviewDate)
      .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime());
    return sorted[0]?.nextReviewDate || new Date();
  }

  // Helper para mapear a pontuação do input para a qualidade de 0-5 para SM-2
  private mapScoreToQuality(score: number): number {
    if (score >= 90) return 5; // Perfeito
    if (score >= 80) return 4; // Fácil
    if (score >= 70) return 3; // Ligeira dificuldade
    if (score >= 50) return 2; // Dificuldade significativa, lembrado com ajuda
    if (score >= 25) return 1; // Errado, mas reconhecido
    return 0; // Blackout total
  }

  // 🔹 Função para extrair o número da fase do título
  getPhaseOrder = (title: string): number | null => {
    const match = title.match(/Fase (\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  async createDecksCopyForUser(userId: string): Promise<PrivateDeck[]> {
    const found = await this.deckModel.find().exec();
    const createdDecks: PrivateDeck[] = await Promise.all(
      found.map(async (deck) => {
        const { _id, ...deckData } = deck.toObject<Deck>(); // Clone and remove _id

        // Create a new private quiz object for the user
        const privateDeckData = {
          ...deckData,
          ownerId: userId, // Set userId as owner
          isLocked: deckData.id !== '55f26759-4143-4afe-99c0-62748834fa67', // Conditional lock
          score: 0, // Default score
          lastAccessed: new Date(), // Set current date as last accessed
        };

        // Save the new quiz to the private collection
        const newDeck = new this.privateDeckModel(privateDeckData);
        const savedPrivateDeck = await newDeck.save();
        if (savedPrivateDeck.id === '5f26759-4143-4afe-99c0-62748834fa67') {
          this.logger.log(savedPrivateDeck);
        }

        return savedPrivateDeck;
      }),
    );
    this.logger.log(`Created ${createdDecks.length} decks for user ${userId}`);
    return createdDecks;
  }

  async findUserDeckResponses(userId: string): Promise<UserDeckResponse[]> {
    const found = await this.userDeckResponseModel.find({ userId }).exec();
    return found.map((response) => response.toObject<UserDeckResponse>());
  }

  async unlockDeck(
    userId: string,
    deckId: string,
  ): Promise<Record<string, string>> {
    // Buscar o deck privado do usuário
    const privateDeck = await this.privateDeckModel.findOne({
      id: deckId,
      ownerId: userId,
    });

    if (!privateDeck) {
      throw new Error('PrivateDeck not found');
    }

    // Atualizar o campo `isLocked`
    privateDeck.isLocked = false;

    // Salvar as alterações no banco
    await privateDeck.save();

    return {
      message: 'Deck liberado com sucesso',
    };
  }

  async findAllDecksFromUser(id: string): Promise<PrivateDeck[]> {
    const found = await this.privateDeckModel
      .find({
        ownerId: id,
      })
      .exec();
    this.logger.log(`Found ${found.length} decks for user ${id}`);
    return found.map((quiz) => quiz.toObject<PrivateDeck>());
  }
}
