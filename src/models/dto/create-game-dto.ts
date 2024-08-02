import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGameDto {
    constructor(rows: number, columns: number) {
        this.rows = rows;
        this.columns = columns;
    }

    @IsNotEmpty()
    @IsNumber()
    rows: number;

    @IsNumber()
    @IsNotEmpty()
    columns: number;
}