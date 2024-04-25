import { EntityManager } from 'typeorm';
import { Account } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';

export interface IAccountsRepository {
  createAccount(createAccountDto: CreateAccountDto): Promise<Account>;
  findByAccountNumber(
    accountNumber: number,
    transactionalEntityManager?: EntityManager,
  ): Promise<Account>;
  saveAccount(
    account: Account,
    transactionalEntityManager?: EntityManager,
  ): Promise<Account>;
}
