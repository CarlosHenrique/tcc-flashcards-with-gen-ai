import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardResolver } from './board.resolver';
import { Board, BoardSchema } from './entities/board.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenAiModule } from 'src/openai/openai.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
    OpenAiModule,
  ],
  providers: [BoardService, BoardResolver],
})
export class BoardModule {}
