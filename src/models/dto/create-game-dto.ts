import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGameDto {
    @IsNotEmpty()
    @IsNumber()
    rows: number;

    @IsNumber()
    @IsNotEmpty()
    columns: number;
}