import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from './transactions/transactions.module';
import { Transaction } from './transactions/transaction.entity';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USER', 'root'),
        password: configService.get<string>('DB_PASS', '123456'),
        database: configService.get<string>('DB_NAME', 'expense_tracker'),
        entities: [Transaction, User, Category],
        synchronize: true,
        charset: 'utf8mb4',
      }),
    }),
    TransactionsModule,
    AuthModule,
    CategoriesModule,
  ],
})
export class AppModule {}
