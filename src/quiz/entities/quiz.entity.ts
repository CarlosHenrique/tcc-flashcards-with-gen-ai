import { Field, InputType, ObjectType, createUnionType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CreateCardInput } from 'src/deck/entities/deck.entity';
import { Question } from './question.entity';

@ObjectType()
@Schema()
export class Quiz {
  @Field()
  @Prop({ required: true })
  id!: string;

  @Field()
  @Prop({ required: true })
  title!: string; // Título do Quiz

  @Field()
  @Prop({ required: true })
  description!: string; // Descrição breve do que o quiz aborda

  @Field()
  @Prop({ required: true })
  deckAssociatedId!: string; // ID do deck de flashcards associado

  @Field(() => [Question])
  @Prop({ required: true })
  questions!: Question[];
}
@InputType()
export class CreateQuizInput {
  @Field()
  deckAssociatedId!: string;

  @Field()
  owner!: string;

  @Field(() => [CreateCardInput], { nullable: true })
  cards?: CreateCardInput[];
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
