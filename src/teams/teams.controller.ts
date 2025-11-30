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
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CustomHttpExceptionFilter } from 'src/custom-http-exception/custom-http-exception.filter';
import { ResponseInterceptor } from 'src/response/response.interceptor';
import { TeamsService } from './teams.service';
import { CreateTeamDto, TeamCreationData } from './dto/create-team.dto';
import { CaptainGuard } from './captain/captain.guard';

@Controller('teams')
@UseFilters(CustomHttpExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  create(@Body() createTeamDto: CreateTeamDto, @Req() req: any) {
    const captainId = req.user.id;

    const teamData: TeamCreationData = {
      ...createTeamDto,
      captainId: captainId,
    };

    return this.teamsService.create(teamData);
  }

  @Get()
  @HttpCode(200)
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: number) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(CaptainGuard)
  update(
    @Param('id') id: number,
    @Body() updateTeamDto: Partial<CreateTeamDto>,
  ) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(CaptainGuard)
  remove(@Param('id') id: number) {
    return this.teamsService.remove(id);
  }

  @Post(':teamId/players/:userId')
  @HttpCode(200)
  @UseGuards(CaptainGuard)
  addTeamMember(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.teamsService.addTeamMember(teamId, userId);
  }

  @Delete(':teamId/players/:userId')
  @HttpCode(200)
  @UseGuards(CaptainGuard)
  removeTeamMember(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.teamsService.removeTeamMember(teamId, userId);
  }
}
