import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from '././jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';

import { QuizModule } from 'src/quiz/quiz.module';
import { DeckModule } from 'src/deck/deck.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    PassportModule,
    UserModule,
    DeckModule,
    QuizModule,
    JwtModule.register({
      secret: 'secret', //.env secret on future
      signOptions: { expiresIn: '2h' },
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, MailService],
})
export class AuthModule {}
