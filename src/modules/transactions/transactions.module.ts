import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
