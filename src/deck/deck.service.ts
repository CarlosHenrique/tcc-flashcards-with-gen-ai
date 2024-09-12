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
} from './entities/deck.entity';

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
    const created = await this.userDeckResponseModel.create(responseInput);
    return created.toObject<UserDeckResponse>();
  }

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
}
