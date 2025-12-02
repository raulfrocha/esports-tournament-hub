import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
        await this.$connect();
    } catch (e) {
        console.error("Erro ao conectar o Prisma na inicialização:", e);
        throw e;
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}