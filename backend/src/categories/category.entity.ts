import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn, BeforeInsert } from 'typeorm';
import { User } from '../users/user.entity';
import { Transaction } from '../transactions/transaction.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('categories')
export class Category {
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column()
  color: string;

  @Column()
  type: string; // 'income' | 'expense'

  @Column({ nullable: true })
  group: string; // 'sinh_hoat' | 'phat_sinh' | 'co_dinh' | 'dau_tu'

  @ManyToOne(() => User, (user) => user.categories, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];
}
