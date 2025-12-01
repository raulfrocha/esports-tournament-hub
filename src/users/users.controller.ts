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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { QueryFilterDto } from './dto/query-filter.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OwnerGuard } from 'src/auth/owner.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Cria um novo usuário (Registro público)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lista todos os usuários (Requer autenticação)' })
  findAllUsers(@Query() queryFilter: QueryFilterDto) {
    return this.usersService.findAll(queryFilter.filter, queryFilter.page);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Busca um usuário por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Atualização completa do perfil (Dono ou Admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Atualização parcial do perfil (Dono ou Admin)' })
  partiaUpdate(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto){
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Deleta o usuário (Dono ou Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}