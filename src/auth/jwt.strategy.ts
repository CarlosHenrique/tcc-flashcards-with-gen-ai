/* eslint-disable @typescript-eslint/no-explicit-any */
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
      ignoreExpiration: false,
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async validate(payload: any) {
    return { email: payload.email };
  }
}
