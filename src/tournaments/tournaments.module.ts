import { Module } from '@nestjs/common';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { MatchesGeneratorService } from 'src/matches/matches-generator.service';
import { RankingService } from 'src/ranking/ranking.service';

@Module({
  controllers: [TournamentsController],
  providers: [TournamentsService, MatchesGeneratorService, RankingService],
})
export class TournamentsModule {}
