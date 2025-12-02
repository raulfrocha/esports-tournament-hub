import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { TeamCreationData } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: TeamCreationData) {
    const { captainId, ...teamData } = data;

    return this.prisma.team.create({
      data: {
        ...teamData,
        captainId: captainId,
        players: {
          connect: { id: captainId },
        },
      },
    });
  }

  findAll() {
    return this.prisma.team.findMany({
      include: {
        players: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.team.findUnique({
      include: {
        players: true,
      },
      where: { id },
    });
  }

  update(id: number, data: Prisma.TeamUpdateInput) {
    return this.prisma.team.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.team.delete({ where: { id } });
  }

  addTeamMember(teamId: number, userId: number) {
    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        players: {
          connect: { id: userId },
        },
      },
    });
  }

  removeTeamMember(teamId: number, userId: number) {
    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        players: {
          disconnect: { id: userId },
        },
      },
    });
  }
}
