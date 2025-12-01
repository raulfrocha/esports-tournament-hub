import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { UsersModule } from './users/users.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { TeamsModule } from './teams/teams.module';
import { GameMapsModule } from './game-maps/game-maps.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { MatchesModule } from './matches/matches.module';
import { RankingModule } from './ranking/ranking.module';

@Module({
  imports: [
    SharedModule,
    CoreModule,
    UsersModule,
    PrismaModule,
    AuthModule,
    GamesModule,
    TeamsModule,
    GameMapsModule,
    TournamentsModule,
    MatchesModule,
    RankingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'games', method: RequestMethod.GET },
        { path: 'games/:id', method: RequestMethod.GET },
        { path: 'tournaments', method: RequestMethod.GET },
        { path: 'tournaments/:id', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
// O AppModule é o módulo raiz da aplicação NestJS. Ele importa o SharedModule e o CoreModule, e também declara o AppController e o AppService como controladores e provedores, respectivamente. O AppModule serve como o ponto de entrada para a aplicação, organizando os diferentes módulos e serviços necessários para o funcionamento da aplicação.
