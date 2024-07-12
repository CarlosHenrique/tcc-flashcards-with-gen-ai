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
  theme!: string;

  @Field(() => [Card])
  @Prop({ required: true })
  cards!: Card[];
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
  @Prop({ required: true, ref: 'User' })
  userId!: mongoose.Schema.Types.ObjectId; // Referência ao modelo de Usuário

  @Field(() => String)
  @Prop({ required: true, ref: 'Deck' })
  deckId!: mongoose.Schema.Types.ObjectId; // Referência ao modelo de Deck

  @Field(() => [String])
  @Prop({ required: true })
  selectedCardsIds!: mongoose.Schema.Types.ObjectId[]; // IDs dos cards selecionados

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
export class OwnerDeckInput {
  @Field()
  owner!: string;
}

@InputType()
export class DeleteDeckInput {
  @Field()
  deckId!: string;

  @Field()
  userId!: string;
}

@ObjectType()
export class DeleteDeckSuccess {
  @Field()
  _?: string;
}

@ObjectType()
export class DeleteDeckError {
  @Field()
  message!: string;
}

export const DeleteDeckResult = createUnionType({
  name: 'DeleteDeckResult',
  types: () => [DeleteDeckSuccess, DeleteDeckError],
});

export type DeckDocument = HydratedDocument<Deck>;
export const DeckSchema = SchemaFactory.createForClass(Deck);
