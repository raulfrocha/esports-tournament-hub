import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeamScore } from './ranking.interface';

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula o ranking de um torneio ou de um grupo específico (para fase de grupos).
   * @param tournamentId ID do Torneio.
   * @param groupName Nome do grupo (opcional).
   * @returns Lista de TeamScore ordenada.
   */
  async calculateTournamentRanking(
    tournamentId: number,
    groupName?: string,
  ): Promise<TeamScore[]> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { 
        teams: { include: { team: true } }, // Inclui informações básicas dos times
        matches: {
          where: { played: true, groupName: groupName || undefined }, // Filtra partidas jogadas
          select: { 
            teamAId: true, teamBId: true, winnerId: true, scoreA: true, scoreB: true 
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Torneio não encontrado.');
    }
    
    // Inicializa o mapa de pontuação
    const scores = new Map<number, TeamScore>();

    // Inicializa todos os times com pontuação zero
    tournament.teams.forEach(t => {
        scores.set(t.teamId, {
            teamId: t.teamId,
            name: t.team.name,
            tag: t.team.tag || '',
            victories: 0,
            defeats: 0,
            draws: 0,
            points: 0,
            scoreDifference: 0,
        });
    });

    // Processa cada partida
    for (const match of tournament.matches) {
        if (!match.winnerId || match.scoreA === null || match.scoreB === null) continue;

        const teamA = scores.get(match.teamAId!);
        const teamB = scores.get(match.teamBId!);
        
        if (!teamA || !teamB) continue; 
        
        if (match.winnerId === match.teamAId) {
            teamA.victories++; teamB.defeats++;
            teamA.points += 3;
        } else {
            teamB.victories++; teamA.defeats++;
            teamB.points += 3;
        }

        // Diferença de placar (usado como desempate)
        teamA.scoreDifference += (match.scoreA - match.scoreB);
        teamB.scoreDifference += (match.scoreB - match.scoreA);
    }

    // Converte o mapa para array e ordena
    return Array.from(scores.values()).sort((a, b) => {
      // 1. Primário: Pontos (maior primeiro)
      if (b.points !== a.points) return b.points - a.points;
      // 2. Secundário: Diferença de Placar (maior primeiro)
      if (b.scoreDifference !== a.scoreDifference) return b.scoreDifference - a.scoreDifference;
      // 3. Terciário: Vitórias (maior primeiro)
      return b.victories - a.victories; 
    });
  }

  /**
   * Determina os times qualificados para a fase de Mata-Mata a partir de grupos.
   * (Ex: Top 2 de cada grupo)
   * @param tournamentId ID do Torneio.
   * @param teamsPerGroup Número de times que se qualificam por grupo.
   */
  async getQualifiedTeamsFromGroups(
    tournamentId: number,
    teamsPerGroup: number = 2,
  ): Promise<number[]> {
    const groups = await this.prisma.match.findMany({
      where: { tournamentId, stage: 'GROUP_STAGE' },
      distinct: ['groupName'],
      select: { groupName: true },
    });

    const qualifiedTeams: number[] = [];

    for (const { groupName } of groups) {
      if (!groupName) continue;
      const ranking = await this.calculateTournamentRanking(tournamentId, groupName);
      
      // Pega os N melhores times do ranking de cada grupo
      const topTeams = ranking.slice(0, teamsPerGroup).map(t => t.teamId);
      qualifiedTeams.push(...topTeams);
    }

    return qualifiedTeams;
  }
}