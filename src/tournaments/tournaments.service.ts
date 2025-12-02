import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournaments.dto';
import { MatchesGeneratorService } from '../matches/matches-generator.service';
import { Prisma, TournamentStatus } from '@prisma/client';

type TournamentWithTeams = Prisma.TournamentGetPayload<{
  include: {
    teams: {
      select: { teamId: true };
    };
  };
}>;

@Injectable()
export class TournamentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchesGeneratorService: MatchesGeneratorService,
  ) {}

  create(data: CreateTournamentDto) {
    return this.prisma.tournament.create({ data });
  }

  findAll() {
    return this.prisma.tournament.findMany({
      include: { teams: true },
    });
  }

  findOne(id: number) {
    return this.prisma.tournament.findUnique({
      where: { id },
      include: { teams: true },
    });
  }

  update(id: number, data: Partial<CreateTournamentDto>) {
    return this.prisma.tournament.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.tournament.delete({ where: { id } });
  }

  registerTeam(tournamentId: number, teamId: number) {
    this.validateTeamCanRegistrate(tournamentId, teamId);
    return this.prisma.tournamentOnTeams.create({
      data: {
        tournamentId,
        teamId,
      },
    });
  }

  unregisterTeam(tournamentId: number, teamId: number) {
    this.validateTeamCanUnregistrate(tournamentId, teamId);
    return this.prisma.tournamentOnTeams.deleteMany({
      where: {
        tournamentId,
        teamId,
      },
    });
  }

  async generateMatches(tournamentId: number) {
    const tournament: TournamentWithTeams | null =
      await this.prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { teams: { select: { teamId: true } } },
      });

    if (!tournament) throw new NotFoundException('Torneio não encontrado.');

    if (tournament.status !== TournamentStatus.PENDING) {
      throw new BadRequestException(
        `O torneio já está ${tournament.status.toLowerCase().replace('_', ' ')} e não pode ser iniciado novamente.`,
      );
    }

    const teamIds = tournament.teams.map((t) => t.teamId);
    let result;

    switch (tournament.format) {
      case 'SINGLE_ELIMINATION':
        result = this.matchesGeneratorService.generateSingleElimination(
          tournamentId,
          teamIds,
        );
        break;
      case 'ROUND_ROBIN':
        result = this.matchesGeneratorService.generateRoundRobin(
          tournamentId,
          teamIds,
        );
        break;
      case 'DOUBLE_ELIMINATION':
        result = this.matchesGeneratorService.generateDoubleElimination(
          tournamentId,
          teamIds,
        );
        break;
      case 'GROUP_STAGE_ELIMINATION':
        result = this.matchesGeneratorService.generateGroupStageAndElimination(
          tournamentId,
          teamIds,
        );
        break;
      default:
        throw new BadRequestException('Formato de torneio não suportado.');
    }

    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: TournamentStatus.IN_PROGRESS },
    });

    return result;
  }

  private;

  validateTeamCanRegistrate(tournamentId: number, teamId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { teams: true },
      });

      if (!tournament) {
        throw new Error('Torneio não encontrado.');
      }

      if (tournament.teams.length >= tournament.maxTeams) {
        throw new Error('O torneio já atingiu o número máximo de times.');
      }

      const isTeamRegistered = tournament.teams.some(
        (tt) => tt.teamId === teamId,
      );
      if (isTeamRegistered) {
        throw new Error('Time já está registrado no torneio.');
      }
    });
  }

  validateTeamCanUnregistrate(tournamentId: number, teamId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { teams: true },
      });
    });
  }

  async setChampion(tournamentId: number, championId: number) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException(
        `Torneio com ID ${tournamentId} não encontrado.`,
      );
    }

    return this.prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        championId: championId,
        status: TournamentStatus.ENDED,
      },
      include: { game: true, teams: true, champion: true },
    });
  }
}
