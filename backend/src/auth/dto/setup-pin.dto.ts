import { IsString } from 'class-validator';
export class SetupPinDto { @IsString() pin: string; }
