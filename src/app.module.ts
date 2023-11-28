import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseAsyncConfig } from './config/mongo.config';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GqlConfigService } from './config/graphql.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OpenAiModule } from './openai/openai.module';
import { BoardModule } from './board/board.module';
import 'dotenv/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GqlConfigService,
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseAsyncConfig,
    }),
    UserModule,
    AuthModule,
    OpenAiModule.register({
      apiKey: process.env.OPENAI_API_KEY,
    }),
    BoardModule,
  ],
})
export class AppModule {}
