import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.GameCreateInput) {
    return this.prisma.game.create({ data });
  }

  findAll() {
      return this.prisma.game.findMany({});
  }


  findOne(id: number) {
    return this.prisma.game.findUnique({ where: { id } })
  }

  update(id: number, data: Prisma.GameUpdateInput) {
    return this.prisma.game.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.game.delete({ where: { id } });
  }
}
