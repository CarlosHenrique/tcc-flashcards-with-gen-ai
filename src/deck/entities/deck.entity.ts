import { Field, InputType, ObjectType, createUnionType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@ObjectType()
@Schema()
export class Deck {
  @Field()
  @Prop({ required: true })
  id!: string;

  @Field()
  @Prop({ required: true })
  theme!: string;

  //enum field
  @Field()
  @Prop({ required: true })
  difficulty!: string;

  @Field(() => [Card])
  @Prop({ required: true })
  cards!: Card[];

  @Field()
  @Prop({ required: true })
  owner!: string;
}

@ObjectType()
export class Card {
  @Field()
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
