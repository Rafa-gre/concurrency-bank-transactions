import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

@Entity()
export class Account {
  @Column()
  @PrimaryGeneratedColumn()
  accountNumber: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @VersionColumn()
  version: number;
}
