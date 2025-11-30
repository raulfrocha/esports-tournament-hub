import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateGameMapDto } from './dto/game-map.dto';

@Injectable()
export class GameMapsService {
  constructor(private prisma: PrismaService) {}

  create(gameId: number, createGameMapDto: CreateGameMapDto) {
    const prismaData: Prisma.GameMapCreateInput = {
      name: createGameMapDto.name,
      game: { connect: { id: gameId } },
    };
    return this.prisma.gameMap.create({ data: prismaData });
  }

  findAll(gameId: number) {
    return this.prisma.gameMap.findMany({
      where: {
        gameId: gameId,
      },
    });
  }

  findOne(id: number, gameId: number) {
    return this.prisma.gameMap.findFirst({
      where: {
        id: id,
        gameId: gameId,
      },
    });
  }

  update(id: number, data: Prisma.GameMapUpdateInput, gameId: number) {
    return this.prisma.gameMap.update({
      where: {
        id: id,
        gameId: gameId,
      },
      data,
    });
  }

  remove(id: number, gameId: number) {
    return this.prisma.gameMap.delete({
      where: {
        id: id,
        gameId: gameId,
      },
    });
  }
}
