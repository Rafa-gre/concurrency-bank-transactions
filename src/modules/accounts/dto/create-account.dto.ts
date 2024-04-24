import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Balance of the account',
    type: 'number',
    example: 100,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Balance must be a number' })
  balance: number;
}

export class CreateAccountResponse {
  @ApiProperty({
    description: 'account number',
    type: 'number',
    example: 123,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Balance must be a number' })
  accountNumber: number;

  @ApiProperty({
    description: 'Balance of the account',
    type: 'number',
    example: 100,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Balance must be a number' })
  balance: number;
}
