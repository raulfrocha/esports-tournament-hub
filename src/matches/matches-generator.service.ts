import { BadRequestException, Injectable } from '@nestjs/common';
import { Match, Prisma, TournamentFormat } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RankingService } from 'src/ranking/ranking.service';

type MatchCreateManyInput = Prisma.MatchCreateManyInput & {
  round: number;
  stage: string;
  groupName?: string;
  bracket?: 'WINNERS' | 'LOSERS' | 'MAIN';
};

@Injectable()
export class MatchesGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: RankingService,
  ) {}

  async createNextBracketMatch(
    tournamentId: number,
    round: number,
    teamAId: number,
    teamBId: number,
    stage: string,
    bracket: 'WINNERS' | 'LOSERS' | 'MAIN',
  ): Promise<Match> {
    return this.prisma.match.create({
      data: {
        tournamentId,
        teamAId,
        teamBId,
        mapId: 1,
        scoreA: 0,
        scoreB: 0,
        round: round + 1,
        stage,
        bracket,
        played: false,
      },
    });
  }

  /**
   * Gera todas as partidas do formato ROUND_ROBIN (Pontos Corridos).
   * @param tournamentId ID do torneio.
   * @param teamIds IDs dos times inscritos.
   */
  async generateRoundRobin(
    tournamentId: number,
    teamIds: number[],
  ): Promise<{ count: number }> {
    const numTeams = teamIds.length;
    if (numTeams < 2) {
      throw new BadRequestException('Mínimo de 2 times para Pontos Corridos.');
    }

    // Adapta para o 'Circle Method': se ímpar, adiciona um dummy (0) para folga (BYE)
    const teams = [...teamIds];
    const hasBye = numTeams % 2 !== 0;
    if (hasBye) {
      teams.push(0);
    }
    const numTeamsPadded = teams.length;
    const numRounds = numTeamsPadded - 1;
    const matchesToCreate: MatchCreateManyInput[] = [];

    // O time fixo é o primeiro (teams[0])
    const fixedTeam = teams[0];
    // O restante dos times (móveis)
    let rotatingTeams = teams.slice(1);

    for (let round = 1; round <= numRounds; round++) {
      // 1. Confronto do time fixo com o primeiro do móvel
      if (fixedTeam !== 0 && rotatingTeams[0] !== 0) {
        matchesToCreate.push({
          tournamentId,
          teamAId: fixedTeam,
          teamBId: rotatingTeams[0],
          mapId: 1, // Assumindo mapa padrão 1
          scoreA: 0,
          scoreB: 0,
          stage: 'ROUND_ROBIN',
          round: round,
        });
      }

      // 2. Confrontos dos times móveis (pareamento em espelho)
      for (let i = 1; i < numTeamsPadded / 2; i++) {
        const teamAId = rotatingTeams[i];
        const teamBId = rotatingTeams[numTeamsPadded - 1 - i];

        if (teamAId !== 0 && teamBId !== 0) {
          matchesToCreate.push({
            tournamentId,
            teamAId,
            teamBId,
            mapId: 1,
            scoreA: 0,
            scoreB: 0,
            stage: 'ROUND_ROBIN',
            round: round,
          });
        }
      }

      // 3. Rotaciona o círculo (mantém o fixedTeam no lugar)
      if (numTeamsPadded > 2) {
        const lastTeam = rotatingTeams.pop()!;
        rotatingTeams.splice(0, 0, lastTeam);
      }
    }

    return this.prisma.match.createMany({ data: matchesToCreate });
  }

  private async createMatchAndBracketSlots(
    tournamentId: number,
    round: number,
    stage: string,
    bracket: 'WINNERS' | 'LOSERS' | 'MAIN',
    teamAId: number | null,
    teamBId: number | null,
    nextRoundMatchId?: number,
    slotType?: 'TEAM_A_SLOT' | 'TEAM_B_SLOT',
    sourceOutcome?: 'WINNER' | 'LOSER',
  ): Promise<Match> {
    const newMatch = await this.prisma.match.create({
      data: {
        tournamentId,
        teamAId: teamAId || undefined,
        teamBId: teamBId || undefined,
        mapId: 1,
        scoreA: 0,
        scoreB: 0,
        round,
        stage,
        bracket,
        played: false,
      },
    });
    return newMatch;
  }

  async generateEliminationPhase(
    tournamentId: number,
    teamIds: number[],
    initialRound: number = 1,
    stage: string = 'SINGLE_ELIMINATION',
    bracket: 'WINNERS' | 'LOSERS' | 'MAIN' = 'MAIN',
  ): Promise<{ count: number }> {
    const numTeams = teamIds.length;
    if (numTeams < 2) {
      throw new BadRequestException('Mínimo de 2 times para Mata-Mata.');
    }

    let bracketSize = 2;
    while (bracketSize < numTeams) bracketSize *= 2;

    // 🎯 CORREÇÃO DE ESCOPO: Define teamsForPairing aqui
    const teamsForPairing =
      initialRound === 1 && stage === 'SINGLE_ELIMINATION'
        ? teamIds.sort(() => 0.5 - Math.random())
        : teamIds;

    const bracketPositionsToCreate: Prisma.BracketPositionCreateManyInput[] =
      [];
    const numMatchesInFirstRound = bracketSize / 2;

    // --- 1. Criar TODAS as partidas FUTURAS (Slots Vazios) ---
    const totalMatchesToCreate = bracketSize - 1;
    const numFutureMatches = totalMatchesToCreate - numMatchesInFirstRound;
    const futureMatches: Match[] = [];
    const futureMatchIds: number[] = [];

    // Lista de IDs dos slots vazios (Final, SF, SF...)
    for (let i = 0; i < numFutureMatches; i++) {
      // Cálculo da Rodada:
      // Rodada da Final (Rmax) - (0 para Final, 1 para SF, 2 para QF...)
      let maxRounds = Math.log2(bracketSize);
      let round =
        initialRound + maxRounds - 1 - Math.floor(i / (bracketSize / 4));

      const newMatch = await this.prisma.match.create({
        data: {
          tournamentId,
          mapId: 1,
          round: round, // Define a rodada correta (Ex: 3, 2, 2)
          stage,
          bracket,
          played: false,
        },
      });
      futureMatches.push(newMatch);
      futureMatchIds.push(newMatch.id);
    }

    // Inverte o array para que os IDs da Semifinal (R2) estejam no início para o loop R1
    futureMatchIds.reverse();

    const allMatches: Match[] = [...futureMatches];

    // --- 2. Criar as partidas da Rodada 1 (QF) e os Links R1 -> R2 ---
    for (let i = 0; i < numMatchesInFirstRound; i++) {
      const teamAId = teamsForPairing[i]; // 🎯 AGORA SEM ERRO DE ESCOPO
      const teamBId = teamsForPairing[bracketSize - 1 - i]; // 🎯 AGORA SEM ERRO DE ESCOPO

      const nextMatchIndex = Math.floor(i / 2);
      // ID da Semifinal de destino
      const nextMatchId = futureMatchIds[nextMatchIndex];

      if (teamAId && teamBId) {
        // Cria a partida da Rodada 1
        const matchRodada = await this.prisma.match.create({
          data: {
            tournamentId,
            teamAId,
            teamBId,
            mapId: 1,
            scoreA: 0,
            scoreB: 0,
            stage,
            round: initialRound,
            bracket,
            played: false,
          },
        });
        allMatches.push(matchRodada);

        // Cria o BracketPosition (LINK R1 -> R2)
        if (nextMatchId) {
          bracketPositionsToCreate.push({
            tournamentId,
            matchId: nextMatchId, // Partida de destino (SF)
            slotType: i % 2 === 0 ? 'TEAM_A_SLOT' : 'TEAM_B_SLOT',
            sourceMatchId: matchRodada.id, // Partida fonte (QF)
            sourceOutcome: 'WINNER',
          });
        }
      } else if (teamAId || teamBId) {
        // Lógica BYE (mantida e correta no contexto de R1 -> R2)
        const advancingTeam = teamAId || teamBId;
        if (nextMatchId && advancingTeam) {
          await this.prisma.match.update({
            where: { id: nextMatchId },
            data:
              i % 2 === 0
                ? { teamAId: advancingTeam }
                : { teamBId: advancingTeam },
          });
        }
      }
    }

    // --- 3. CRIAR LINKS R2 -> R3 (Semifinal -> Final) ---
    // ESTA LÓGICA AGORA É A CHAVE, POIS GARANTIMOS QUE A SF TEM O LINK.

    const numSemiFinals = bracketSize / 4; // Para 8 times, são 2 Semifinais
    const finalMatchIndex = numSemiFinals; // A Partida Final deve ser o próximo ID (índice 2)

    for (let i = 0; i < numSemiFinals; i++) {
      const semiFinalMatchId = futureMatchIds[i]; // IDs das Semifinais (índices 0 e 1)
      const finalMatchId = futureMatchIds[finalMatchIndex];

      if (semiFinalMatchId && finalMatchId) {
        bracketPositionsToCreate.push({
          tournamentId,
          matchId: finalMatchId, // Partida de destino (FINAL)
          slotType: i % 2 === 0 ? 'TEAM_A_SLOT' : 'TEAM_B_SLOT',
          sourceMatchId: semiFinalMatchId, // Partida fonte (SF)
          sourceOutcome: 'WINNER',
        });
      }
    }
    await this.prisma.bracketPosition.createMany({
      data: bracketPositionsToCreate,
    });

    return { count: allMatches.length };
  }

  async generateSingleElimination(
    tournamentId: number,
    teamIds: number[],
  ): Promise<{ count: number }> {
    return this.generateEliminationPhase(
      tournamentId,
      teamIds,
      0,
      'SINGLE_ELIMINATION',
      'MAIN',
    );
  }

  /**
   * Gera as partidas da Rodada 1 da Chave Superior (Winners Bracket).
   * @param tournamentId ID do torneio.
   * @param teamIds IDs dos times inscritos.
   */
  async generateDoubleElimination(
    tournamentId: number,
    teamIds: number[],
  ): Promise<{ count: number }> {
    const numTeams = teamIds.length;
    if (numTeams < 4) {
      throw new BadRequestException('Mínimo de 4 times para Mata-Mata Dupla.');
    }

    const shuffledTeams = teamIds.sort(() => 0.5 - Math.random());
    let bracketSize = 4;
    while (bracketSize < numTeams) {
      bracketSize *= 2;
    }

    const matchesToCreate: MatchCreateManyInput[] = [];

    // Criação da Rodada 1 da Chave Superior (Winners Bracket)
    for (let i = 0; i < bracketSize / 2; i++) {
      const teamAId = shuffledTeams[i];
      const teamBId = shuffledTeams[bracketSize - 1 - i];

      if (teamAId && teamBId) {
        matchesToCreate.push({
          tournamentId,
          teamAId,
          teamBId,
          mapId: 1,
          scoreA: 0,
          scoreB: 0,
          round: 1,
          stage: 'DOUBLE_ELIMINATION',
          bracket: 'WINNERS',
        });
      }
    }

    return this.prisma.match.createMany({ data: matchesToCreate });
  }

  async generateSwissFirstRound(
    tournamentId: number,
    teamIds: number[],
  ): Promise<{ count: number }> {
    const numTeams = teamIds.length;
    if (numTeams < 4 || numTeams % 2 !== 0) {
      throw new BadRequestException(
        'Mínimo de 4 times e número par para Fase Suíça.',
      );
    }

    // 1. Sorteio para a primeira rodada
    const shuffledTeams = teamIds.sort(() => 0.5 - Math.random());
    const matchesToCreate: MatchCreateManyInput[] = [];

    // 2. Pareamento (Rodada 1)
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      matchesToCreate.push({
        tournamentId,
        teamAId: shuffledTeams[i],
        teamBId: shuffledTeams[i + 1],
        mapId: 1,
        scoreA: 0,
        scoreB: 0,
        round: 1,
        stage: 'SWISS_STAGE',
      });
    }

    return this.prisma.match.createMany({ data: matchesToCreate });
  }

  async generateGroupStageAndElimination(
    tournamentId: number,
    teamIds: number[],
    numGroups: number = 4,
  ): Promise<{ count: number }> {
    const numTeams = teamIds.length;

    if (numTeams < numGroups * 2 || numTeams % numGroups !== 0) {
      throw new BadRequestException(
        `O número de times deve ser divisível por ${numGroups} e ter no mínimo ${
          numGroups * 2
        } times para Fase de Grupos.`,
      );
    }

    const teamsPerGroup = numTeams / numGroups;

    const shuffledTeams = teamIds.sort(() => 0.5 - Math.random());
    const groups: number[][] = Array.from({ length: numGroups }, () => []);

    shuffledTeams.forEach((teamId, index) => {
      groups[index % numGroups].push(teamId);
    });

    const matchesToCreate: MatchCreateManyInput[] = [];

    for (let groupIndex = 0; groupIndex < numGroups; groupIndex++) {
      const groupTeams = groups[groupIndex];
      const groupName = `Grupo ${String.fromCharCode(65 + groupIndex)}`;

      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          matchesToCreate.push({
            tournamentId,
            teamAId: groupTeams[i],
            teamBId: groupTeams[j],
            mapId: 1,
            scoreA: 0,
            scoreB: 0,
            played: false,
            stage: 'GROUP_STAGE',
            groupName: groupName,
            round: 1,
          });
        }
      }
    }

    return this.prisma.match.createMany({ data: matchesToCreate });
  }
}
