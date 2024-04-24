import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';

export type TransactionType = 'deposit' | 'withdraw' | 'transfer';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  type: TransactionType;

  @ManyToOne(() => Account, { nullable: true })
  origin: Account;

  @ManyToOne(() => Account, { nullable: true })
  destination: Account;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;
}
