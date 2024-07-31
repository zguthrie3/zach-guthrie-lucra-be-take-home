import { IsNotEmpty } from 'class-validator';

export class CreateGameDto {
    @IsNotEmpty()
    rows: number;

    @IsNotEmpty()
    columns: number;
}