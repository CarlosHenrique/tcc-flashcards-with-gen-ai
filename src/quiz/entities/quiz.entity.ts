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
export class PrivateQuiz {
  @Field()
  @Prop({ required: true })
  id!: string;

  @Field()
  @Prop({ required: true })
  title!: string;

  @Field()
  @Prop({ required: true })
  description!: string;

  @Field()
  @Prop({ required: true })
  deckAssociatedId!: string;

  @Field(() => [Question])
  @Prop({ required: false })
  questions!: Question[];

  @Field(() => String)
  @Prop({ required: true })
  ownerId!: string; // Owner (User ID)

  @Field()
  @Prop({ default: true })
  isLocked!: boolean; // If the quiz is locked or unlocked

  @Field()
  @Prop({ default: 0 })
  score!: number; // User's score in the quiz

  @Field(() => Date)
  @Prop({ default: Date.now })
  lastAccessed!: Date; // Last time the user accessed the quiz
}

@ObjectType()
@Schema()
export class UserQuizResponse {
  @Field(() => String)
  @Prop({ required: true })
  userId!: string; // Referência ao modelo de Usuário

  @Field(() => String)
  @Prop({ required: true })
  quizId!: string; // Referência ao modelo de Quiz (ajustado para string)

  @Field(() => [String])
  @Prop({ required: true })
  selectedQuestionIds!: string[]; // IDs das perguntas selecionadas
  @Field()
  @Prop({ required: true })
  totalQuizTime!: number;

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
  @Prop({ required: true })
  questionId!: string; // Referência ao modelo de Question

  @Field()
  @Prop({ required: true, default: 0 })
  attempts!: number; // Número de tentativas para responder a pergunta

  @Field()
  @Prop({ required: true, default: false })
  correct!: boolean; // Se a resposta foi correta ou não

  @Field()
  @Prop({ required: true })
  timeSpent!: number; // Número de tentativas para responder a pergunta

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

  @Field()
  totalQuizTime!: number;

  @Field(() => Date)
  date!: Date; // Data da resposta do quiz

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

  @Field()
  timeSpent!: number;
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
export type PrivateQuizDocument = HydratedDocument<PrivateQuiz>;

export const QuizSchema = SchemaFactory.createForClass(Quiz);
export const UserQuizResponseSchema =
  SchemaFactory.createForClass(UserQuizResponse);
export const PrivateQuizSchema = SchemaFactory.createForClass(PrivateQuiz);
