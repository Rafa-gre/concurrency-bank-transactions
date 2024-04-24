import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTables1713990961987 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'account',
        columns: [
          {
            name: 'accountNumber',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'balance',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'version',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'origin',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'destination',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['origin'],
            referencedColumnNames: ['accountNumber'],
            referencedTableName: 'account',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['destination'],
            referencedColumnNames: ['accountNumber'],
            referencedTableName: 'account',
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('transactions');
    await queryRunner.dropTable('account');
  }
}
