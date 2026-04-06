import { Component, inject, AfterViewInit, ViewChild, ElementRef, effect, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { ThemeService } from '../services/theme.service';
import { CategoryService } from '../services/category.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pb-24 transition-colors duration-500">
      <!-- Header with Time Selector -->
      <div class="flex flex-col gap-6 mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button routerLink="/dashboard" class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors border border-slate-100 dark:border-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Phân tích</h1>
          </div>
        </div>

        <!-- Period Selectors -->
        <div class="flex gap-3">
          <div class="flex-1 relative">
            <select 
              [value]="transactionService.selectedMonth()"
              (change)="onMonthChange($event)"
              class="w-full bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            >
              <option *ngFor="let m of months" [value]="m" [selected]="transactionService.selectedMonth() === m">Tháng {{ m }}</option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </div>
          </div>
          <div class="flex-1 relative">
            <select 
              [value]="transactionService.selectedYear()"
              (change)="onYearChange($event)"
              class="w-full bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            >
              <option *ngFor="let y of years" [value]="y" [selected]="transactionService.selectedYear() === y">Năm {{ y }}</option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Health (Savings Rate Gauge) -->
      <div class="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 rounded-[32px] p-8 shadow-xl mb-8 relative overflow-hidden transition-all group hover:scale-[1.01]">
        <div class="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500 opacity-[0.03] rounded-full"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-6">
            <div>
              <p class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Tỉ lệ tiết kiệm</p>
              <h2 class="text-white text-3xl font-black tracking-tight">{{ transactionService.savingsRate() }}%</h2>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-xl shadow-lg">
              🎯
            </div>
          </div>
          
          <!-- Gauge/Progress Bar -->
          <div class="h-3 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
            <div 
              class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              [style.width.%]="transactionService.savingsRate()"
            ></div>
          </div>
          
          <p class="text-slate-400 text-[9px] font-medium leading-relaxed">
            Bạn đã để dành được <span class="text-emerald-400 font-bold">{{ (transactionService.periodIncome() - transactionService.periodExpense()) | number:'1.0-0' }}₫</span> trong tháng này. 
            {{ transactionService.savingsRate() >= 20 ? 'Thật tuyệt vời! Hãy duy trì phong độ này.' : 'Cố gắng tiết kiệm thêm nhé!' }}
          </p>
        </div>
      </div>

      <!-- Distribution Section (Toggle + Chart) -->
      <div class="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 relative">
        <div class="flex flex-col items-center mb-10">
          <h3 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-6">Phân bổ tài chính</h3>
          
          <div class="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <button 
              (click)="distributionType.set('expense')"
              [class]="distributionType() === 'expense' ? 'bg-white dark:bg-slate-900 shadow-sm text-rose-500' : 'text-slate-400'"
              class="px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
            >Chi tiêu</button>
            <button 
              (click)="distributionType.set('income')"
              [class]="distributionType() === 'income' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-500' : 'text-slate-400'"
              class="px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
            >Thu nhập</button>
          </div>
        </div>
        
        <div class="h-[280px] relative mb-12">
          <canvas #doughnutCanvas></canvas>
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest translate-y-1">
              {{ distributionType() === 'expense' ? 'Tổng chi' : 'Tổng thu' }}
            </span>
            <span [class]="distributionType() === 'expense' ? 'text-rose-500' : 'text-emerald-500'" class="text-3xl font-black tracking-tight leading-none mt-1">
              {{ (distributionType() === 'expense' ? transactionService.periodExpense() : transactionService.periodIncome()) | number:'1.0-0' }}₫
            </span>
          </div>
        </div>

        <!-- Legend Details -->
        <div class="grid grid-cols-1 gap-3">
          <div *ngFor="let cat of getCurrentDistribution().slice(0, 5)" 
            class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-[24px] border border-slate-100/50 dark:border-slate-800/50 group hover:scale-[1.02] transition-all duration-300">
            <div class="flex items-center gap-4">
              <span class="text-xl w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">{{ cat.icon }}</span>
              <div>
                <span class="text-xs font-black text-slate-800 dark:text-slate-100 block">{{ cat.name }}</span>
                <div class="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                  <div class="h-full rounded-full" [style.width.%]="(cat.amount / (distributionType() === 'expense' ? transactionService.totalExpense() : transactionService.totalIncome()) * 100)" [style.background-color]="cat.color"></div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xs font-black text-slate-900 dark:text-white">{{ (cat.amount / (distributionType() === 'expense' ? (transactionService.periodExpense() || 1) : (transactionService.periodIncome() || 1)) * 100) | number:'1.0-0' }}%</span>
              <p class="text-[10px] font-bold text-slate-400 mt-1">{{ cat.amount | number:'1.0-0' }}₫</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Trend Analysis -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Thu chi -->
        <div class="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-8 text-center">Thu chi 6 tháng</h3>
          <div class="h-[220px]">
            <canvas #barCanvas></canvas>
          </div>
        </div>

        <!-- Số dư & Tồn -->
        <div class="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-8 text-center">Số dư & Tích lũy (Tồn)</h3>
          <div class="h-[220px]">
            <canvas #balanceCanvas></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class StatisticsComponent implements AfterViewInit, OnDestroy {
  transactionService = inject(TransactionService);
  themeService = inject(ThemeService);
  categoryService = inject(CategoryService);

  distributionType = signal<'income' | 'expense'>('expense');
  months = Array.from({ length: 12 }, (_, i) => i + 1);
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('balanceCanvas') balanceCanvas!: ElementRef<HTMLCanvasElement>;

  private doughnutChart?: Chart;
  private barChart?: Chart;
  private balanceChart?: Chart;

  constructor() {
    effect(() => {
      // Trigger update when data or settings change
      this.transactionService.filteredTransactions();
      this.transactionService.monthlyTrend();
      this.distributionType();
      this.themeService.isDarkMode();
      setTimeout(() => this.updateCharts(), 0);
    });
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  onMonthChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.transactionService.selectedMonth.set(Number(val));
  }

  onYearChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.transactionService.selectedYear.set(Number(val));
  }

  getCurrentDistribution() {
    return this.distributionType() === 'expense' 
      ? this.transactionService.expensesByCategory() 
      : this.transactionService.incomeByCategory();
  }

  ngOnDestroy() {
    if (this.doughnutChart) this.doughnutChart.destroy();
    if (this.barChart) this.barChart.destroy();
    if (this.balanceChart) this.balanceChart.destroy();
  }

  private initCharts() {
    const isDark = this.themeService.isDarkMode();
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const doughnutCtx = this.doughnutCanvas.nativeElement.getContext('2d');
    const barCtx = this.barCanvas.nativeElement.getContext('2d');

    if (doughnutCtx) {
      if (this.doughnutChart) this.doughnutChart.destroy();
      this.doughnutChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: this.getDoughnutData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '85%',
          plugins: { 
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              titleColor: isDark ? '#f8fafc' : '#0f172a',
              bodyColor: isDark ? '#94a3b8' : '#64748b',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 12,
              displayColors: true
            }
          }
        }
      });
    }

    if (barCtx) {
      if (this.barChart) this.barChart.destroy();
      this.barChart = new Chart(barCtx, {
        type: 'bar',
        data: this.getBarData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { display: false },
            x: { 
              grid: { display: false }, 
              ticks: { color: textColor, font: { size: 9, weight: 'bold' } } 
            }
          }
        }
      });
    }

    const balanceCtx = this.balanceCanvas.nativeElement.getContext('2d');
    if (balanceCtx) {
      if (this.balanceChart) this.balanceChart.destroy();
      this.balanceChart = new Chart(balanceCtx, {
        type: 'bar',
        data: this.getBalanceData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              titleColor: isDark ? '#f8fafc' : '#0f172a',
              bodyColor: isDark ? '#94a3b8' : '#64748b',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 12,
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            y: { 
              display: false,
              suggestedMin: 0
            },
            x: { 
              grid: { display: false }, 
              ticks: { color: textColor, font: { size: 9, weight: 'bold' } } 
            }
          }
        }
      });
    }
  }

  private updateCharts() {
    if (this.doughnutChart) {
      this.doughnutChart.data = this.getDoughnutData();
      this.doughnutChart.update();
    }
    if (this.barChart) {
      this.barChart.data = this.getBarData();
      this.barChart.update();
    }
    if (this.balanceChart) {
      this.balanceChart.data = this.getBalanceData();
      this.balanceChart.update();
    }
  }

  private getDoughnutData() {
    const data = this.getCurrentDistribution();
    return {
      labels: data.map(d => d.name),
      datasets: [{
        data: data.map(d => d.amount),
        backgroundColor: data.map(d => d.color),
        borderWidth: 0,
        hoverOffset: 15,
        borderRadius: 8
      }]
    };
  }

  private getBarData() {
    const trend = this.transactionService.monthlyTrend();
    return {
      labels: trend.map(d => d.label),
      datasets: [
        {
          label: 'Thu nhập',
          data: trend.map(d => d.income),
          backgroundColor: '#10b981',
          borderRadius: 8,
          barThickness: 10,
        },
        {
          label: 'Chi tiêu',
          data: trend.map(d => d.expense),
          backgroundColor: '#f43f5e',
          borderRadius: 8,
          barThickness: 10,
        }
      ]
    };
  }

  private getBalanceData() {
    const trend = this.transactionService.monthlyTrend();
    return {
      labels: trend.map(d => d.label),
      datasets: [
        {
          label: 'Số dư (Tồn)',
          type: 'bar' as const,
          data: trend.map(d => d.balance),
          backgroundColor: trend.map(d => d.balance >= 0 ? '#10b981' : '#f43f5e'),
          borderRadius: 6,
          barThickness: 12,
          order: 2
        },
        {
          label: 'Tích lũy',
          type: 'line' as const,
          data: trend.map(d => d.cumulative),
          borderColor: '#3b82f6',
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.4,
          fill: false,
          order: 1
        }
      ]
    };
  }
}
