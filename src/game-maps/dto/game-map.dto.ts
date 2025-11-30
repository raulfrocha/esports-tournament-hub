import { IsInt, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 🎯 Novo

export class CreateGameMapDto {
  @ApiProperty({ description: 'ID do jogo ao qual o mapa pertence.', example: 1, required: false })
  @IsInt()
  @IsOptional()
  gameId?: number;

  @ApiProperty({ description: 'Nome do mapa (Ex: Summoners Rift).', example: "Summoner's Rift" })
  @IsString()
  @Length(2, 50)
  name: string;
}