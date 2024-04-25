import { EntityManager, Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { IAccountsRepository } from '../interfaces/IAccountsRepository';
import { CreateAccountDto } from '../dto/create-account.dto';

export class AccountsRepository
  extends Repository<Account>
  implements IAccountsRepository
{
  async createAccount(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.create(createAccountDto);
    await this.save(account);
    return account;
  }

  async findByAccountNumber(
    accountNumber: number,
    transactionalEntityManager?: EntityManager,
  ): Promise<Account> {
    if (transactionalEntityManager) {
      return await transactionalEntityManager.findOne(Account, {
        where: { accountNumber },
        lock: { mode: 'pessimistic_write' },
      });
    } else {
      return this.findOne({
        where: { accountNumber },
        lock: { mode: 'pessimistic_write' },
      });
    }
  }
  async saveAccount(
    account: Account,
    transactionalEntityManager?: EntityManager,
  ): Promise<Account> {
    if (transactionalEntityManager) {
      return await transactionalEntityManager.save(account);
    } else {
      return this.save(account);
    }
  }
}
