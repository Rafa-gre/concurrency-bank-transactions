import { Controller, Post, Body, Inject } from '@nestjs/common';
import {
  CreateAccountDto,
  CreateAccountResponse,
} from '../dto/create-account.dto';
import { AccountsService } from '../services/accounts.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Accounts')
@Controller('accounts')
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
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Post()
  async createAccount(
    @Body() account: CreateAccountDto,
  ): Promise<CreateAccountResponse> {
    return await this.accountsService.create(account);
  }
}
