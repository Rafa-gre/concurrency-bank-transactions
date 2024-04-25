import { Controller, Post, Body, Inject } from '@nestjs/common';
import {
  CreateTransactionDto,
  CreateTransactionResponse,
} from '../dto/create-transaction.dto';
import { TransactionsService } from '../services/transactions.service';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    @Inject(TransactionsService)
    private readonly transactionService: TransactionsService,
  ) {}

  @ApiOperation({ summary: 'Create Transaction' })
  @ApiCreatedResponse({
    description: 'Successfully created transaction',
    type: CreateTransactionResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid transaction data' })
  @ApiNotFoundResponse({ description: 'Transaction not found' })
  @ApiForbiddenResponse({ description: 'Insufficient funds' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Post()
  async createTransaction(
    @Body() transaction: CreateTransactionDto,
  ): Promise<CreateTransactionResponse> {
    return await this.transactionService.create(transaction);
  }
}
