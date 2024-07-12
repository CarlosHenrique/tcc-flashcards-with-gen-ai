import { Injectable } from '@nestjs/common';
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
} from './entities/deck.entity';

@Injectable()
export class DeckService {
  constructor(
    @InjectModel(Deck.name)
    private readonly deckModel: Model<DeckDocument>,
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

  async findUserDeckResponses(userId: string): Promise<UserDeckResponse[]> {
    const found = await this.userDeckResponseModel.find({ userId }).exec();
    return found.map((response) => response.toObject<UserDeckResponse>());
  }
}
