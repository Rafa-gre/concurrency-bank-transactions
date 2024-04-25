import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateAccountDto,
  CreateAccountResponse,
} from '../dto/create-account.dto';
import { EntityManager } from 'typeorm';
import { IAccountsRepository } from '../interfaces/IAccountsRepository';

export enum OperationType {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
}
@Injectable()
export class AccountsService {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}
  async create(
    createAccountDto: CreateAccountDto,
  ): Promise<CreateAccountResponse> {
    const account =
      await this.accountsRepository.createAccount(createAccountDto);
    return {
      accountNumber: account.accountNumber,
      balance: account.balance,
    };
  }

  async updateBalance(
    accountId: number,
    amount: number,
    operation: OperationType,
    transactionalEntityManager: EntityManager,
  ): Promise<void> {
    const account = await this.accountsRepository.findByAccountNumber(
      accountId,
      transactionalEntityManager,
    );

    if (!account) {
      throw new NotFoundException('Account not found');
    }
    const operations = {
      [OperationType.ADD]: () => (account.balance += amount),
      [OperationType.SUBTRACT]: () => {
        if (account.balance < amount) {
          throw new ForbiddenException('Insufficient funds');
        }
        account.balance -= amount;
      },
    };

    const executeOperation = operations[operation];

    if (!executeOperation) {
      throw new BadRequestException('Invalid operation');
    }

    executeOperation();

    await this.accountsRepository.saveAccount(
      account,
      transactionalEntityManager,
    );
  }
}
