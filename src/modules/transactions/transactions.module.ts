import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './controller/transactions.controller';
import { TransactionsService } from './services/transactions.service';
import { Transaction } from './entities/transaction.entity';
import { AccountsService } from '../accounts/services/accounts.service';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Account])],
  controllers: [TransactionsController],
  providers: [TransactionsService, AccountsService],
})
export class TransactionsModule {}
