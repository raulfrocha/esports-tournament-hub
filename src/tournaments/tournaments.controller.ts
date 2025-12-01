import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, UseFilters, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateTournamentDto } from './dto/create-tournaments.dto';
import { TournamentsService } from './tournaments.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';

@ApiTags('Tournaments')
@ApiBearerAuth()
@Controller({ path: 'tournaments', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}
  
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(201)
  @ApiOperation({ summary: 'Cria um novo torneio (Admin)' })
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentsService.create(createTournamentDto);
  }

  @Get(':id')
  @HttpCode(200)
  @Roles(Role.ADMIN, Role.PLAYER)
  @ApiOperation({ summary: 'Busca um torneio por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentsService.findOne(id);
  }

  @Public()
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Lista todos os torneios (rota pública)' })
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Deleta um torneio (Admin)' })
  remove(@Param('id') id: number) {
    return this.tournamentsService.remove(id);
  }

  @Post('register/:tournamentId/team/:teamId')
  @HttpCode(201)
  @Roles(Role.ADMIN, Role.PLAYER)
  @ApiOperation({ summary: 'Registra um time em um torneio' })
  registerTeam(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @Param('teamId', ParseIntPipe) teamId: number,
  ) {
    return this.tournamentsService.registerTeam(tournamentId, teamId);
  }

  @Post('start/:tournamentId')
  @HttpCode(200)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Inicia o torneio e gera o chaveamento (Admin)' })
  generateMatches(@Param('tournamentId', ParseIntPipe) tournamentId: number) {
    return this.tournamentsService.generateMatches(tournamentId);
  }
}