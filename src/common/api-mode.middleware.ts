import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiModeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      const originalRender = res.render.bind(res);
      // Override res.render for this request
      res.render = function (view: string, options?: any) {
        // Send JSON data instead of rendering template
        return res.json({
          view,
          data: options,
        }) as any;
      };
    }
    next();
  }
}
