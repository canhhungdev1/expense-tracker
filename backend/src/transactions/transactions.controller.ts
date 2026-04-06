import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards, Request, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @Request() req,
    @Query() query: {
      page?: string;
      limit?: string;
      type?: 'income' | 'expense';
      categoryId?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    }
  ): Promise<{ data: Transaction[]; total: number; hasMore: boolean }> {
    // Chuyển đổi các tham số cần thiết sang số lẻ (numeric)
    const processedQuery = {
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      categoryId: query.categoryId ? Number(query.categoryId) : undefined,
    };
    return this.transactionsService.findAll(req.user.userId, processedQuery);
  }

  @Post()
  create(@Request() req, @Body() transaction: Partial<Transaction>): Promise<Transaction> {
    return this.transactionsService.create(transaction, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateData: Partial<Transaction>): Promise<Transaction> {
    return this.transactionsService.update(+id, updateData, req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.transactionsService.remove(+id, req.user.userId);
  }
}
