import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Game, GameCell } from './models/entities';
import { CreateGameDto } from './models/dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,

    @InjectRepository(GameCell)
    private gameCellsRepository: Repository<GameCell>,
  ) {}

  async findOneGame(id: string) {
    return this.gamesRepository.findOneBy({ id });
  }

  async findAllGames() {
    return this.gamesRepository.find();
  }

  async createGame(gameDto: CreateGameDto) {
    // First we create the Game object itself, using the rows and columns provided from the DTO.
    let game = new Game(gameDto.rows, gameDto.columns);

    // Next we need to generate the cells. We also want to connect the one-to-many relationship between Game and GameCell.
    game.cells = this.generateCells(game, gameDto.rows, gameDto.columns);

    for (let cell of game.cells) {
      console.log(`Cell content\t|\tX: ${cell.xCoordinate}\t|\tY: ${cell.yCoordinate}\t|\tMine? ${cell.isMine}\t|\tNeighboring Bomb Count: ${cell.neighboringBombCount}`)
    }

    // Now we create the row for the game and insert it into the DB. Because we have added cascade parameters to the entity relationship,
    // this will automatically add entities for all of the new cells as well.
    await this.gamesRepository.save(game);
  }

  private generateCells(game: Game, rows: number, columns: number): GameCell[] {
    /**
     * Rate based on the average difficulty of standard Minesweeper levels in the Windows edition.
     * 
     * Beginner: 81 tiles, 10 mines, 12.3% mine rate
     * Intermediate: 256 tiles, 40 mines, 15.6% mine rate
     * Expert: 480 tiles, 99 mines, 20.6% mine rate
     * 
     * We use this rate to calculate the total number of mines that will be randomly placed in the game.
     **/
    const mineRate = 0.162;
    const numCells = rows * columns;
    const totalMines = Math.floor(numCells * mineRate);

    // Threshold for passing the randomization check for marking a cell as a mine. 
    let threshold = 0.2;
    let mineCount = 0;
    let isMine = false;
    
    let cells: GameCell[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < rows; x++) {
        /**
         * To randomize the mines, we add a rudimentary randomness check. The check starts at a 20% success rate,
         * and increases the success chance by 20% for every failure. This value is based on a mine rate of 16.2%.
         * When a mine is placed in the grid, the success rate resets to 20%. This helps to distribute mines
         * throughout the entire grid, and guarantees we will always have the number of mines calculated by the mine rate.
         */
        isMine = mineCount < totalMines && Math.random() < threshold;
        cells.push(new GameCell(game, x, y, isMine));

        if (mineCount < totalMines) {
          if (isMine) {
            threshold = 0.2;
          } else {
            threshold += 0.2;
          }
        }
      }
    }

    // Finally, we use a mapping function to calculate the number of neighboring bombs for each cell.
    return this.calculateNeighboringBombs(cells, rows, columns);
  }

  private calculateNeighboringBombs(cells: GameCell[], rows: number, columns: number) {
    return cells.map(cell => {
      let x = cell.xCoordinate;
      let y = cell.yCoordinate;
      let count = 0;
      let neighbor: GameCell;

      // Array order starts with NW neighbor and goes clockwise around the current cell
      const coordinates = [
        [x - 1, y - 1],
        [x, y - 1],
        [x + 1, y - 1],
        [x + 1, y],
        [x + 1, y + 1],
        [x, y + 1],
        [x - 1, y + 1],
        [x - 1, y]
      ]
      count = 0;
      // This value only needs to be calculated for cells that do not contain mines.
      x = cell.xCoordinate;
      y = cell.yCoordinate;

      if (!cell.isMine) {
        /** 
         * There are 8 specific pairs of coordinates for a cell's neighbor. We need to check each one and ensure the following criteria:
         * 
         * 1. The coordinates provided represent a valid cell (calculated by comparing x and y against row/col counts)
         * 2. The neighbor has a mine (determined by identifying the cell in the array and checking its property)
         * 
         * The count is then set to the total number of cells containing mines. 
         **/
        
        for (let coord of coordinates) {
          // If neither x nor y is out of bounds, we know that the coordinate represents a valid cell.
          if (!(
            coord[0] < 0 ||
            coord[0] == rows ||
            coord[1] < 0 ||
            coord[1] == columns
          )) {
            // Because the cells were put into the array in sequential order, we can use the X and Y coordinates to identify
            // the index of the neighbor cell. Once we find the cell, we check if it contains a mine, and update the count.
            neighbor = cells[coord[1] * columns + coord[0]]
            if (neighbor.isMine) {
              count++;
            }
          }
        }
      }
      cell.neighboringBombCount = count;
      return cell;
    });
  }
}
