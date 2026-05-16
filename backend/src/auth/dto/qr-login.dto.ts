import { IsString } from 'class-validator';
export class QrLoginDto {
  @IsString() userId: string;
  @IsString() secret: string;
}