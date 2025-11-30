import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ description: 'Nome completo do time.', example: 'LOUD' })
  @IsString({message: 'O nome do time deve ser uma string válida.'})
  @IsNotEmpty({message: 'O nome do time é obrigatório.'})
  @Length(3, 100, {
    message: 'O nome deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  name: string;

  @ApiProperty({ description: 'Tag curta do time (Ex: LLL).', example: 'LLL', required: false })
  @IsString({ message: 'A tag deve ser uma string.' })
  @IsOptional()
  @Length(1, 4, {
    message: 'A tag deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  tag?: string;
}

export interface TeamCreationData extends CreateTeamDto {
  captainId: number;
}