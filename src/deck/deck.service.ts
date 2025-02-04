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
    const { userId, deckId, score: newScore } = responseInput;

    // Buscar o deck privado do usuário
    const privateDeck = await this.privateDeckModel.findOne({
      id: deckId,
      ownerId: userId,
    });

    if (!privateDeck) {
      throw new Error('Private deck not found.');
    }

    // Atualizar a pontuação apenas se for maior que a anterior
    if (newScore > privateDeck.score) {
      await this.privateDeckModel.findOneAndUpdate(
        { id: deckId, ownerId: userId },
        { $set: { score: newScore } },
        { new: true },
      );
    }

    // 🔹 Se a pontuação for >= 70, desbloquear o próximo deck
    if (newScore >= 70) {
      const currentPhaseNumber = this.getPhaseOrder(privateDeck.title);
      console.log('current phase:', currentPhaseNumber);
      if (currentPhaseNumber !== null) {
        // Buscar o próximo deck baseado no título
        const nextDeck = await this.privateDeckModel.findOne({
          ownerId: userId,
          title: {
            $regex: new RegExp(`^Fase ${currentPhaseNumber + 1}:`, 'i'),
          },
        });

        const nextDeckDocument = nextDeck.toObject<PrivateDeck>();
        console.log(`Fase ${currentPhaseNumber + 1}:`);
        console.log('next deck: ', nextDeckDocument);
        if (nextDeckDocument && nextDeckDocument.isLocked) {
          // Desbloquear o próximo deck
          await this.privateDeckModel.findOneAndUpdate(
            { id: nextDeck.id, ownerId: userId },
            { $set: { isLocked: false } },
            { new: true },
          );

          console.log(
            `Deck "${nextDeck.title}" desbloqueado para o usuário ${userId}`,
          );
        }
      }
    }

    // Criar a resposta do usuário
    const created = await this.userDeckResponseModel.create(responseInput);
    return created.toObject<UserDeckResponse>();
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

  // async updateCardMetricsInDeckResponse(
  //   userId: string,
  //   deckId: string,
  //   cardId: string,
  //   correct: boolean,
  // ): Promise<void> {
  //   const userDeckResponse = await this.userDeckResponseModel.findOne({
  //     userId,
  //     deckId,
  //   });

  //   if (!userDeckResponse) {
  //     throw new Error('UserDeckResponse not found');
  //   }

  //   const cardMetrics = userDeckResponse.cardMetrics.find(
  //     (metric) => metric.cardId.toString() === cardId,
  //   );

  //   if (!cardMetrics) {
  //     throw new Error('Card metrics not found');
  //   }

  //   const currentDate = new Date();

  //   // Atualizar métricas baseado no acerto ou erro
  //   if (correct) {
  //     cardMetrics.easiness = Math.min(cardMetrics.easiness + 0.1, 3.0);
  //     cardMetrics.interval *= cardMetrics.easiness;
  //   } else {
  //     cardMetrics.easiness = Math.max(1.3, cardMetrics.easiness - 0.2);
  //     cardMetrics.interval = 1;
  //   }

  //   cardMetrics.repetitions += 1;
  //   cardMetrics.lastReviewedDate = currentDate;
  //   cardMetrics.nextReviewDate = new Date(
  //     currentDate.getTime() + cardMetrics.interval * 24 * 60 * 60 * 1000,
  //   );

  //   // Salvar alterações
  //   await userDeckResponse.save();
  // }

  async generateReviewQueueFromDeck(
    userId: string,
    deckId: string,
  ): Promise<Card[]> {
    // Buscar o PrivateDeck pelo userId e deckId
    const privateDeck = await this.privateDeckModel.findOne({
      id: deckId,
      ownerId: userId,
    });

    if (!privateDeck) {
      throw new Error('PrivateDeck not found');
    }

    const { cards } = privateDeck;

    // Simular métricas de prioridade (nextReviewDate e afins devem ser simulados no card)
    const now = new Date();
    const highPriorityCards = cards.filter((card) => {
      const cardMetrics = card['metrics'] || {}; // Substituir por métricas reais se existirem
      return cardMetrics.nextReviewDate <= now || cardMetrics.recentlyFailed;
    });

    // Misturar alta prioridade com cartões aleatórios de baixa prioridade
    const lowPriorityCards = cards.filter(
      (card) => !highPriorityCards.includes(card),
    );

    // Combinar e retornar a fila
    return [...highPriorityCards, ...shuffle(lowPriorityCards)];
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
