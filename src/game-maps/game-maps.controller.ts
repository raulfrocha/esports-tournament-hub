import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CustomHttpExceptionFilter } from 'src/custom-http-exception/custom-http-exception.filter';
import { ResponseInterceptor } from 'src/response/response.interceptor';
import { GameMapsService } from './game-maps.service';
import { CreateGameMapDto } from './dto/game-map.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Games - Maps')
@ApiBearerAuth()
@Controller({ path: 'games/:gameId/maps', version: '1' })
@UseFilters(CustomHttpExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtAuthGuard)
export class GameMapsController {
  constructor(private readonly gameMapsService: GameMapsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Cria um novo mapa para um jogo (Admin)' })
  create(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() createGameMapDto: CreateGameMapDto,
  ) {
    return this.gameMapsService.create(gameId, createGameMapDto);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Lista todos os mapas de um jogo' })
  findAllGameMaps(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.gameMapsService.findAll(gameId);
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Busca um mapa por ID' })
  findOne(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.gameMapsService.findOne(id, gameId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Atualiza um mapa (Admin)' })
  partiaUpdate(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<CreateGameMapDto>,
  ) {
    return this.gameMapsService.update(id, body, gameId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Deleta um mapa (Admin)' })
  remove(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.gameMapsService.remove(id, gameId);
  }
}