import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './category.entity';
import { v4 as uuidv4 } from 'uuid';

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
      // Chi tiêu - sinh hoạt
      { id: 'c0000001-e89b-12d3-a456-426614174000', name: 'Chợ, siêu thị', icon: '🛒', color: '#F59E0B', type: 'expense', group: 'sinh_hoat' },
      { id: 'c0000002-e89b-12d3-a456-426614174000', name: 'Ăn uống', icon: '🍲', color: '#F59E0B', type: 'expense', group: 'sinh_hoat' },
      { id: 'c0000003-e89b-12d3-a456-426614174000', name: 'Di chuyển', icon: '🚗', color: '#3B82F6', type: 'expense', group: 'sinh_hoat' },
      
      // Chi phí phát sinh
      { id: 'c0000004-e89b-12d3-a456-426614174000', name: 'Mua sắm', icon: '🛍️', color: '#EC4899', type: 'expense', group: 'phat_sinh' },
      { id: 'c0000005-e89b-12d3-a456-426614174000', name: 'Giải trí', icon: '🎬', color: '#8B5CF6', type: 'expense', group: 'phat_sinh' },
      { id: 'c0000006-e89b-12d3-a456-426614174000', name: 'Làm đẹp', icon: '💄', color: '#EC4899', type: 'expense', group: 'phat_sinh' },
      { id: 'c0000007-e89b-12d3-a456-426614174000', name: 'Sức khỏe', icon: '❤️', color: '#EF4444', type: 'expense', group: 'phat_sinh' },
      { id: 'c0000008-e89b-12d3-a456-426614174000', name: 'Từ thiện', icon: '🎁', color: '#EC4899', type: 'expense', group: 'phat_sinh' },
      
      // Chi phí cố định
      { id: 'c0000009-e89b-12d3-a456-426614174000', name: 'Hóa đơn', icon: '🧾', color: '#10B981', type: 'expense', group: 'co_dinh' },
      { id: 'c0000010-e89b-12d3-a456-426614174000', name: 'Nhà cửa', icon: '🏠', color: '#3B82F6', type: 'expense', group: 'co_dinh' },
      { id: 'c0000011-e89b-12d3-a456-426614174000', name: 'Người thân', icon: '👶', color: '#6366F1', type: 'expense', group: 'co_dinh' },
      { id: 'c0000012-e89b-12d3-a456-426614174000', name: 'Con cái', icon: '🧸', color: '#6366F1', type: 'expense', group: 'co_dinh' },

      // Đầu tư - tiết kiệm
      { id: 'c0000013-e89b-12d3-a456-426614174000', name: 'Đầu tư', icon: '💰', color: '#F59E0B', type: 'expense', group: 'dau_tu' },
      { id: 'c0000014-e89b-12d3-a456-426614174000', name: 'Học tập', icon: '📚', color: '#3B82F6', type: 'expense', group: 'dau_tu' },
      
      // Income
      { id: 'c0000101-e89b-12d3-a456-426614174000', name: 'Tiền lương', icon: '💸', color: '#10B981', type: 'income', group: 'thu_nhap' },
      { id: 'c0000102-e89b-12d3-a456-426614174000', name: 'Lương thưởng', icon: '🧧', color: '#F59E0B', type: 'income', group: 'thu_nhap' },
      { id: 'c0000103-e89b-12d3-a456-426614174000', name: 'Kinh doanh', icon: '📈', color: '#3B82F6', type: 'income', group: 'thu_nhap' },
      { id: 'c0000104-e89b-12d3-a456-426614174000', name: 'Quà tặng', icon: '🎁', color: '#EC4899', type: 'income', group: 'thu_nhap' },
      { id: 'c0000105-e89b-12d3-a456-426614174000', name: 'Khác', icon: '➕', color: '#94A3B8', type: 'income', group: 'thu_nhap' },
    ];

    for (const cat of defaultCategories) {
      const existing = await this.categoryRepository.findOne({ where: { id: cat.id } });
      if (!existing) {
        await this.categoryRepository.save(cat);
      } else {
        // Cập nhật thông tin nếu có thay đổi (trừ ID)
        Object.assign(existing, cat);
        await this.categoryRepository.save(existing);
      }
    }
    console.log('Fixed UUID Categories Seeded!');
  }

  findAll(userId?: string) {
    return this.categoryRepository.find({
      where: [
        { userId: IsNull() }, // System categories
        { userId: userId }, // User specific categories
      ],
      order: { name: 'ASC' }, // Sort by name since IDs are now UUIDs
    });
  }

  create(data: Partial<Category>, userId: string) {
    const category = this.categoryRepository.create({
      ...data,
      id: uuidv4(),
      userId,
    });
    return this.categoryRepository.save(category);
  }

  async update(id: string, userId: string, data: Partial<Category>) {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });
    if (!category) throw new Error('Category not found or access denied');
    Object.assign(category, data);
    return this.categoryRepository.save(category);
  }

  async remove(id: string, userId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });
    if (!category) throw new Error('Category not found or access denied');
    return this.categoryRepository.remove(category);
  }
}
