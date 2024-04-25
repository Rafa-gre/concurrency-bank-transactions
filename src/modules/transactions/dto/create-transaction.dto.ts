import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Type of transaction',
    example: 'deposit',
    enum: TransactionType,
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ description: 'Origin account id', example: 1, type: 'number' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  originId?: number;

  @ApiProperty({
    description: 'Destination account id',
    example: 1,
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  destinationId?: number;

  @ApiProperty({ description: 'Value', example: 100, type: 'number' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
