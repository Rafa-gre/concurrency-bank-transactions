import { EntityManager, Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

export interface ITransactionRepository extends Repository<Transaction> {
  createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction>;
  saveTransaction(
    transaction: Transaction,
    transactionalEntityManager?: EntityManager,
  ): Promise<Transaction>;
  startEntityTransaction(
    isolationLevel: IsolationLevel,
    callback: (entityManager: EntityManager) => Promise<void>,
  ): Promise<void | EntityManager>;
}
