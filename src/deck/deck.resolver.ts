import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { DeckService } from './deck.service';
import { UseGuards } from '@nestjs/common/decorators';
import {
  Deck,
  DeleteDeckError,
  DeleteDeckInput,
  DeleteDeckResult,
  DeleteDeckSuccess,
  OwnerDeckInput,
  CreateDeckInput,
} from './entities/deck.entity';

import { JwtAuthGuard } from 'src/auth/gql.auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Deck)
export class DeckResolver {
  constructor(private readonly deckService: DeckService) {}

  @Query(() => [Deck])
  async getAllDecksFromUser(
    @Args({ name: 'input', type: () => OwnerDeckInput })
    data: OwnerDeckInput,
  ): Promise<Deck[]> {
    return this.deckService.findDecksByEmail(data);
  }

  @Query(() => Deck)
  async getDeckById(
    @Args({ name: 'input', type: () => String })
    id: string,
  ): Promise<Deck> {
    return this.deckService.findDeckById(id);
  }

  @Mutation(() => Deck)
  async createDeck(
    @Args({ name: 'input', type: () => CreateDeckInput })
    data: CreateDeckInput,
  ): Promise<Deck> {
    return this.deckService.createDeck(data);
  }

  @Mutation(() => DeleteDeckResult)
  async DeleteDeckBasedOnId(
    @Args({ name: 'input', type: () => DeleteDeckInput })
    data: DeleteDeckInput,
  ): Promise<typeof DeleteDeckResult> {
    try {
      await this.deckService.deleteDeckBasedOnId(data.deckId, data.userId);
      return Object.assign(new DeleteDeckSuccess(), {});
    } catch (error) {
      const message = error;
      return Object.assign(new DeleteDeckError(), { message });
    }
  }
}
