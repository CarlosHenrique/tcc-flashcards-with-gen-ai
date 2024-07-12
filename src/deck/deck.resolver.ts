import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { DeckService } from './deck.service';
import { UseGuards } from '@nestjs/common/decorators';
import {
  Deck,
  CreateUserDeckResponseInput,
  UserDeckResponse,
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
}
