import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    console.log('🔍 Headers recebidos:', req.headers); // Log para verificar o token
    return super.canActivate(new ExecutionContextHost([req]));
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  handleRequest(err, user, info) {
    if (err || !user) {
      console.log('⛔ Unauthorized - Usuário inválido:', err);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
