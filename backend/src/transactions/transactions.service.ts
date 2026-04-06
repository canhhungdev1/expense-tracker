import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async findAll(
    userId: number,
    query: {
      page?: number;
      limit?: number;
      type?: 'income' | 'expense';
      categoryId?: number;
      startDate?: string;
      endDate?: string;
      search?: string;
    }
  ): Promise<{ data: Transaction[]; total: number; hasMore: boolean }> {
    const { page = 1, limit = 20, type, categoryId, startDate, endDate, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionsRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.date', 'DESC')
      .addOrderBy('transaction.id', 'DESC');

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', { categoryId });
    }

    if (startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate });
    }

    if (search) {
      queryBuilder.andWhere('transaction.note LIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      hasMore: total > skip + data.length,
    };
  }

  async create(transactionData: Partial<Transaction>, userId: number): Promise<Transaction> {
    const transaction = this.transactionsRepository.create({
      ...transactionData,
      userId,
    });
    return this.transactionsRepository.save(transaction);
  }

  async update(id: number, updateData: Partial<Transaction>, userId: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
    });
    if (!transaction) {
      throw new Error('Giao dịch không tồn tại hoặc bạn không có quyền sửa');
    }
    // Cập nhật các trường mới
    Object.assign(transaction, updateData);
    return this.transactionsRepository.save(transaction);
  }

  async remove(id: number, userId: number): Promise<void> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
    });
    if (!transaction) {
      throw new Error('Giao dịch không tồn tại hoặc bạn không có quyền xóa');
    }
    await this.transactionsRepository.remove(transaction);
  }
}
