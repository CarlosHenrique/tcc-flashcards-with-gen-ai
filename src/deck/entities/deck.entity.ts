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
  videoUrl!: string;

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
  ownerId!: string; // Identificador do usuário (manipulação privada)

  @Field()
  @Prop({ required: true })
  title!: string;

  @Field()
  @Prop({ required: true })
  imageUrl!: string;

  @Field()
  @Prop({ required: true })
  videoUrl!: string;

  @Field()
  @Prop({ required: true })
  theme!: string;

  @Field(() => Date, { nullable: true }) // Permite null no schema GraphQL
  @Prop({ required: false }) // Permite undefined/null no MongoDB
  nextDeckReviewDate?: Date; // Tipo opcional no TypeScript

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
  totalSessionScore!: number; // Pontuação total desta sessão de estudo

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
  @Prop({ required: true })
  cardId!: string; // Referência ao modelo de Card

  @Field()
  @Prop({ required: true, default: 0 })
  attempts!: number; // Número de vezes que o card foi revisado

  @Field()
  @Prop({ required: true })
  reviewQuality!: number; // Nova: Qualidade da resposta (0-5)

  @Field()
  @Prop({ required: true, default: 2.5 }) // Adicionado: Fator de facilidade
  easeFactor!: number;

  @Field(() => Date)
  @Prop({ required: true })
  nextReviewDate!: Date; // Data da próxima revisão

  @Field(() => Date)
  @Prop({ default: Date.now })
  lastAttempt!: Date; // Data da última revisão
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
  totalSessionScore!: number; // Alterado: Para refletir a pontuação da sessão

  @Field(() => [CreateUserCardMetricsInput])
  cardMetrics!: CreateUserCardMetricsInput[];

  @Field(() => Date)
  date!: Date;
}

@InputType()
export class CreateUserCardMetricsInput {
  @Field()
  cardId!: string;

  @Field()
  attempts!: number;

  @Field()
  reviewQuality!: number; // Alterado: Para qualidade da revisão

  @Field()
  easeFactor!: number; // Adicionado: Para o fator de facilidade

  @Field(() => Date)
  nextReviewDate!: Date;

  @Field(() => Date)
  lastAttempt!: Date;
}

export type DeckDocument = HydratedDocument<Deck>;
export type UserDeckResponseDocument = HydratedDocument<UserDeckResponse>;
export type PrivateDeckDocument = HydratedDocument<PrivateDeck>;

export const DeckSchema = SchemaFactory.createForClass(Deck);
export const PrivateDeckSchema = SchemaFactory.createForClass(PrivateDeck);
export const UserDeckResponseSchema =
  SchemaFactory.createForClass(UserDeckResponse);
