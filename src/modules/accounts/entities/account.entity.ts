import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';
import { ValueTransformer } from 'typeorm';

const decimalTransformer: ValueTransformer = {
  from: (value: string) => parseFloat(value),
  to: (value: number) => value.toFixed(2),
};
@Entity()
export class Account {
  @Column()
  @PrimaryGeneratedColumn()
  accountNumber: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  balance: number;

  @VersionColumn() //TODO: Remover caso não utilize Modo Otimista
  version: number;
}
