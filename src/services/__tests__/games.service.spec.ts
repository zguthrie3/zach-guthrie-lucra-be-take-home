import { GamesService } from "../games.service";

describe('GamesService', () => {
    let gamesService: GamesService;

    const mockGamesRepository = {
        find: jest.fn(() => null),
        findOneBy: jest.fn(() => null),
    };

    const mockGameCellsRepository = {
        findOneBy: jest.fn(() => null),
    };
})