import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseAsyncConfig } from './config/mongo.config';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GqlConfigService } from './config/graphql.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DeckModule } from './deck/deck.module';
import { QuizModule } from './quiz/quiz.module';
import { HealthModule } from './health/health.module';
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
    DeckModule,
    QuizModule,
    HealthModule,
  ],
})
export class AppModule {}
