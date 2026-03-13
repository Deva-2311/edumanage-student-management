import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch {
      const res = context.switchToHttp().getResponse<Response>();
      if (!res.headersSent) {
        res.redirect('/api/login');
      }
      return true;
    }
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      return user ?? err;
    }
    return user;
  }
}