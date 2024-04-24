import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: '.env.local',
      isGlobal: true,
    }),
    AccountsModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
