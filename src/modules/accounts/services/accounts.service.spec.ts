import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { AccountsService, OperationType } from './accounts.service';
import { Account } from '../entities/account.entity';
import { ForbiddenException } from '@nestjs/common';
import { IAccountsRepository } from '../interfaces/IAccountsRepository';
import { AccountsRepository } from '../repository/accounts.repository';

describe('AccountsService', () => {
  let service: AccountsService;
  let repo: IAccountsRepository;

  beforeEach(async () => {
    const repoMock = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: 'IAccountsRepository',
          useValue: new AccountsRepository(repoMock as any),
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    repo = module.get<IAccountsRepository>('IAccountsRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const account = new Account();
      account.balance = 1000;
      account.accountNumber = 123456;

      jest.spyOn(repo, 'createAccount').mockResolvedValue({
        accountNumber: 123456,
        balance: 1000,
      });

      const result = await service.create({ balance: 1000 });

      expect(result).toEqual({
        accountNumber: account.accountNumber,
        balance: account.balance,
      });
    });
  });

  describe('updateBalance', () => {
    it('should update the balance of an account', async () => {
      const account = new Account();
      account.balance = 1000;

      jest.spyOn(repo, 'findByAccountNumber').mockResolvedValue(account);
      jest.spyOn(repo, 'saveAccount').mockImplementation((updatedAccount) => {
        account.balance = updatedAccount.balance;
        return Promise.resolve(account);
      });

      const transactionManagerMock = {
        findOne: jest.fn().mockResolvedValue(account),
        save: jest.fn().mockResolvedValue(account),
      } as unknown as EntityManager;

      await service.updateBalance(
        account.accountNumber,
        500,
        OperationType.ADD,
        transactionManagerMock,
      );

      expect(account.balance).toEqual(1500);
    });

    it('should throw an error if the account does not have sufficient funds', async () => {
      const account = new Account();
      account.balance = 1000;

      jest
        .spyOn(repo, 'findByAccountNumber')
        .mockResolvedValue({ balance: 500 } as Account);

      const transactionManagerMock = {
        findOne: jest.fn().mockResolvedValue(account),
        save: jest.fn().mockResolvedValue(account),
      } as unknown as EntityManager;

      await expect(
        service.updateBalance(
          account.accountNumber,
          1500,
          OperationType.SUBTRACT,
          transactionManagerMock,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
