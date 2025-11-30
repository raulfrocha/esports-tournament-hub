import { TournamentFormat } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsString, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTournamentDto {
  @ApiProperty({ description: 'Nome do torneio.', example: 'CBLoL Playoffs 2026' })
  @IsString({ message: 'O nome do torneio deve ser uma string válida.' })
  @Length(3, 100, { message: 'O nome do torneio deve ter entre 3 e 100 caracteres.' })
  name: string;

  @ApiProperty({ description: 'ID do jogo (Ex: 1).', example: 1 })
  @IsInt()
  @Min(1, { message: 'O ID do jogo deve ser um número inteiro positivo.' })
  gameId: number;

  @ApiProperty({ description: 'Formato do chaveamento.', enum: TournamentFormat, example: 'SINGLE_ELIMINATION' })
  @IsEnum(TournamentFormat, { message: 'Formato de torneio inválido.' })
  format: TournamentFormat;

  @ApiProperty({ description: 'Data de início (formato ISO 8601).', example: '2026-03-01T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Data de término (formato ISO 8601).', example: '2026-03-05T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({ description: 'Número máximo de times (deve ser >= 2).', example: 8 })
  @IsInt()
  @Min(2)
  maxTeams: number;
}