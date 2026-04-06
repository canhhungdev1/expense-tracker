import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from './transactions/transactions.module';
import { Transaction } from './transactions/transaction.entity';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/category.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'expense_tracker',
      entities: [Transaction, User, Category],
      synchronize: true,
      charset: 'utf8mb4',
    }),
    TransactionsModule,
    AuthModule,
    CategoriesModule,
  ],
})
export class AppModule {}
