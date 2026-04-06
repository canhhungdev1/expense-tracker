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
    const defaultCategories = [
      // Expenses
      { name: 'Ăn uống', icon: '🍲', color: '#F59E0B', type: 'expense' },
      { name: 'Di chuyển', icon: '🚗', color: '#3B82F6', type: 'expense' },
      { name: 'Mua sắm', icon: '🛍️', color: '#EC4899', type: 'expense' },
      { name: 'Điện nước', icon: '⚡', color: '#FBBF24', type: 'expense' },
      { name: 'Giải trí', icon: '🎬', color: '#8B5CF6', type: 'expense' },
      { name: 'Y tế', icon: '🏥', color: '#EF4444', type: 'expense' },
      { name: 'Giáo dục', icon: '🎓', color: '#10B981', type: 'expense' },
      { name: 'Con cái', icon: '👶', color: '#6366F1', type: 'expense' },
      { name: 'Khác', icon: '✨', color: '#94A3B8', type: 'expense' },
      // Income
      { name: 'Tiền lương', icon: '💰', color: '#10B981', type: 'income' },
      { name: 'Lương thưởng', icon: '🧧', color: '#F59E0B', type: 'income' },
      { name: 'Kinh doanh', icon: '📈', color: '#3B82F6', type: 'income' },
      { name: 'Quà tặng', icon: '🎁', color: '#EC4899', type: 'income' },
      { name: 'Khác', icon: '➕', color: '#94A3B8', type: 'income' },
    ];

    await this.categoryRepository.save(defaultCategories);
    console.log('Categories seeded!');
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
