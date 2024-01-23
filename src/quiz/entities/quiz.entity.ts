import { ObjectType, Field, InputType, createUnionType } from '@nestjs/graphql';

import { HydratedDocument } from 'mongoose';
import { CreateCardInput } from 'src/deck/entities/deck.entity';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@ObjectType()
@Schema()
export class Quiz {
  @Field()
  @Prop({ required: true })
  id!: string;

  @Field()
  @Prop({ required: true })
  deckAssociatedId!: string;

  @Field(() => [Question])
  @Prop({ required: true })
  questions!: Question[];

  @Field()
  @Prop({ required: true })
  owner!: string;
}

@ObjectType()
export class Question {
  @Field()
  id!: string;

  @Field()
  @Prop({ required: true })
  question!: string;

  @Field()
  @Prop({ required: true })
  answer!: string;

  @Field(() => [String])
  @Prop({ required: true })
  options!: string[];
}

@InputType()
export class CreateQuizInput {
  @Field()
  deckAssociatedId!: string;

  @Field()
  owner!: string;

  @Field(() => [CreateCardInput])
  cards!: CreateCardInput[];
}

@InputType()
export class OwnerQuizInput {
  @Field()
  owner!: string;
}

@InputType()
export class DeleteQuizInput {
  @Field()
  quizId!: string;

  @Field()
  userId!: string;
}

@ObjectType()
export class DeleteQuizSuccess {
  @Field()
  _?: string;
}

@ObjectType()
export class DeleteQuizError {
  @Field()
  message!: string;
}

export const DeleteQuizResult = createUnionType({
  name: 'DeleteQuizResult',
  types: () => [DeleteQuizSuccess, DeleteQuizError],
});

export type QuizDocument = HydratedDocument<Quiz>;
export const QuizSchema = SchemaFactory.createForClass(Quiz);
