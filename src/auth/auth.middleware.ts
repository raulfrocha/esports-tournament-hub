import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const publicPaths = [
      '/auth/login',
      '/auth/register',
      '/api/docs',
      '/api-json',
      '/v1/games',
      '/v1/tournaments',
    ];

    const isPublic =
      publicPaths.some((p) => req.path.startsWith(p)) ||
      req.method === 'OPTIONS';

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