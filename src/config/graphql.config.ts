import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  createGqlOptions(): ApolloDriverConfig {
    return {
      autoSchemaFile: true,
      playground: true,
      introspection: true,
      formatError: (error: GraphQLError) => error,
    };
  }
}
