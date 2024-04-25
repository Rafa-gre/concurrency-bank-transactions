import { EntityManager, Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { IAccountsRepository } from '../interfaces/IAccountsRepository';
import { CreateAccountDto } from '../dto/create-account.dto';
import { InjectRepository } from '@nestjs/typeorm';

export class AccountsRepository implements IAccountsRepository {
  constructor(
    @InjectRepository(Account)
    private readonly typeormRepository: Repository<Account>,
  ) {}
  async createAccount(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.typeormRepository.create(createAccountDto);
    await this.typeormRepository.save(account);
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
      return this.typeormRepository.findOne({
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
      return this.typeormRepository.save(account);
    }
  }
}
