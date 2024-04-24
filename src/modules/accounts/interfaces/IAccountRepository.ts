import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';

export interface IAccountRepository extends Repository<Account> {}
