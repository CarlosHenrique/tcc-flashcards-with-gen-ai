import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  Field,
  Float,
  InputType,
  InterfaceType,
  ObjectType,
  Scalar,
  createUnionType,
} from '@nestjs/graphql';
import { GraphQLScalarType } from 'graphql';

@ObjectType()
@Schema()
export class Board {
  @Field()
  @Prop({ required: true })
  id!: string;

  @Field()
  @Prop({ required: true })
  title!: string;

  @Field()
  @Prop({ required: true })
  description!: string;

  @Field(() => [Task])
  @Prop({ required: true })
  tasks!: Task[];

  @Field()
  @Prop({ required: true })
  owner!: string;
}

@ObjectType()
export class Task {
  @Field()
  id!: string;

  @Field()
  @Prop({ required: true })
  title!: string;

  @Field()
  @Prop({ required: true })
  description!: string;

  @Field()
  @Prop({ required: true })
  storyPoints!: number;

  @Field()
  @Prop({ required: true })
  acceptanceCriteria!: string;

  @Field()
  @Prop({ required: true })
  dueDate!: string;

  @Field()
  @Prop({ required: true })
  label!: string;

  @Field({ nullable: true })
  @Prop()
  parentTask?: string;
}

@InputType()
export class CreateBoardInput {
  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => [CreateTaskInput])
  tasks!: CreateTaskInput[];

  @Field()
  owner!: string;
}

@InputType()
export class CreateTaskInput {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  storyPoints!: number;

  @Field()
  acceptanceCriteria!: string;

  @Field()
  dueDate!: string;

  @Field()
  label!: string;

  @Field({ nullable: true })
  parentTask?: string;
}

@InputType()
export class OwnerBoardInput {
  @Field()
  owner!: string;
}

@InputType()
export class UpdateTaskOnBoardInput {
  @Field()
  boardId!: string;

  @Field()
  taskId!: string;

  @Field()
  value!: string;

  @Field()
  field!: string;
}

@InputType()
export class DeleteBoardInput {
  @Field()
  boardId!: string;

  @Field()
  userId!: string;
}

@InputType()
export class DeleteTaskOnBoardInput {
  @Field()
  boardId!: string;

  @Field()
  taskId!: string;

  @Field()
  userId!: string;
}

@ObjectType()
export class DeleteBoardSuccess {
  @Field()
  _?: string;
}

@ObjectType()
export class DeleteBoardError {
  @Field()
  message!: string;
}

@InputType()
export class SplitTaskInput {
  @Field()
  boardId!: string;

  @Field()
  taskId!: string;

  @Field()
  userId!: string;
}

@ObjectType()
export class DeleteTaskOnBoardSuccess extends DeleteBoardSuccess {}

@ObjectType()
export class DeleteTaskOnBoardError extends DeleteBoardError {}

export const DeleteBoardResult = createUnionType({
  name: 'DeleteBoardResult',
  types: () => [DeleteBoardSuccess, DeleteBoardError],
});

export const DeleteTaskOnBoardResult = createUnionType({
  name: 'DeleteTaskOnBoardResult',
  types: () => [DeleteTaskOnBoardSuccess, DeleteTaskOnBoardError],
});

export type BoardDocument = HydratedDocument<Board>;
export const BoardSchema = SchemaFactory.createForClass(Board);
