import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';
import { GameCell } from './game-cell.entity';

export enum GameStatus {
  Pending = 'PENDING',
  Cleared = 'CLEARED',
  Detonated = 'DETONATED',
}

@Entity({ name: 'games' })
export class Game {
  // We want a fully fleshed out constructor for testing purposes to easily specify every Game property
  constructor(id: string, rows: number, columns: number, status: GameStatus, cells: GameCell[]) {
    this.id = id;
    this.rows = rows;
    this.columns = columns;
    this.status = status;
    this.cells = cells;
  }

  // Since the main use case for creating a game will only provide rows and columns, we've created a convenience method
  // to call the constructor with only this info
  static RowsAndColumnOnly(rows: number, columns: number) {
    return new Game(undefined, rows, columns, undefined, undefined);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: GameStatus,
    enumName: 'permission_enum',
    default: GameStatus.Pending,
  })
  @JoinColumn()
  status: GameStatus;

  @OneToMany(() => GameCell, (cell) => cell.game, {
    cascade: true
  })
  cells: GameCell[];

  @Column()
  rows: number;

  @Column()
  columns: number;
}
