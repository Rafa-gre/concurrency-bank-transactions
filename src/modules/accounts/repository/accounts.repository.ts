import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';

export class AccountsRepository
  extends Repository<Account>
  implements AccountsRepository {}
