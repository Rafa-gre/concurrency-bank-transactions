import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ITransactionRepository } from '../interfaces/ITransactionRepository';
import { TransactionType } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import {
  AccountsService,
  OperationType,
} from '../../accounts/services/accounts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('ITransactionRepository')
    private transactionsRepository: ITransactionRepository,
    @Inject(AccountsService)
    private accountService: AccountsService,
  ) {}
  async create(createTransactionDto: CreateTransactionDto) {
    switch (createTransactionDto.type) {
      case TransactionType.DEPOSIT:
        return this.createDeposit(createTransactionDto);
      case TransactionType.WITHDRAW:
        return this.createWithdraw(createTransactionDto);
      case TransactionType.TRANSFER:
        return this.createTransfer(createTransactionDto);
      default:
        throw new BadRequestException('Invalid transaction type');
    }
  }

  async createDeposit(createTransactionDto: CreateTransactionDto) {
    const { destinationId, amount } = createTransactionDto;
    if (!destinationId || !amount || amount <= 0) {
      throw new BadRequestException('Invalid transaction data');
    }
    const transaction =
      this.transactionsRepository.createTransaction(createTransactionDto);

    let retries = 3;
    while (retries) {
      try {
        await this.transactionsRepository.startEntityTransaction(
          'SERIALIZABLE',
          async (transactionalEntityManager: EntityManager) => {
            await transactionalEntityManager.save(transaction);
            await this.accountService.updateBalance(
              destinationId,
              amount,
              OperationType.ADD,
              transactionalEntityManager,
            );
          },
        );
        break;
      } catch (error) {
        if (error.code === '40001' && retries) {
          retries--;
        } else {
          console.log('AAAAAAAAAAAAAAA', error);
          throw new ConflictException('Conflict Error');
        }
      }
    }
    return transaction;
  }
  async createWithdraw(createTransactionDto: CreateTransactionDto) {
    const { originId, amount } = createTransactionDto;
    if (!originId || !amount || amount <= 0) {
      throw new BadRequestException('Invalid transaction data');
    }
    const transaction =
      this.transactionsRepository.createTransaction(createTransactionDto);

    let retries = 3;
    while (retries) {
      try {
        await this.transactionsRepository.startEntityTransaction(
          'SERIALIZABLE',
          async (transactionalEntityManager: EntityManager) => {
            await transactionalEntityManager.save(transaction);
            await this.accountService.updateBalance(
              originId,
              amount,
              OperationType.SUBTRACT,
              transactionalEntityManager,
            );
          },
        );
        break;
      } catch (error) {
        if (error.code === '40001' && retries) {
          retries--;
        } else {
          throw new ConflictException('Conflict Error');
        }
      }
    }
    return transaction;
  }
  async createTransfer(createTransactionDto: CreateTransactionDto) {
    const { originId, destinationId, amount } = createTransactionDto;
    if (!originId || !destinationId || !amount || amount <= 0) {
      throw new BadRequestException('Invalid transaction data');
    }
    const transaction =
      this.transactionsRepository.createTransaction(createTransactionDto);

    let retries = 3;
    while (retries) {
      try {
        await this.transactionsRepository.startEntityTransaction(
          'SERIALIZABLE',
          async (transactionalEntityManager: EntityManager) => {
            await transactionalEntityManager.save(transaction);
            await this.accountService.updateBalance(
              originId,
              amount,
              OperationType.SUBTRACT,
              transactionalEntityManager,
            );
            await this.accountService.updateBalance(
              destinationId,
              amount,
              OperationType.ADD,
              transactionalEntityManager,
            );
          },
        );
        break;
      } catch (error) {
        if (error.code === '40001' && retries) {
          retries--;
        } else {
          throw new ConflictException('Conflict Error');
        }
      }
    }
    return transaction;
  }
}
