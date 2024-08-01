import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { GameCell } from './game-cell.entity';

export enum GameStatus {
  Pending = 'PENDING',
  Cleared = 'CLEARED',
  Detonated = 'DETONATED',
}

@Entity({ name: 'games' })
export class Game {
  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: GameStatus,
    enumName: 'permission_enum',
    default: GameStatus.Pending,
  })
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
