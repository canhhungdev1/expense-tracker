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
    userId: string,
    query: {
      page?: number;
      limit?: number;
      type?: 'income' | 'expense';
      categoryId?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    }
  ): Promise<{ data: Transaction[]; total: number; hasMore: boolean }> {
    const { page = 1, limit = 20, type, categoryId, startDate, endDate, search } = query;
    const offset = (page - 1) * limit;

    const queryBuilder = this.transactionsRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.date', 'DESC')
      .addOrderBy('transaction.date', 'DESC'); // Sort by date primarily

    if (type && (type as any) !== 'all') {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (categoryId && categoryId.trim() !== '') {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', { categoryId });
    }

    if (startDate && startDate.trim() !== '') {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate });
    }

    if (endDate && endDate.trim() !== '') {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate });
    }

    if (search && search.trim() !== '') {
      queryBuilder.andWhere('transaction.note LIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await queryBuilder
      .offset(offset)
      .limit(limit)
      .getManyAndCount();

    return {
      data,
      total,
      hasMore: total > offset + data.length,
    };
  }

  async create(transactionData: Partial<Transaction>, userId: string): Promise<Transaction> {
    const transaction = this.transactionsRepository.create({
      ...transactionData,
      userId,
    });
    return this.transactionsRepository.save(transaction);
  }

  async update(id: string, updateData: Partial<Transaction>, userId: string): Promise<Transaction> {
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

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
    });
    if (!transaction) {
      throw new Error('Giao dịch không tồn tại hoặc bạn không có quyền xóa');
    }
    await this.transactionsRepository.remove(transaction);
  }
}
