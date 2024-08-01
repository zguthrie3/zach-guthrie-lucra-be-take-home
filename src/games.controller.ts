import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateGameDto } from './models/dto';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly appService: GamesService) {}

  @Get()
  async getAll() {
    return await this.appService.findAllGames(); 
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const game = await this.appService.findOneGame(id);

    if (!game) {
      throw new NotFoundException(`Game with id "${id}" not found`);
    }

    return game;
  }

  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    this.appService.createGame(createGameDto);
  }
}
