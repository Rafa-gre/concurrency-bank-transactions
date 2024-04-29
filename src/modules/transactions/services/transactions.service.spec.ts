import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { AccountsService } from '../../accounts/services/accounts.service';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { TransactionsRepository } from '../repository/transactions.repository';
import { createMock } from '@golevelup/ts-jest';
import { AccountsRepository } from '../../accounts/repository/accounts.repository';
import { ITransactionRepository } from '../interfaces/ITransactionRepository';

describe('TransactionsService', () => {
  let service: TransactionsService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repo: ITransactionRepository;
  let accountsService: AccountsService;

  beforeEach(async () => {
    const transactionMock = new Transaction();
    const mockManager = {
      transaction: jest
        .fn()
        .mockImplementation((isolationLevel, runInTransaction) =>
          runInTransaction(mockManager),
        ),
      save: jest.fn().mockResolvedValue(transactionMock),
      findOne: jest.fn().mockResolvedValue(transactionMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: 'ITransactionRepository',
          useValue: createMock<TransactionsRepository>(),
        },
        {
          provide: 'IAccountsRepository',
          useValue: createMock<AccountsRepository>(),
        },
        AccountsService,
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repo = module.get<ITransactionRepository>('ITransactionRepository');
    accountsService = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a deposit transaction', async () => {
      const transaction = await service.create({
        type: TransactionType.DEPOSIT,
        destinationId: 1,
        amount: 1000,
      });

      expect(transaction).toBeDefined();
    });

    it('should create a withdraw transaction', async () => {
      const transaction = await service.create({
        type: TransactionType.WITHDRAW,
        originId: 1,
        amount: 1000,
      });

      expect(transaction).toBeDefined();
    });

    it('should create a transfer transaction', async () => {
      const transaction = await service.create({
        type: TransactionType.TRANSFER,
        originId: 1,
        destinationId: 2,
        amount: 1000,
      });

      expect(transaction).toBeDefined();
    });

    it('should throw an error for invalid transaction data', async () => {
      try {
        await service.create({
          type: 'INVALID_TYPE' as TransactionType,
          originId: 1,
          destinationId: 2,
          amount: 1000,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid transaction type');
      }
    });
  });

  describe('createDeposit', () => {
    it('should create a deposit transaction', async () => {
      const transaction = new Transaction();
      transaction.amount = 1000;
      transaction.destination = { accountNumber: 1, balance: 0 };

      const mockManager = {
        transaction: jest
          .fn()
          .mockImplementation((isolationLevel, runInTransaction) =>
            runInTransaction(mockManager),
          ),
        save: jest.fn().mockResolvedValue(transaction),
      };

      const repo = {
        createTransaction: jest.fn().mockReturnValue(transaction),
        saveTransaction: jest.fn().mockResolvedValue(transaction),
        startEntityTransaction: jest.fn().mockResolvedValue(mockManager),
      } as unknown as ITransactionRepository;

      jest.spyOn(accountsService, 'updateBalance').mockResolvedValue(undefined);

      const service = new TransactionsService(repo, accountsService);

      const result = await service.createDeposit({
        type: TransactionType.DEPOSIT,
        destinationId: 1,
        amount: 1000,
      });

      expect(result).toEqual(transaction);
    });
    it('should throw BadRequestException when destinationId is null', async () => {
      try {
        await service.createDeposit({
          type: TransactionType.DEPOSIT,
          destinationId: null,
          amount: 1000,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid transaction data');
      }
    });

    it('should throw BadRequestException when amount is null', async () => {
      try {
        await service.createDeposit({
          type: TransactionType.DEPOSIT,
          destinationId: 1,
          amount: null,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid transaction data');
      }
    });

    it('should throw BadRequestException when amount is less than or equal to zero', async () => {
      try {
        await service.createDeposit({
          type: TransactionType.DEPOSIT,
          destinationId: 1,
          amount: 0,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid transaction data');
      }
    });

    it('should retry and succeed when transaction fails with error code 40001', async () => {
      const transaction = new Transaction();
      transaction.amount = 1000;
      transaction.destination = { accountNumber: 1, balance: 0 };

      const mockManager = {
        transaction: jest
          .fn()
          .mockImplementationOnce(() => {
            throw { code: '40001' };
          })
          .mockImplementation((isolationLevel, runInTransaction) =>
            runInTransaction(mockManager),
          ),
        save: jest.fn().mockResolvedValue(transaction),
      };

      const repo = {
        createTransaction: jest.fn().mockReturnValue(transaction),
        saveTransaction: jest.fn().mockResolvedValue(transaction),
        startEntityTransaction: jest.fn().mockResolvedValue(mockManager),
      } as unknown as ITransactionRepository;

      jest.spyOn(accountsService, 'updateBalance').mockResolvedValue(undefined);

      const service = new TransactionsService(repo as any, accountsService);

      const result = await service.createDeposit({
        type: TransactionType.DEPOSIT,
        destinationId: 1,
        amount: 1000,
      });

      expect(result).toEqual(transaction);
    });

    it('should throw ConflictException when transaction fails with error code 40001 after all retries', async () => {
      const transaction = new Transaction();
      transaction.amount = 1000;
      transaction.destination = { accountNumber: 1, balance: 0 };

      const mockManager = {
        transaction: jest.fn().mockImplementation(() => {
          throw { code: '40001' };
        }),
        save: jest.fn().mockResolvedValue(transaction),
      };

      const repo = {
        createTransaction: jest.fn().mockReturnValue(transaction),
        saveTransaction: jest.fn().mockResolvedValue(transaction),
        startEntityTransaction: jest.fn().mockResolvedValue(mockManager),
      } as unknown as ITransactionRepository;

      jest.spyOn(accountsService, 'updateBalance').mockResolvedValue(undefined);

      const service = new TransactionsService(repo as any, accountsService);

      try {
        await service.createDeposit({
          type: TransactionType.DEPOSIT,
          destinationId: 1,
          amount: 1000,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe(
          'Transaction could not be completed after 3 retries',
        );
      }
    });
  });

  describe('createWithdraw', () => {
    it('should create a withdraw transaction', async () => {
      const transaction = new Transaction();
      transaction.amount = 1000;
      transaction.origin = { accountNumber: 1, balance: 0 };

      const mockManager = {
        transaction: jest
          .fn()
          .mockImplementation((isolationLevel, runInTransaction) =>
            runInTransaction(mockManager),
          ),
        save: jest.fn().mockResolvedValue(transaction),
      };

      const repo = {
        createTransaction: jest.fn().mockReturnValue(transaction),
        saveTransaction: jest.fn().mockResolvedValue(transaction),
        startEntityTransaction: jest.fn().mockResolvedValue(mockManager),
      } as unknown as ITransactionRepository;

      jest.spyOn(accountsService, 'updateBalance').mockResolvedValue(undefined);

      const service = new TransactionsService(repo, accountsService);

      const result = await service.createWithdraw({
        type: TransactionType.WITHDRAW,
        originId: 1,
        amount: 1000,
      });

      expect(result).toEqual(transaction);
    });
    it('should throw BadRequestException when originId is null', async () => {
      try {
        await service.createWithdraw({
          type: TransactionType.WITHDRAW,
          originId: null,
          amount: 1000,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid transaction data');
      }
    });

    it('should throw BadRequestException when amount is null', async () => {
      try {
        await service.createWithdraw({
          type: TransactionType.WITHDRAW,
          originId: 1,
          amount: null,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid transaction data');
      }
    });

    it('should throw BadRequestException when amount is less than or equal to zero', async () => {
      try {
        await service.createWithdraw({
          type: TransactionType.WITHDRAW,
          originId: 1,
          amount: 0,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid transaction data');
      }
    });

    it('should retry and succeed when transaction fails with error code 40001', async () => {
      const transaction = new Transaction();
      transaction.amount = 1000;
      transaction.origin = { accountNumber: 1, balance: 1000 };

      const mockManager = {
        transaction: jest
          .fn()
          .mockImplementationOnce(() => {
            throw { code: '40001' };
          })
          .mockImplementation((isolationLevel, runInTransaction) =>
            runInTransaction(mockManager),
          ),
        save: jest.fn().mockResolvedValue(transaction),
      };

      const repo = {
        createTransaction: jest.fn().mockReturnValue(transaction),
        saveTransaction: jest.fn().mockResolvedValue(transaction),
        startEntityTransaction: jest.fn().mockResolvedValue(mockManager),
      } as unknown as ITransactionRepository;

      jest.spyOn(accountsService, 'updateBalance').mockResolvedValue(undefined);

      const service = new TransactionsService(repo, accountsService);

      const result = await service.createWithdraw({
        type: TransactionType.WITHDRAW,
        originId: 1,
        amount: 1000,
      });

      expect(result).toEqual(transaction);
    });

    it('should throw ConflictException when transaction fails with error code 40001 after all retries', async () => {
      const transaction = new Transaction();
      transaction.amount = 1000;
      transaction.origin = { accountNumber: 1, balance: 1000 };

      const mockManager = {
        transaction: jest.fn().mockImplementation(() => {
          throw { code: '40001' };
        }),
        save: jest.fn().mockResolvedValue(transaction),
      };

      const repo = {
        createTransaction: jest.fn().mockReturnValue(transaction),
        saveTransaction: jest.fn().mockResolvedValue(transaction),
        startEntityTransaction: jest.fn().mockResolvedValue(mockManager),
      } as unknown as ITransactionRepository;

      jest.spyOn(accountsService, 'updateBalance').mockResolvedValue(undefined);

      const service = new TransactionsService(repo, accountsService);

      try {
        await service.createWithdraw({
          type: TransactionType.WITHDRAW,
          originId: 1,
          amount: 1000,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe(
          'Transaction could not be completed after 3 retries',
        );
      }
    });
  });

  describe('createTransfer', () => {
    it('should create a transfer transaction', async () => {
      const transaction = new Transaction();
      transaction.amount = 1000;
      transaction.origin = { accountNumber: 1, balance: 0 };
      transaction.destination = { accountNumber: 1, balance: 0 };

      const mockManager = {
        transaction: jest
          .fn()
          .mockImplementation((isolationLevel, runInTransaction) =>
            runInTransaction(mockManager),
          ),
        save: jest.fn().mockResolvedValue(transaction),
      };

      const repo = {
        createTransaction: jest.fn().mockReturnValue(transaction),
        saveTransaction: jest.fn().mockResolvedValue(transaction),
        startEntityTransaction: jest.fn().mockResolvedValue(mockManager),
      } as unknown as ITransactionRepository;

      jest.spyOn(accountsService, 'updateBalance').mockResolvedValue(undefined);

      const service = new TransactionsService(repo, accountsService);

      const result = await service.createTransfer({
        type: TransactionType.TRANSFER,
        originId: 1,
        destinationId: 2,
        amount: 1000,
      });

      expect(result).toEqual(transaction);
    });
    it('should throw BadRequestException when originId is null', async () => {
      try {
        await service.createTransfer({
          type: TransactionType.TRANSFER,
          originId: null,
          destinationId: 1,
          amount: 1000,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid transaction data');
      }
    });

    it('should throw BadRequestException when destinationId is null', async () => {
      try {
        await service.createTransfer({
          type: TransactionType.TRANSFER,
          originId: 1,
          destinationId: null,
          amount: 1000,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid transaction data');
      }
    });

    it('should throw BadRequestException when amount is null', async () => {
      try {
        await service.createTransfer({
          type: TransactionType.TRANSFER,
          originId: 1,
          destinationId: 2,
          amount: null,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid transaction data');
      }
    });

    it('should throw BadRequestException when amount is less than or equal to zero', async () => {
      try {
        await service.createTransfer({
          type: TransactionType.TRANSFER,
          originId: 1,
          destinationId: 2,
          amount: 0,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Invalid transaction data');
      }
    });

    it('should retry and succeed when transaction fails with error code 40001', async () => {
      const transaction = new Transaction();
      transaction.amount = 1000;
      transaction.origin = { accountNumber: 1, balance: 1000 };
      transaction.destination = { accountNumber: 2, balance: 0 };

      const mockManager = {
        transaction: jest
          .fn()
          .mockImplementationOnce(() => {
            throw { code: '40001' };
          })
          .mockImplementation((isolationLevel, runInTransaction) =>
            runInTransaction(mockManager),
          ),
        save: jest.fn().mockResolvedValue(transaction),
      };

      const repo = {
        createTransaction: jest.fn().mockReturnValue(transaction),
        saveTransaction: jest.fn().mockResolvedValue(transaction),
        startEntityTransaction: jest.fn().mockResolvedValue(mockManager),
      } as unknown as ITransactionRepository;

      jest.spyOn(accountsService, 'updateBalance').mockResolvedValue(undefined);

      const service = new TransactionsService(repo, accountsService);

      const result = await service.createTransfer({
        type: TransactionType.TRANSFER,
        originId: 1,
        destinationId: 2,
        amount: 1000,
      });

      expect(result).toEqual(transaction);
    });

    it('should throw ConflictException when transaction fails with error code 40001 after all retries', async () => {
      const transaction = new Transaction();
      transaction.amount = 1000;
      transaction.origin = { accountNumber: 1, balance: 1000 };
      transaction.destination = { accountNumber: 2, balance: 0 };

      const mockManager = {
        transaction: jest.fn().mockImplementation(() => {
          throw { code: '40001' };
        }),
        save: jest.fn().mockResolvedValue(transaction),
      };

      const repo = {
        createTransaction: jest.fn().mockReturnValue(transaction),
        saveTransaction: jest.fn().mockResolvedValue(transaction),
        startEntityTransaction: jest.fn().mockResolvedValue(mockManager),
      } as unknown as ITransactionRepository;

      jest.spyOn(accountsService, 'updateBalance').mockResolvedValue(undefined);

      const service = new TransactionsService(repo, accountsService);

      try {
        await service.createTransfer({
          type: TransactionType.TRANSFER,
          originId: 1,
          destinationId: 2,
          amount: 1000,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe(
          'Transaction could not be completed after 3 retries',
        );
      }
    });
  });
});
