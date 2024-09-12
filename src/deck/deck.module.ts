import { Module } from '@nestjs/common';
import { DeckService } from './deck.service';
import { DeckResolver } from './deck.resolver';
import {
  Deck,
  DeckSchema,
  PrivateDeck,
  PrivateDeckSchema,
  UserDeckResponse,
  UserDeckResponseSchema,
} from './entities/deck.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Deck.name, schema: DeckSchema },
      { name: UserDeckResponse.name, schema: UserDeckResponseSchema },
      { name: PrivateDeck.name, schema: PrivateDeckSchema },
    ]),
  ],
  providers: [DeckService, DeckResolver],
  exports: [DeckService, DeckResolver],
})
export class DeckModule {}
