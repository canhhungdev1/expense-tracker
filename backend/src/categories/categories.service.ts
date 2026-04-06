import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    const count = await this.categoryRepository.count();
    if (count === 0) {
      await this.seed();
    }
  }

  async seed() {
    // Chỉ nạp dữ liệu tối thiểu nếu bảng trống hoàn toàn
    const defaultCategories = [
      { name: 'Ăn uống', icon: '🍲', color: '#F59E0B', type: 'expense' },
      { name: 'Di chuyển', icon: '🚗', color: '#3B82F6', type: 'expense' },
      { name: 'Tiền lương', icon: '💰', color: '#10B981', type: 'income' },
      { name: 'Khác', icon: '✨', color: '#94A3B8', type: 'expense' },
    ];
    await this.categoryRepository.save(defaultCategories);
  }

  findAll(userId?: number) {
    return this.categoryRepository.find({
      where: [
        { userId: IsNull() }, // System categories
        { userId: userId }, // User specific categories
      ],
      order: { id: 'ASC' },
    });
  }
}
