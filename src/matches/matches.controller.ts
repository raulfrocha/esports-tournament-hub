import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto, UpdateMatchResultDto } from './dto/match.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Matches')
@ApiBearerAuth()
@Controller({ path: 'matches', version: '1' })
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cria uma partida avulsa/manual (Admin)' })
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @Get('tournament/:id')
  @ApiOperation({ summary: 'Lista todas as partidas de um torneio' })
  findAllByTournament(@Param('id', ParseIntPipe) tournamentId: number) {
    return this.matchesService.findAllByTournament(tournamentId);
  }

  @Patch(':id/result')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Atualiza o resultado da partida e avança a chave (Admin)' })
  updateResult(
    @Param('id', ParseIntPipe) matchId: number,
    @Body() dto: UpdateMatchResultDto,
  ) {
    return this.matchesService.updateResult(matchId, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Deleta uma partida (Admin)' })
  delete(@Param('id', ParseIntPipe) matchId: number) {
    return this.matchesService.delete(matchId); 
  }
}