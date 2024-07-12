import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

@ObjectType()
export class Question {
  @Field()
  @Prop({ required: true })
  id!: string;

  @Field()
  @Prop({ required: true })
  question!: string;

  @Field()
  @Prop({ required: true }) // enum
  type!: string;

  @Field()
  @Prop({ required: true })
  answer!: string;

  @Field(() => [String])
  @Prop({ required: true })
  options!: string[];

  @Field({ nullable: true })
  @Prop()
  explanation?: string; // Explicação da resposta, mostrada após a resposta ser submetida

  @Field({ nullable: true })
  @Prop()
  difficulty?: string; // Dificuldade da pergunta, e.g., Fácil, Médio, Difícil

  @Field({ nullable: true })
  @Prop()
  category?: string; // Categoria da pergunta para análise de desempenho por tópicos
}
