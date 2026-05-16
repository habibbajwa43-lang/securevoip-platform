import { IsString, IsEmail } from 'class-validator';
export class PinLoginDto {
  @IsEmail() email: string;
  @IsString() pin: string;
}