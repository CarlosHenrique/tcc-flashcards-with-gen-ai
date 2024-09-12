import { Field, InputType, ObjectType, createUnionType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@ObjectType()
@Schema()
export class Deck {
  @Field()
  @Prop({ required: true })
  id!: string;

  @Field()
  @Prop({ required: true })
  title!: string;

  @Field()
  @Prop({ required: true })
  imageUrl!: string;

  @Field()
  @Prop({ required: true })
  theme!: string;

  @Field(() => [Card])
  @Prop({ required: true })
  cards!: Card[];
}
@ObjectType()
@Schema()
export class PrivateDeck {
  @Field()
  @Prop({ required: true })
  id!: string;

  @Field()
  @Prop({ required: true })
  title!: string;

  @Field()
  @Prop({ required: true })
  imageUrl!: string;

  @Field()
  @Prop({ required: true })
  theme!: string;

  @Field(() => [Card])
  @Prop({ required: true })
  cards!: Card[];

  @Field()
  @Prop({ default: 0 })
  score!: number;

  @Field()
  @Prop({ default: true })
  isLocked!: boolean;

  @Field(() => Date)
  @Prop({ default: Date.now })
  lastAccessed!: Date;
}

@ObjectType()
export class Card {
  @Field()
  @Prop({ required: true })
  id!: string;

  @Field()
  @Prop({ required: true })
  question!: string;

  @Field()
  @Prop({ required: true })
  answer!: string;

  @Field()
  @Prop({ required: true })
  practiceExample!: string;

  @Field()
  @Prop({ required: true })
  category!: string;

  @Field()
  @Prop({ required: true })
  difficulty!: string; // Dificuldade agora específica para cada card.
}

@ObjectType()
@Schema()
export class UserDeckResponse {
  @Field(() => String)
  @Prop({ required: true })
  userId!: string; // Referência ao modelo de Usuário

  @Field(() => String)
  @Prop({ required: true })
  deckId!: string; // Referência ao modelo de Deck

  @Field(() => [String])
  @Prop({ required: true })
  selectedCardsIds!: string[]; // IDs dos cards selecionados

  @Field()
  @Prop({ required: true })
  score!: number; // Pontuação do quiz

  @Field(() => Date)
  @Prop({ default: Date.now })
  date!: Date; // Data da resposta do quiz

  @Field(() => [UserCardMetrics])
  @Prop({ required: true })
  cardMetrics!: UserCardMetrics[]; // Métricas associadas a cada card
}

@ObjectType()
@Schema()
export class UserCardMetrics {
  @Field(() => String)
  @Prop({ required: true, ref: 'Card' })
  cardId!: mongoose.Schema.Types.ObjectId; // Referência ao modelo de Card

  @Field()
  @Prop({ required: true, default: 0 })
  repetitions!: number; // Número de vezes que o card foi revisado

  @Field()
  @Prop({ required: true, default: 2.5 })
  easiness!: number; // Fator de facilidade no algoritmo de repetição

  @Field()
  @Prop({ required: true, default: 1 })
  interval!: number; // Intervalo para a próxima revisão

  @Field(() => Date)
  @Prop({ required: true })
  nextReviewDate!: Date; // Data da próxima revisão

  @Field(() => Date)
  @Prop({ default: Date.now })
  lastReviewedDate!: Date; // Data da última revisão
}

@InputType()
export class CreateDeckInput {
  @Field()
  theme!: string;

  @Field()
  knowledgeLevel!: string;

  @Field()
  goal!: string;

  //enum
  @Field()
  typeOfQuestion!: string;

  @Field()
  topicsToBeIncluded!: string;

  @Field()
  limitations!: string;

  @Field()
  numberOfCards!: number;

  @Field(() => Boolean, { nullable: true })
  hasPracticeExamples?: boolean;
}

@InputType()
export class CreateCardInput {
  @Field()
  id!: string;

  @Field()
  @Prop({ required: true })
  question!: string;

  @Field()
  answer!: string;

  @Field()
  practiceExample!: string;

  @Field()
  category!: string;
}

@InputType()
export class CreateUserDeckResponseInput {
  @Field()
  userId!: string;

  @Field()
  deckId!: string;

  @Field(() => [String])
  selectedCardsIds!: string[];

  @Field()
  score!: number;

  @Field(() => [CreateUserCardMetricsInput])
  cardMetrics!: CreateUserCardMetricsInput[];
}

@InputType()
export class CreateUserCardMetricsInput {
  @Field()
  cardId!: string;

  @Field()
  repetitions!: number;

  @Field()
  easiness!: number;

  @Field()
  interval!: number;

  @Field(() => Date)
  nextReviewDate!: Date;

  @Field(() => Date)
  lastReviewedDate!: Date;
}

export type DeckDocument = HydratedDocument<Deck>;
export type UserDeckResponseDocument = HydratedDocument<UserDeckResponse>;
export type PrivateDeckDocument = HydratedDocument<PrivateDeck>;

export const DeckSchema = SchemaFactory.createForClass(Deck);
export const PrivateDeckSchema = SchemaFactory.createForClass(PrivateDeck);
export const UserDeckResponseSchema =
  SchemaFactory.createForClass(UserDeckResponse);
