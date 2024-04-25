import { Module } from '@nestjs/common';
import { AccountsService } from './services/accounts.service';
import { AccountsController } from './controller/accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AccountsRepository } from './repository/accounts.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Account, AccountsRepository])],
  controllers: [AccountsController],
  providers: [
    AccountsService,
    { provide: 'IAccountsRepository', useClass: AccountsRepository },
  ],
})
export class AccountsModule {}
