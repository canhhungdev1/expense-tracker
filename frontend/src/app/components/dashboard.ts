import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { PullToRefreshComponent } from './pull-to-refresh';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PullToRefreshComponent],
  template: `
    <app-pull-to-refresh [loading]="isLoading()" (refresh)="onRefresh()">
      <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-24 transition-colors duration-500">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 px-2 pt-2">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Chào bạn! 👋</h1>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tổng quan tháng {{ currentMonth }}</p>
        </div>
        <div class="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-xl">
          😊
        </div>
      </div>

      <!-- Main Balance Card -->
      <div class="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-emerald-900 dark:to-emerald-950 rounded-[32px] p-8 shadow-2xl mb-8 group transition-all duration-500 hover:scale-[1.02]">
        <!-- Decorative background elements -->
        <div class="absolute -top-12 -right-12 w-48 h-48 bg-white opacity-[0.03] rounded-full"></div>
        <div class="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-500 opacity-[0.05] rounded-full animate-pulse"></div>

        <div class="relative z-10 flex flex-col items-center text-center">
          <p class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Số dư hiện tại</p>
          <h2 class="text-white text-5xl font-black tracking-tight mb-8">
            {{ transactionService.balance() | number:'1.0-0' }}<span class="text-2xl ml-1 opacity-50">₫</span>
          </h2>

          <div class="grid grid-cols-2 gap-4 w-full">
            <div class="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <p class="text-emerald-400 text-[9px] font-bold uppercase tracking-widest mb-1 text-left">Thu nhập</p>
                <p class="text-white text-lg font-bold text-left">+{{ transactionService.currentMonthIncome() | number:'1.0-0' }}₫</p>
              </div>
              <div class="mt-2 flex items-center gap-1">
                <span [class]="transactionService.incomeChange() >= 0 ? 'text-emerald-400' : 'text-rose-400'" class="text-[8px] font-black">
                  {{ transactionService.incomeChange() >= 0 ? '▲' : '▼' }} {{ Math.abs(transactionService.incomeChange()) }}%
                </span>
                <span class="text-[7px] text-slate-400 font-bold uppercase tracking-tight">vs tháng trước</span>
              </div>
            </div>
            <div class="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <p class="text-rose-400 text-[9px] font-bold uppercase tracking-widest mb-1 text-left">Chi tiêu</p>
                <p class="text-white text-lg font-bold text-left">-{{ transactionService.currentMonthExpense() | number:'1.0-0' }}₫</p>
              </div>
              <div class="mt-2 flex items-center gap-1">
                <span [class]="transactionService.expenseChange() >= 0 ? 'text-emerald-400' : 'text-rose-400'" class="text-[8px] font-black">
                  {{ transactionService.expenseChange() >= 0 ? '▲' : '▼' }} {{ Math.abs(transactionService.expenseChange()) }}%
                </span>
                <span class="text-[7px] text-slate-400 font-bold uppercase tracking-tight">vs tháng trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions / Categories -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4 px-1">
          <h3 class="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Top chi tiêu</h3>
          <button routerLink="/statistics" class="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Xem tất cả</button>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
          <div *ngFor="let cat of topCategories" class="space-y-2">
            <div class="flex items-center justify-between text-xs font-bold">
              <div class="flex items-center gap-3">
                <span class="text-xl">{{ cat.icon }}</span>
                <span class="text-slate-700 dark:text-slate-300">{{ cat.name }}</span>
              </div>
              <span class="text-slate-900 dark:text-white">{{ cat.amount | number:'1.0-0' }}₫</span>
            </div>
            <div class="h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                [style.width.%]="cat.percentage"
                class="h-full bg-rose-500 rounded-full transition-all duration-1000"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div>
        <div class="flex items-center justify-between mb-4 px-1">
          <h3 class="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Giao dịch gần nhất</h3>
          <button routerLink="/history" class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">Xem tất cả</button>
        </div>
        <div class="space-y-3">
          <div *ngFor="let t of transactionService.transactions().slice(0, 5)" 
            class="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-800 flex items-center justify-between transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-95 duration-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner border border-slate-100 dark:border-slate-700">
                {{ t.category?.icon || '✨' }}
              </div>
              <div>
                <p class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ t.note || t.category?.name || 'Khác' }}</p>
                <p class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">{{ t.date | date:'dd/MM/yyyy' }}</p>
              </div>
            </div>
            <p [ngClass]="t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'" class="text-sm font-black tracking-tight">
              {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | number:'1.0-0' }}₫
            </p>
          </div>
        </div>
      </div>
    </div>
  </app-pull-to-refresh>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DashboardComponent {
  transactionService = inject(TransactionService);
  Math = Math;
  currentMonth = new Date().getMonth() + 1;
  isLoading = signal(false);

  async onRefresh() {
    this.isLoading.set(true);
    await this.transactionService.loadTransactions();
    this.isLoading.set(false);
  }

  get topCategories() {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const expenses = this.transactionService.transactions().filter(t => t.type === 'expense' && t.date.startsWith(prefix));
    const total = this.transactionService.currentMonthExpense() || 1;
    
    // Group by category name/icon (since we have the full category object)
    const groups: Record<string, {name: string, icon: string, amount: number}> = {};
    
    expenses.forEach(t => {
      const catName = t.category?.name || 'Khác';
      if (!groups[catName]) {
        groups[catName] = {
          name: catName,
          icon: t.category?.icon || '✨',
          amount: 0
        };
      }
      groups[catName].amount += Number(t.amount);
    });

    return Object.values(groups)
      .map(group => ({
        ...group,
        percentage: (group.amount / total) * 100
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }
}
