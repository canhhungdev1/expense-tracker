import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Transaction } from '../transactions/transaction.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column()
  color: string;

  @Column()
  type: string; // 'income' | 'expense'

  @ManyToOne(() => User, (user) => user.categories, { nullable: true })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];
}
