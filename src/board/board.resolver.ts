import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { BoardService } from './board.service';
import { UseGuards } from '@nestjs/common/decorators';
import {
  Board,
  DeleteBoardError,
  DeleteBoardInput,
  DeleteBoardResult,
  DeleteBoardSuccess,
  DeleteTaskOnBoardError,
  DeleteTaskOnBoardInput,
  DeleteTaskOnBoardResult,
  DeleteTaskOnBoardSuccess,
  OwnerBoardInput,
  SplitTaskInput,
  UpdateTaskOnBoardInput,
} from './entities/board.entity';
import { BoardQuestionInput } from 'src/openai/entities/openai.entity';
import { JwtAuthGuard } from 'src/auth/gql.auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Board)
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @Query(() => [Board])
  async getAllBoardsFromUser(
    @Args({ name: 'input', type: () => OwnerBoardInput })
    data: OwnerBoardInput,
  ): Promise<Board[]> {
    return this.boardService.findBoardsByEmail(data);
  }

  @Query(() => Board)
  async getBoardById(
    @Args({ name: 'input', type: () => String })
    id: string,
  ): Promise<Board> {
    return this.boardService.findBoardById(id);
  }

  @Mutation(() => Board)
  async createBoard(
    @Args({ name: 'input', type: () => BoardQuestionInput })
    data: BoardQuestionInput,
  ): Promise<Board> {
    return this.boardService.createBoard(data);
  }

  @Mutation(() => Board)
  async updateTaskFieldsBasedOnBoardId(
    @Args({ name: 'input', type: () => UpdateTaskOnBoardInput })
    data: UpdateTaskOnBoardInput,
  ): Promise<Board> {
    return this.boardService.updateTaskFieldsBasedOnBoardId(data);
  }

  @Mutation(() => DeleteBoardResult)
  async deleteBoardBasedOnId(
    @Args({ name: 'input', type: () => DeleteBoardInput })
    data: DeleteBoardInput,
  ): Promise<typeof DeleteBoardResult> {
    try {
      await this.boardService.deleteBoardBasedOnId(data.boardId, data.userId);
      return Object.assign(new DeleteBoardSuccess(), {});
    } catch (error) {
      const message = error;
      return Object.assign(new DeleteBoardError(), { message });
    }
  }

  @Mutation(() => DeleteTaskOnBoardResult)
  async deleteTaskBasedOnBoardId(
    @Args({ name: 'input', type: () => DeleteTaskOnBoardInput })
    data: DeleteTaskOnBoardInput,
  ): Promise<typeof DeleteTaskOnBoardResult> {
    try {
      await this.boardService.deleteTaskBasedOnBoardId(
        data.boardId,
        data.taskId,
        data.userId,
      );
      return Object.assign(new DeleteTaskOnBoardSuccess(), {});
    } catch (error) {
      const message = error;
      return Object.assign(new DeleteTaskOnBoardError(), { message });
    }
  }

  @Mutation(() => Board)
  async splitTaskBasedOnBoardId(
    @Args({ name: 'input', type: () => SplitTaskInput })
    data: SplitTaskInput,
  ): Promise<Board> {
    return this.boardService.splitTaskOnBoard(data);
  }
}
