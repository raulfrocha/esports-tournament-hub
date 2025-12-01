import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const url = req.originalUrl || req.url || req.path;

    const publicPaths = [
      '/auth/login',
      '/auth/register',

      '/api/docs',
      '/api-json',

      '/v1/games',
      '/v1/tournaments',
    ];

    if (req.method === 'OPTIONS') {
      return next();
    }

    const isPublic = publicPaths.some((p) => url.startsWith(p));

    if (isPublic) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: 'Token não fornecido ou não autorizado.' });
    }

    next();
  }
}
