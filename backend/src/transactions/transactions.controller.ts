import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Request() req): Promise<Transaction[]> {
    return this.transactionsService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() transaction: Partial<Transaction>): Promise<Transaction> {
    return this.transactionsService.create(transaction, req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.transactionsService.remove(+id, req.user.userId);
  }
}
