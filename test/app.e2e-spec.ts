import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransactionType } from '../src/modules/transactions/entities/transaction.entity';

describe('TransactionsController (e2e)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should handle deposit transactions correctly', async () => {
    // Crie as contas
    const accountCreated = await request(app.getHttpServer())
      .post('/account')
      .send({ balance: 0 });

    await request(app.getHttpServer()).post('/transactions').send({
      type: TransactionType.DEPOSIT,
      destinationId: accountCreated.body.accountNumber,
      amount: 100,
    }); // DEPOSITO

    const account = await request(app.getHttpServer()).get(
      `/account/${accountCreated.body.accountNumber}`,
    );

    expect(account.body.balance).toBe(100);
  });

  it('should handle withdraw transactions correctly', async () => {
    const accountCreated = await request(app.getHttpServer())
      .post('/account')
      .send({ balance: 100 });

    await request(app.getHttpServer()).post('/transactions').send({
      type: TransactionType.WITHDRAW,
      originId: accountCreated.body.accountNumber,
      amount: 50,
    }); // SAQUE

    const account = await request(app.getHttpServer()).get(
      `/account/${accountCreated.body.accountNumber}`,
    );
    expect(account.body.balance).toBe(50);
  });

  it('should handle transfer transactions correctly', async () => {
    const accountCreated1 = await request(app.getHttpServer())
      .post('/account')
      .send({ balance: 100 });

    const accountCreated2 = await request(app.getHttpServer())
      .post('/account')
      .send({ balance: 0 });

    await request(app.getHttpServer()).post('/transactions').send({
      type: TransactionType.TRANSFER,
      originId: accountCreated1.body.accountNumber,
      destinationId: accountCreated2.body.accountNumber,
      amount: 30,
    }); // TRANSFERENCIA

    const account1 = await request(app.getHttpServer()).get(
      `/account/${accountCreated1.body.accountNumber}`,
    );
    const account2 = await request(app.getHttpServer()).get(
      `/account/${accountCreated2.body.accountNumber}`,
    );

    expect(account1.body.balance).toBe(70);
    expect(account2.body.balance).toBe(30);
  });

  it('should handle transactions and concurrency correctly - DEPOSIT SCENARIO', async () => {
    const accountCreated = await request(app.getHttpServer())
      .post('/account')
      .send({ balance: 100 });

    // Execute as transações concorrentes e verifique os saldos
    const promises1 = [
      request(app.getHttpServer())
        .post('/transactions') // DEPOSITO
        .send({
          type: TransactionType.DEPOSIT,
          destinationId: accountCreated.body.accountNumber,
          amount: 50,
        }),
      request(app.getHttpServer()).post('/transactions').send({
        type: TransactionType.WITHDRAW,
        originId: accountCreated.body.accountNumber,
        amount: 30,
      }), // SAQUE
    ];
    await Promise.all(promises1);

    const response1 = await request(app.getHttpServer()).get(
      `/account/${accountCreated.body.accountNumber}`,
    );

    expect(response1.body.balance).toBe(120);
  });

  it('should handle transactions and concurrency correctly - DEPOSIT TRANSFER SCENARIO', async () => {
    const accountCreated1 = await request(app.getHttpServer())
      .post('/account')
      .send({ balance: 100 });

    const accountCreated2 = await request(app.getHttpServer())
      .post('/account')
      .send({ balance: 0 });

    const promises = [
      request(app.getHttpServer()).post('/transactions').send({
        type: TransactionType.DEPOSIT,
        destinationId: accountCreated1.body.accountNumber,
        amount: 100,
      }),
      request(app.getHttpServer()).post('/transactions').send({
        type: TransactionType.TRANSFER,
        originId: accountCreated1.body.accountNumber,
        destinationId: accountCreated2.body.accountNumber,
        amount: 50,
      }),
    ];
    await Promise.all(promises);
    const response1 = await request(app.getHttpServer()).get(
      `/account/${accountCreated1.body.accountNumber}`,
    );
    const response2 = await request(app.getHttpServer()).get(
      `/account/${accountCreated2.body.accountNumber}`,
    );
    expect(response1.body.balance).toBe(150);
    expect(response2.body.balance).toBe(50);
  });

  it('should handle transactions and concurrency correctly - TRANSFER SCENARIO', async () => {
    const accountCreated1 = await request(app.getHttpServer())
      .post('/account')
      .send({ balance: 100 });

    const accountCreated2 = await request(app.getHttpServer())
      .post('/account')
      .send({ balance: 20 });

    const accountCreated3 = await request(app.getHttpServer())
      .post('/account')
      .send({ balance: 0 });

    const promises = [
      request(app.getHttpServer()).post('/transactions').send({
        type: TransactionType.TRANSFER,
        originId: accountCreated1.body.accountNumber,
        destinationId: accountCreated2.body.accountNumber,
        amount: 20,
      }),
      request(app.getHttpServer()).post('/transactions').send({
        type: TransactionType.TRANSFER,
        originId: accountCreated2.body.accountNumber,
        destinationId: accountCreated3.body.accountNumber,
        amount: 10,
      }),
    ];
    await Promise.all(promises);
    const response1 = await request(app.getHttpServer()).get(
      `/account/${accountCreated1.body.accountNumber}`,
    );
    const response2 = await request(app.getHttpServer()).get(
      `/account/${accountCreated2.body.accountNumber}`,
    );
    const response3 = await request(app.getHttpServer()).get(
      `/account/${accountCreated3.body.accountNumber}`,
    );
    expect(response1.body.balance).toBe(80);
    expect(response2.body.balance).toBe(30);
    expect(response3.body.balance).toBe(10);
  });

  afterAll(async () => {
    await app.close();
  });
});
