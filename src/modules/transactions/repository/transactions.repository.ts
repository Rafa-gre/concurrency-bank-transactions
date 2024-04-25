import { EntityManager, Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { ITransactionRepository } from '../interfaces/ITransactionRepository';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

export class TransactionsRepository
  extends Repository<Transaction>
  implements ITransactionRepository
{
  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const transaction = this.create(createTransactionDto);
    return transaction;
  }

  async saveTransaction(
    transaction: Transaction,
    transactionalEntityManager?: EntityManager,
  ): Promise<Transaction> {
    if (transactionalEntityManager) {
      return await transactionalEntityManager.save(transaction);
    } else {
      return this.save(transaction);
    }
  }

  async startEntityTransaction(
    isolationLevel: IsolationLevel,
    callback: (entityManager: EntityManager) => Promise<void>,
  ): Promise<void | EntityManager> {
    return this.manager.transaction(isolationLevel, callback);
  }
}
