import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CaptainGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    
    const teamId = parseInt(request.params.id || request.params.teamId, 10);

    if (!teamId) {
        return true; 
    }

    if (request.user.role === 'ADMIN') {
        return true; 
    }

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { captainId: true },
    });

    if (!team) {
        return true; 
    }

    if (team.captainId === userId) {
      return true;
    }

    throw new ForbiddenException('Apenas o Capitão do time ou um Administrador pode realizar esta ação.');
  }
}