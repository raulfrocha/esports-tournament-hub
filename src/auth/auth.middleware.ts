import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Token não fornecido ou não autorizado.' });
    }
    next();
  }
}
