import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const userId = request.user.id;
    
    const resourceId = parseInt(request.params.id, 10);

    if (request.user.role === 'ADMIN') {
      return true;
    }

    if (userId === resourceId) {
      return true;
    }

    throw new ForbiddenException(
      'Você não tem permissão para modificar este recurso.',
    );
  }
}
