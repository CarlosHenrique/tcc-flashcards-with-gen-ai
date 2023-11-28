import { Injectable } from '@nestjs/common';
import { OpenAiService } from 'src/openai/openai.service';
import {
  Board,
  BoardDocument,
  OwnerBoardInput,
  SplitTaskInput,
  UpdateTaskOnBoardInput,
} from './entities/board.entity';
import { Model } from 'mongoose';
import { BoardQuestionInput } from 'src/openai/entities/openai.entity';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BoardService {
  constructor(
    private readonly openAiService: OpenAiService,
    @InjectModel(Board.name)
    private readonly boardModel: Model<BoardDocument>,
  ) {}

  async createBoard(boardQuestions: BoardQuestionInput): Promise<Board> {
    const tasks = await this.openAiService.getBoardBasedOnQuestions(
      boardQuestions,
    );
    const board: Board = {
      id: uuidv4(),
      tasks,
      title: boardQuestions.projectName,
      description: boardQuestions.description,
      owner: boardQuestions.owner,
    };
    const created = await this.boardModel.create(board);
    return created.toObject<Board>();
  }

  async findBoardsByEmail(data: OwnerBoardInput): Promise<Board[]> {
    const found = await this.boardModel.find(data);
    const boards = found.map((board) => board.toObject<Board>());
    console.log(boards);
    return boards;
  }

  async findBoardById(id: string): Promise<Board> {
    const found = await this.boardModel.findOne({ id });

    return found.toObject<Board>();
  }

  async updateTaskFieldsBasedOnBoardId(
    data: UpdateTaskOnBoardInput,
  ): Promise<Board> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = data.value;
    if (data.field === 'dueDate') value = new Date(value);
    if (data.field === 'storyPoints') value = parseInt(value);
    await this.boardModel.updateOne(
      {
        id: data.boardId,
        'tasks.id': data.taskId,
      },
      {
        $set: { [`tasks.$.${data.field}`]: value },
      },
      { new: true },
    );
    const updatedBoard = await this.boardModel.findOne({ id: data.boardId });
    return updatedBoard.toObject<Board>();
  }

  async deleteBoardBasedOnId(boardId: string, userUid: string): Promise<void> {
    return await this.boardModel.findOneAndDelete({
      id: boardId,
      owner: userUid,
    });
  }

  async deleteTaskBasedOnBoardId(
    boardId: string,
    taskId: string,
    userUid: string,
  ): Promise<void> {
    try {
      const board = await this.boardModel.findOne({
        id: boardId,
        owner: userUid,
      });

      if (!board) {
        throw new Error('Board não encontrado');
      }

      board.tasks = board.tasks.filter((task) => task.id.toString() !== taskId);
      await board.save();
      return;
    } catch (error) {
      throw new Error(`Erro ao deletar a task: ${error.message}`);
    }
  }

  async splitTaskOnBoard(data: SplitTaskInput): Promise<Board> {
    const board = await this.boardModel.findOne({
      id: data.boardId,
      owner: data.userId,
    });
    const numberOfTasks = board.tasks.length;
    const taskToBeSplitted = board.tasks.filter(
      (task) => task.id === data.taskId,
    );
    const subtasks = await this.openAiService.getSubTasksBasedOnTask(
      taskToBeSplitted,
      numberOfTasks,
    );
    board.tasks.push(...subtasks);

    return await board.save();
  }
}
