import { IsInt, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMatchDto {
  @ApiProperty({ description: 'ID do torneio.', example: 101 })
  @IsInt()
  tournamentId: number;

  @ApiProperty({ description: 'ID do Time A.', example: 5 })
  @IsInt()
  teamAId: number;

  @ApiProperty({ description: 'ID do Time B.', example: 12 })
  @IsInt()
  teamBId: number;

  @ApiProperty({ description: 'ID do mapa a ser jogado.', example: 1 })
  @IsInt()
  mapId: number;

  @ApiProperty({ description: 'Rodada da partida (Ex: 1, 2, 3).', example: 1 })
  @IsInt()
  @Min(1)
  round: number;

  @ApiProperty({ description: 'Fase da partida (Ex: SINGLE_ELIMINATION, GROUP_STAGE).', required: false, example: 'SINGLE_ELIMINATION' })
  @IsOptional()
  stage?: string;
}

export class UpdateMatchResultDto {
  @ApiProperty({ description: 'Placar final do Time A.', example: 2 })
  @IsInt({ message: 'O placar deve ser um número inteiro.' })
  @Min(0, { message: 'O placar não pode ser negativo.' })
  scoreA: number;

  @ApiProperty({ description: 'Placar final do Time B.', example: 1 })
  @IsInt({ message: 'O placar deve ser um número inteiro.' })
  @Min(0, { message: 'O placar não pode ser negativo.' })
  scoreB: number;

  @ApiProperty({ description: "Identifica o vencedor ('A' ou 'B').", enum: ['A', 'B'], example: 'A' })
  @IsString({ message: 'O vencedor deve ser uma string.' })
  winner: 'A' | 'B';
}