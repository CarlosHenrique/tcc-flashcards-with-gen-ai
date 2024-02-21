import { Module } from '@nestjs/common';
import { DeckService } from './deck.service';
import { DeckResolver } from './deck.resolver';
import { Deck, DeckSchema } from './entities/deck.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenAiModule } from 'src/openai/openai.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Deck.name, schema: DeckSchema }]),
    OpenAiModule,
  ],
  providers: [DeckService, DeckResolver],
  exports: [DeckService, DeckResolver],
})
export class DeckModule {}
