/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import mongoose, { Schema } from 'mongoose';
import { GraphQLScalarType, Kind } from 'graphql';

// Define a scalar type for JSON
const GraphQLJSON = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value',
  parseValue(value) {
    return value; // value from the client
  },
  serialize(value) {
    return value; // value sent to the client
  },
  parseLiteral(ast) {
    function parseLiteral(ast) {
      switch (ast.kind) {
        case Kind.STRING:
        case Kind.BOOLEAN:
        case Kind.INT:
        case Kind.FLOAT:
          return ast.value;
        case Kind.OBJECT:
          const value = Object.create(null);
          ast.fields.forEach((field) => {
            value[field.name.value] = parseLiteral(field.value);
          });
          return value;
        case Kind.LIST:
          return ast.values.map(parseLiteral);
        default:
          return null;
      }
    }
    return parseLiteral(ast);
  },
});

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

  @Field(() => GraphQLJSON)
  @Prop({ required: true, type: Object })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answer: any;

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
