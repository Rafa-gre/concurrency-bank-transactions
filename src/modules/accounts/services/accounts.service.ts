import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../entities/account.entity';
import { IAccountRepository } from '../interfaces/IAccountRepository';
import {
  CreateAccountDto,
  CreateAccountResponse,
} from '../dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: IAccountRepository,
  ) {}
  async create(
    createAccountDto: CreateAccountDto,
  ): Promise<CreateAccountResponse> {
    const account = this.accountsRepository.create(createAccountDto);
    await this.accountsRepository.save(account);
    return {
      accountNumber: account.accountNumber,
      balance: account.balance,
    };
  }
}
