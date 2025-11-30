import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchDto, UpdateMatchResultDto } from './dto/match.dto';
import { MatchesGeneratorService } from './matches-generator.service';
import { Prisma, TournamentFormat } from '@prisma/client';
import { RankingService } from 'src/ranking/ranking.service';
import { TournamentsService } from 'src/tournaments/tournaments.service';

type MatchWithTournament = Prisma.MatchGetPayload<{
  include: {
    tournament: true;
    slotsToFill: true;
  };
}>;

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly generatorService: MatchesGeneratorService,
    private readonly rankingService: RankingService,
    private readonly tournamentsService: TournamentsService,
  ) {}

  async findAllByTournament(tournamentId: number) {
    return this.prisma.match.findMany({
      where: { tournamentId },
      include: { teamA: true, teamB: true, winner: true },
    });
  }

  async create(dto: CreateMatchDto) {
    return this.prisma.match.create({ data: dto });
  }

  async delete(matchId: number) {
    return this.prisma.match.delete({
      where: { id: matchId },
    });
  }

  async updateResult(matchId: number, dto: UpdateMatchResultDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        slotsToFill: {
          include: { sourceMatch: true },
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Partida não encontrada.');
    }

    if (match.played) {
      throw new BadRequestException('Esta partida já foi concluída.');
    }

    const winnerId =
      dto.winner === 'A'
        ? match.teamAId
        : dto.winner === 'B'
          ? match.teamBId
          : null;

    if (!winnerId) {
      throw new BadRequestException('Placar inválido: Deve haver um vencedor.');
    }

    const loserId = match.teamAId! + match.teamBId! - winnerId;

    const updatedMatch = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        scoreA: dto.scoreA,
        scoreB: dto.scoreB,
        winnerId: winnerId,
        played: true,
      },
      include: {
        tournament: true,
        slotsToFill: {
          include: { sourceMatch: true },
        },
      },
    });

    if (match.tournament.format !== TournamentFormat.ROUND_ROBIN) {
      await this.checkIfTournamentEnded(updatedMatch, winnerId);
      await this.advanceBracket(updatedMatch, loserId);
    }

    if (match.tournament.format === TournamentFormat.ROUND_ROBIN) {
      await this.checkRoundRobinCompletion(updatedMatch.tournamentId);
    }

    return updatedMatch;
  }

  private async advanceBracket(
    completedMatch: MatchWithTournament,
    loserId: number,
  ) {
    const { id: matchId, tournament, winnerId } = completedMatch;

    for (const slotToFill of completedMatch.slotsToFill) {
      const isWinnerSlot = slotToFill.sourceOutcome === 'WINNER';
      const advancingTeamId = isWinnerSlot ? winnerId : loserId;

      if (advancingTeamId) {
        await this.fillBracketSlot(
          slotToFill.matchId,
          slotToFill.slotType,
          advancingTeamId,
        );
      }
    }
    if (tournament.format === TournamentFormat.GROUP_STAGE_ELIMINATION) {
      await this.checkGroupStageCompletion(tournament.id);
    }
  }

  private async fillBracketSlot(
    targetMatchId: number,
    slotType: string,
    teamId: number,
  ) {
    const dataUpdate =
      slotType === 'TEAM_A_SLOT' ? { teamAId: teamId } : { teamBId: teamId };

    const targetMatch = await this.prisma.match.update({
      where: { id: targetMatchId },
      data: dataUpdate,
      include: {
        tournament: true,
        slotsToFill: { include: { sourceMatch: true } },
      },
    });

    if (targetMatch.teamAId && targetMatch.teamBId) {
      console.log(
        `Partida ${targetMatchId} (Rodada ${targetMatch.round}) completa.`,
      );
    }
  }

  private async checkGroupStageCompletion(tournamentId: number) {
    const pendingGroupMatches = await this.prisma.match.count({
      where: { tournamentId, played: false, stage: 'GROUP_STAGE' },
    });

    if (pendingGroupMatches === 0) {
      console.log('Fase de grupos terminada. Gerando chave de Mata-Mata...');

      const qualifiedTeams =
        await this.rankingService.getQualifiedTeamsFromGroups(tournamentId, 2);

      if (qualifiedTeams.length >= 2) {
        await this.generatorService.generateEliminationPhase(
          tournamentId,
          qualifiedTeams,
          1,
          'PLAYOFFS',
          'MAIN',
        );
      }
    }
  }

  private async checkIfTournamentEnded(
    completedMatch: MatchWithTournament,
    winnerId: number,
  ) {
    const { tournament, slotsToFill, stage } = completedMatch;

    if (slotsToFill.length === 0) {
      if (
        stage === 'SINGLE_ELIMINATION' ||
        stage === 'DOUBLE_ELIMINATION' ||
        stage === 'PLAYOFFS'
      ) {
        await this.tournamentsService.setChampion(tournament.id, winnerId);

        console.log(
          `🏆 Torneio ${tournament.id} concluído! Vencedor: ${winnerId}`,
        );
      }
    }
  }

  private async checkRoundRobinCompletion(tournamentId: number) {
    const pendingMatches = await this.prisma.match.count({
      where: { tournamentId, played: false },
    });

    if (pendingMatches === 0) {
      const ranking =
        await this.rankingService.calculateTournamentRanking(tournamentId);

      if (ranking.length > 0) {
        const championId = ranking[0].teamId;

        await this.tournamentsService.setChampion(tournamentId, championId);
        console.log(
          `🏆 Torneio Round Robin (${tournamentId}) CONCLUÍDO! Campeão: ${ranking[0].name}`,
        );
      }
    }
  }
}
