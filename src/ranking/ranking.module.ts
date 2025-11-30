import { Module } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [RankingService, PrismaService],
  exports: [RankingService],
})
export class RankingModule {}