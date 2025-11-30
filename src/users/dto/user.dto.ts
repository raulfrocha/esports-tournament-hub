import { Transform, Type } from "class-transformer";
import { IsEmail, IsOptional, IsString, Length, ValidateNested } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Nome completo do usuário.', example: 'Raul Silva' }) 
  @IsString({message: 'O nome deve ser uma string válida.'})
  name: string; 

  @ApiProperty({ description: 'Nome de usuário único.', example: 'YuutoKolanz' }) 
  @IsString({message: 'O nome de usuário deve ser uma string válida.'})
  @Transform(({ value }: {value: string}) => value.trim())
  username: string; 

  @ApiProperty({ description: 'Email único.', example: 'raul@teste.com' }) 
  @IsEmail({}, {message: 'O email deve ser um email válido.'})
  email: string; 

  @ApiProperty({ description: 'Senha (mínimo 6 caracteres).', example: 'senha123' }) 
  @IsString({message: 'A senha deve ser uma string válida.'})
  password: string; 
}

export class UpdateUserDto {
  @ApiProperty({ description: 'Nome completo do usuário.', required: false, example: 'Raul Kolanz' }) 
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string válida.' })
  name?: string; 

  @ApiProperty({ description: 'Nome de usuário.', required: false, example: 'Yuuto_K' }) 
  @IsOptional()
  @IsString({ message: 'O nome de usuário deve ser uma string válida.' })
  @Length(3, 20)
  username?: string;

  @ApiProperty({ description: 'Email.', required: false, example: 'novo@teste.com' })
  @IsOptional()
  @IsEmail({}, { message: 'O email deve ser um email válido.' })
  email?: string;
}