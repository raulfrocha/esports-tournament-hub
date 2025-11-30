import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class QueryFilterDto {
  @ApiProperty({ description: 'Termo de filtro para buscas.', required: false, example: 'pain' }) 
  @IsOptional()
  @IsString({message: 'O filtro deve ser uma string válida.'})
  @Transform(({ value }: { value: string }) => value.trim())
  filter?: string; 

  @ApiProperty({ description: 'Número da página.', required: false, example: 2 }) 
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  page?: number; 
}