import { Field, InputType, ObjectType, createUnionType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
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

@ObjectType()
@Schema()
export class UserQuizResponse {
  @Field(() => String)
  @Prop({ required: true, ref: 'User' })
  userId!: mongoose.Schema.Types.ObjectId; // Referência ao modelo de Usuário

  @Field(() => String)
  @Prop({ required: true, ref: 'Quiz' })
  quizId!: mongoose.Schema.Types.ObjectId; // Referência ao modelo de Quiz

  @Field(() => [String])
  @Prop({ required: true })
  selectedQuestionIds!: mongoose.Schema.Types.ObjectId[]; // IDs das perguntas selecionadas

  @Field()
  @Prop({ required: true })
  score!: number; // Pontuação do quiz

  @Field(() => Date)
  @Prop({ default: Date.now })
  date!: Date; // Data da resposta do quiz

  @Field(() => [UserQuestionMetrics])
  @Prop({ required: true })
  questionMetrics!: UserQuestionMetrics[]; // Métricas associadas a cada pergunta
}

@ObjectType()
@Schema()
export class UserQuestionMetrics {
  @Field(() => String)
  @Prop({ required: true, ref: 'Question' })
  questionId!: mongoose.Schema.Types.ObjectId; // Referência ao modelo de Question

  @Field()
  @Prop({ required: true, default: 0 })
  attempts!: number; // Número de tentativas para responder a pergunta

  @Field()
  @Prop({ required: true, default: false })
  correct!: boolean; // Se a resposta foi correta ou não

  @Field(() => Date)
  @Prop({ default: Date.now })
  lastAttemptDate!: Date; // Data da última tentativa
}

@InputType()
export class CreateQuizInput {
  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  deckAssociatedId!: string;

  @Field(() => [CreateQuestionInput], { nullable: true })
  questions?: CreateQuestionInput[];
}

@InputType()
export class CreateQuestionInput {
  @Field()
  question!: string;

  @Field()
  type!: string;

  @Field()
  answer!: string;

  @Field(() => [String])
  options!: string[];

  @Field({ nullable: true })
  explanation?: string;

  @Field({ nullable: true })
  difficulty?: string;

  @Field({ nullable: true })
  category?: string;
}

@InputType()
export class CreateUserQuizResponseInput {
  @Field()
  userId!: string;

  @Field()
  quizId!: string;

  @Field(() => [String])
  selectedQuestionIds!: string[];

  @Field()
  score!: number;

  @Field(() => [CreateUserQuestionMetricsInput])
  questionMetrics!: CreateUserQuestionMetricsInput[];
}

@InputType()
export class CreateUserQuestionMetricsInput {
  @Field()
  questionId!: string;

  @Field()
  attempts!: number;

  @Field()
  correct!: boolean;
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
export type UserQuizResponseDocument = HydratedDocument<UserQuizResponse>;

export const QuizSchema = SchemaFactory.createForClass(Quiz);
export const UserQuizResponseSchema =
  SchemaFactory.createForClass(UserQuizResponse);
