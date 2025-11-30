import { Type } from 'class-transformer';
import { IsString, Length, ValidateNested } from 'class-validator';
import { CreateGameMapDto } from '../../game-maps/dto/game-map.dto';
import { ApiProperty } from '@nestjs/swagger'; // 🎯 Novo

export class CreateGameDto {
  @ApiProperty({ description: 'Nome completo do jogo (Ex: Counter-Strike 2).', example: 'League of Legends' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ description: 'Abreviatura/tag do jogo (Ex: CS, VAL).', example: 'LOL' })
  @IsString()
  @Length(1, 5)
  abbr: string;

  @ApiProperty({ description: 'Tipo de modo de jogo (Ex: 5v5, 3v3).', example: '5v5' })
  @IsString()
  modeType: string;

  @ApiProperty({ description: 'Lista de mapas padrão para o jogo.', type: [CreateGameMapDto], required: false })
  @ValidateNested({
    message: 'Os mapas devem ser um array de objetos válidos.',
  })
  @Type(() => CreateGameMapDto)
  games?: CreateGameMapDto[];
}