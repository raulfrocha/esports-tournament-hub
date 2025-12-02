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
import { CustomHttpExceptionFilter } from 'src/custom-http-exception/custom-http-exception.filter';
import { ResponseInterceptor } from 'src/response/response.interceptor';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';

@ApiTags('Games')
@ApiBearerAuth()
@Controller({ path: 'games', version: '1' })
@UseFilters(CustomHttpExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(201)
  @ApiOperation({ summary: 'Cria um novo jogo (Admin)' })
  @ApiResponse({ status: 201, description: 'Jogo criado.' })
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Public()
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Lista todos os jogos (rota pública)' })
  findAllGames() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  @Roles(Role.ADMIN, Role.PLAYER)
  @ApiOperation({ summary: 'Busca um jogo por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualiza parcialmente um jogo (Admin)' })
  partiaUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<CreateGameDto>,
  ) {
    return this.gamesService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deleta um jogo (Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.remove(id);
  }
}