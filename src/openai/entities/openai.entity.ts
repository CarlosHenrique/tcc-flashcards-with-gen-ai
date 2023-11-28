import { Field, InputType } from '@nestjs/graphql';

export type OpenAiOptions = {
  apiKey: string;
};

@InputType()
export class BoardQuestionInput {
  @Field()
  projectName!: string;

  @Field()
  duration!: string;

  @Field()
  daysForWork!: number;

  @Field()
  people!: number;

  @Field()
  description!: string;

  @Field()
  owner!: string;
}
