import { EntityManager, Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { ITransactionRepository } from '../interfaces/ITransactionRepository';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { InjectRepository } from '@nestjs/typeorm';

export class TransactionsRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly typeormRepository: Repository<Transaction>,
  ) {}

  public createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Transaction {
    const transaction = this.typeormRepository.create(createTransactionDto);
    return transaction;
  }

  public async saveTransaction(
    transaction: Transaction,
    transactionalEntityManager?: EntityManager,
  ): Promise<Transaction> {
    if (transactionalEntityManager) {
      return await transactionalEntityManager.save(transaction);
    } else {
      return this.typeormRepository.save(transaction);
    }
  }

  public async startEntityTransaction(
    isolationLevel: IsolationLevel,
    callback: (entityManager: EntityManager) => Promise<void>,
  ): Promise<void | EntityManager> {
    return this.typeormRepository.manager.transaction(isolationLevel, callback);
  }
}
