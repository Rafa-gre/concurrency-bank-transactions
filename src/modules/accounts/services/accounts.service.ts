import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../entities/account.entity';
import { IAccountRepository } from '../interfaces/IAccountRepository';
import { CreateAccountDto } from '../dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: IAccountRepository,
  ) {}
  create(createAccountDto: CreateAccountDto) {
    this.accountsRepository.create(createAccountDto);
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }
}
