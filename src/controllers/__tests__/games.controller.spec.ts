import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from '../games.controller';
import { GamesService } from '../../services/games.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Game, GameStatus } from '../../models/entities';
import { CreateGameDto } from '../../models/dto';

describe('GamesController', () => {
  let gamesController: GamesController;
  let gamesService: GamesService;

  const mockGamesRepository = {
    find: jest.fn(() => null),
    findOne: jest.fn(() => null),
    save: jest.fn(() => null)
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        GamesService,
        {
          provide: getRepositoryToken(Game),
          useValue: mockGamesRepository,
        }
      ],
    }).compile();

    gamesController = app.get<GamesController>(GamesController);
    gamesService = app.get<GamesService>(GamesService);
  });

  describe('/games', () => {
    it('should return a list of available games', async () => {
      const data = new Game('123', 100, 200, GameStatus.Pending, []);
      jest.spyOn(gamesService, 'findAllGames').mockImplementation(async () => [data]);

      const result = await gamesController.getAll();
      expect(result).toBeDefined();
      expect(result.count).toBe(1);
      expect(result.games.length).toBe(1);
      expect(result.games[0]).toBe(data);
    });

    it('should return the ID when a new game is successfully created', async () => {
      jest.spyOn(gamesService, 'createGame').mockImplementation(async () => 'new-id-value');

      const result = await gamesController.create(new CreateGameDto(100, 200));
      expect(result).toBeDefined();
      expect(result).toBe('new-id-value');
    });

    describe('/games/{id}', () => {
      let data: Game;
      beforeEach(() => {
        data = new Game('123', 100, 200, GameStatus.Pending, []);
        jest.spyOn(gamesService, 'findOneGame').mockImplementation(async (id) => {
          if (id === '123') {
            return data;
          } else {
            return null;
          }
        });
      })

      it('should return a single game by ID', async () => {
        const result = await gamesController.findOne('123');
        expect(result).toBeDefined();
        expect(result).toBe(data);
      });

      it('should throw a 404 if a game cannot be found by ID', async () => {
        const id = '246e69f9-fb91-4873-be16-486411770326';
        try {
          await gamesController.findOne(id);
          fail('Error - No exception thrown for ID that does not exist');
        } catch (err) {
          expect(err.message).toBe(`Game with id \"${id}\" not found`);
          expect(err.status).toBe(404);
        }
      });
    });
  });
});
