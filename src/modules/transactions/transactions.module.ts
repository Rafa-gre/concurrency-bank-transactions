import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './controller/transactions.controller';
import { TransactionsService } from './services/transactions.service';
import { Transaction } from './entities/transaction.entity';
import { AccountsService } from '../accounts/services/accounts.service';
import { Account } from '../accounts/entities/account.entity';
import { AccountsRepository } from '../accounts/repository/accounts.repository';
import { TransactionsRepository } from './repository/transactions.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Account,
      TransactionsRepository,
      AccountsRepository,
    ]),
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    AccountsService,
    { provide: 'IAccountsRepository', useClass: AccountsRepository },
    { provide: 'ITransactionRepository', useClass: TransactionsRepository },
  ],
})
export class TransactionsModule {}
