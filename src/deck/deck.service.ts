import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { OpenAiService } from 'src/openai/openai.service';
import {
  CreateDeckInput,
  Deck,
  DeckDocument,
  OwnerDeckInput,
} from './entities/deck.entity';

import { InjectModel } from '@nestjs/mongoose';
import { ChatCompletionResponseMessage } from 'openai';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class DeckService {
  constructor(
    private readonly openAiService: OpenAiService,
    @InjectModel(Deck.name)
    private readonly deckModel: Model<DeckDocument>,
  ) {}

  formatGptAnswer<T>(completion: ChatCompletionResponseMessage): T {
    let deckObject;
    try {
      deckObject = JSON.parse(completion.content);
    } catch (error) {
      throw new Error('Erro ao avaliar o código JavaScript.');
    }

    return deckObject?.deck as T;
  }
  async createDeck(deckQuestions: CreateDeckInput): Promise<Deck> {
    console.log('SERVICE LEVEL', deckQuestions);
    const rawAnswer = await this.openAiService.getGptAnswer(deckQuestions);
    console.log(rawAnswer);
    const deckWithoutId = this.formatGptAnswer<Deck>(rawAnswer);

    const deck = {
      ...deckWithoutId,
      owner: 'chps',
      id: uuidv4(),
    };
    console.log(deck);
    const created = await this.deckModel.create(deck);
    return created.toObject<Deck>();
  }

  async findDecksByEmail(data: OwnerDeckInput): Promise<Deck[]> {
    const found = await this.deckModel.find(data);
    const decks = found.map((deck) => deck.toObject<Deck>());

    return decks;
  }

  async findDeckById(id: string): Promise<Deck> {
    const found = await this.deckModel.findOne({ id });

    return found.toObject<Deck>();
  }

  async deleteDeckBasedOnId(deckId: string, userUid: string): Promise<void> {
    return await this.deckModel.findOneAndDelete({
      id: deckId,
      owner: userUid,
    });
  }
}
