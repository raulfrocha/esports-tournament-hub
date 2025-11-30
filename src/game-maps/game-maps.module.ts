import { Module } from '@nestjs/common';
import { GameMapsController } from './game-maps.controller';
import { GameMapsService } from './game-maps.service';

@Module({
  controllers: [GameMapsController],
  providers: [GameMapsService]
})
export class GameMapsModule {}
