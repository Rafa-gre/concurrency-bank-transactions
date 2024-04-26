import { Controller, Post, Body, Inject, Get, Param } from '@nestjs/common';
import {
  CreateAccountDto,
  CreateAccountResponse,
} from '../dto/create-account.dto';
import { AccountsService } from '../services/accounts.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Accounts')
@Controller('account')
export class AccountsController {
  constructor(
    @Inject(AccountsService)
    private readonly accountsService: AccountsService,
  ) {}

  @ApiOperation({ summary: 'Create account' })
  @ApiCreatedResponse({
    description: 'Successfully created account',
    type: CreateAccountResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid transaction data' })
  @ApiNotFoundResponse({ description: 'Account not found' })
  @ApiForbiddenResponse({ description: 'Insufficient funds' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Post()
  async createAccount(
    @Body() account: CreateAccountDto,
  ): Promise<CreateAccountResponse> {
    return await this.accountsService.create(account);
  }

  @ApiOperation({ summary: 'Create account' })
  @ApiCreatedResponse({
    description: 'Successfully created account',
    type: CreateAccountResponse,
  })
  @ApiNotFoundResponse({ description: 'Account not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.accountsService.findOneAccount(+id);
  }
}
