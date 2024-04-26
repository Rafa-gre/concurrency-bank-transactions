import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  type: TransactionType;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'origin' })
  origin: Account;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'destination' })
  destination: Account;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;
}
