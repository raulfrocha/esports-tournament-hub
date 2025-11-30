import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  findAll(filter?: string, page: number = 1) {
     return this.prisma.user.findMany({
      skip: (page - 1) * 5,
      take: 5,
    });
  }


  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
