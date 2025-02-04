/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import { Logger } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.useLogger(logger);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://front-tcc-flashcard-and-quiz-with-ai.vercel.app',
    ], // Origem do seu frontend
    credentials: true, // Permitir cookies
  });
  app.use(passport.initialize());
  await app.listen(4000);
  Logger.log('Application is running on: http://localhost:4000');
}
bootstrap();
