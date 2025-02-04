import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { DeckService } from './deck.service';
import { UseGuards } from '@nestjs/common/decorators';
import {
  Deck,
  CreateUserDeckResponseInput,
  UserDeckResponse,
  Card,
  PrivateDeck,
} from './entities/deck.entity';
import { JwtAuthGuard } from 'src/auth/gql.auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Deck)
export class DeckResolver {
  constructor(private readonly deckService: DeckService) {}

  @Query(() => [Deck])
  async getAllDecks(): Promise<Deck[]> {
    return this.deckService.findAllDecks();
  }

  @Query(() => Deck)
  async getDeckById(
    @Args({ name: 'input', type: () => String })
    id: string,
  ): Promise<Deck> {
    return this.deckService.findDeckById(id);
  }

  @Mutation(() => UserDeckResponse)
  async createUserDeckResponse(
    @Args({ name: 'input', type: () => CreateUserDeckResponseInput })
    data: CreateUserDeckResponseInput,
  ): Promise<UserDeckResponse> {
    return this.deckService.createUserDeckResponse(data);
  }

  @Query(() => [UserDeckResponse])
  async getUserDeckResponses(
    @Args({ name: 'userId', type: () => String }) userId: string,
  ): Promise<UserDeckResponse[]> {
    return this.deckService.findUserDeckResponses(userId);
  }
  // @Mutation(() => Boolean)
  // async updateCardMetrics(
  //   @Args('userId') userId: string,
  //   @Args('deckId') deckId: string,
  //   @Args('cardId') cardId: string,
  //   @Args('correct') correct: boolean,
  // ): Promise<boolean> {
  //   await this.deckService.updateCardMetricsInDeckResponse(
  //     userId,
  //     deckId,
  //     cardId,
  //     correct,
  //   );
  //   return true;
  // }

  @Query(() => [Card])
  async generateReviewQueue(
    @Args('userId') userId: string,
    @Args('deckId') deckId: string,
  ): Promise<Card[]> {
    return this.deckService.generateReviewQueueFromDeck(userId, deckId);
  }

  @Query(() => [PrivateDeck])
  async getAllDecksFromUser(
    @Args({ name: 'id', type: () => String }) id: string,
  ): Promise<PrivateDeck[]> {
    return this.deckService.findAllDecksFromUser(id);
  }
}
