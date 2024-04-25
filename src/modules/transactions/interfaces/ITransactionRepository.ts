import { EntityManager } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

export interface ITransactionRepository {
  createTransaction(createTransactionDto: CreateTransactionDto): Transaction;
  saveTransaction(
    transaction: Transaction,
    transactionalEntityManager?: EntityManager,
  ): Promise<Transaction>;
  startEntityTransaction(
    isolationLevel: IsolationLevel,
    callback: (entityManager: EntityManager) => Promise<void>,
  ): Promise<void | EntityManager>;
}
