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

  findAll(userId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { userId },
      relations: ['category'],
      order: { date: 'DESC', id: 'DESC' },
    });
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
