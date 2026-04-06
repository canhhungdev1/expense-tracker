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
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button routerLink="/dashboard" class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Phân tích</h1>
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Toàn bộ dữ liệu của bạn</p>
        </div>
      </div>

      <!-- Category Distribution (Doughnut) -->
      <div class="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 transition-colors relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-5">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M11 2v20c-5.07 0-9.26-3.79-9.91-8.68L11 2zm2 0v20c5.07 0 9.26-3.79 9.91-8.68L13 2z"/></svg>
        </div>
        
        <h3 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-8 text-center relative z-10">Phân bổ chi tiêu</h3>
        
        <div class="h-[300px] relative mb-12">
          <canvas #doughnutCanvas></canvas>
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest translate-y-1">Tổng chi</span>
            <span class="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mt-1">{{ transactionService.totalExpense() | number:'1.0-0' }}₫</span>
          </div>
        </div>

        <!-- Category Legend with Percentages -->
        <div class="space-y-4">
          <h4 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2 mb-4">Chi tiết danh mục</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div *ngFor="let cat of transactionService.expensesByCategory().slice(0, 4)" 
              class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-[24px] border border-slate-100/50 dark:border-slate-800/50 group hover:scale-[1.02] transition-all duration-300">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full shadow-sm" [style.background-color]="cat.color"></div>
                <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ cat.name }}</span>
              </div>
              <div class="text-right">
                <span class="text-xs font-black text-slate-900 dark:text-white">{{ (cat.amount / (transactionService.totalExpense() || 1) * 100) | number:'1.0-1' }}%</span>
                <p class="text-[9px] font-bold text-slate-400 mt-0.5">{{ cat.amount | number:'1.0-0' }}₫</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trend Section -->
      <div class="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 transition-colors">
        <div class="flex flex-col items-center mb-8">
          <h3 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4">Biến động tài chính</h3>
          
          <div class="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <button 
              (click)="trendType.set('daily')"
              [class]="trendType() === 'daily' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400'"
              class="px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
            >7 ngày</button>
            <button 
              (click)="trendType.set('monthly')"
              [class]="trendType() === 'monthly' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400'"
              class="px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
            >Hàng tháng</button>
          </div>
        </div>
        
        <div class="h-[220px]">
          <canvas #barCanvas></canvas>
        </div>
      </div>

      <!-- Quick Insights Cards -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 p-6 rounded-[32px] transition-all hover:scale-[1.02]">
          <div class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-rose-500 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
          </div>
          <p class="text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase tracking-widest mb-1">Chi nhiều nhất</p>
          <p class="text-rose-900 dark:text-rose-100 text-lg font-black tracking-tight truncate">{{ getTopCategoryName() }}</p>
        </div>
        <div class="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-6 rounded-[32px] transition-all hover:scale-[1.02]">
          <div class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-emerald-500 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <p class="text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest mb-1">Trung bình/ngày</p>
          <p class="text-emerald-900 dark:text-emerald-100 text-lg font-black tracking-tight leading-none">{{ averageDailyExpense | number:'1.0-0' }}₫</p>
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

  trendType = signal<'daily' | 'monthly'>('daily');

  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;

  private doughnutChart?: Chart;
  private barChart?: Chart;

  constructor() {
    effect(() => {
      this.transactionService.expensesByCategory();
      this.themeService.isDarkMode();
      this.trendType();
      setTimeout(() => this.updateCharts(), 0);
    });
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  get averageDailyExpense() {
    const trend = this.transactionService.dailyTrend();
    const total = trend.reduce((sum, d) => sum + d.expense, 0);
    return trend.length ? total / trend.length : 0;
  }

  getTopCategoryName() {
    const cats = this.transactionService.expensesByCategory();
    return cats.length ? cats[0].name : 'Chưa có';
  }

  getCategoryName(id: number) {
    return this.categoryService.getCategoryName(id);
  }

  ngOnDestroy() {
    if (this.doughnutChart) this.doughnutChart.destroy();
    if (this.barChart) this.barChart.destroy();
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
          cutout: '80%',
          plugins: { legend: { display: false } }
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
              ticks: { 
                color: textColor,
                font: { size: 9, weight: 'bold' } 
              } 
            }
          }
        }
      });
    }
  }

  private updateCharts() {
    this.initCharts();
  }

  private getDoughnutData() {
    const data = this.transactionService.expensesByCategory();
    return {
      labels: data.map(d => this.getCategoryName(d.id)),
      datasets: [{
        data: data.map(d => d.amount),
        backgroundColor: data.map(d => d.color),
        borderWidth: 0,
        hoverOffset: 10
      }]
    };
  }

  private getBarData() {
    const trend = this.trendType() === 'daily' 
      ? this.transactionService.dailyTrend() 
      : this.transactionService.monthlyTrend();

    return {
      labels: trend.map(d => d.label),
      datasets: [
        {
          label: 'Thu nhập',
          data: trend.map(d => d.income),
          backgroundColor: '#10b981',
          borderRadius: 8,
          barThickness: 12,
        },
        {
          label: 'Chi tiêu',
          data: trend.map(d => d.expense),
          backgroundColor: '#f43f5e',
          borderRadius: 8,
          barThickness: 12,
        }
      ]
    };
  }
}
