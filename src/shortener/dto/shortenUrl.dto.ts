import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ShortenUrlDTO {
    @IsNotEmpty()
    @IsString()
    originalUrl: string;

    @IsOptional()
    userId?: number;
}
