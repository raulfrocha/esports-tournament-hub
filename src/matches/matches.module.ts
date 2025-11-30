import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MatchesGeneratorService } from './matches-generator.service';
import { RankingService } from 'src/ranking/ranking.service';
import { TournamentsService } from 'src/tournaments/tournaments.service';

@Module({
  controllers: [MatchesController],
  providers: [
    MatchesService,
    PrismaService,
    MatchesGeneratorService,
    RankingService,
    TournamentsService
  ],
  exports: [MatchesService],
})
export class MatchesModule {}
