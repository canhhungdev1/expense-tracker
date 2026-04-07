import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('transactions')
export class Transaction {
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column()
  type: string; // 'income' | 'expense'

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @ManyToOne(() => Category, (category) => category.transactions)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column()
  date: string;

  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;
}
