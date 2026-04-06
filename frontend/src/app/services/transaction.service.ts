import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Category, CategoryService } from './category.service';

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category?: Category;
  categoryId: number;
  date: string;
  note: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private categoryService = inject(CategoryService);
  private apiUrl = 'http://192.168.1.15:3000/api/transactions';

  private transactionsSignal = signal<Transaction[]>([]);
  readonly transactions = this.transactionsSignal.asReadonly();

  constructor() {
    this.loadTransactions();
    this.categoryService.loadCategories();
  }

  async loadTransactions() {
    try {
      const data = await firstValueFrom(this.http.get<Transaction[]>(this.apiUrl));
      // Trình điều khiển MariaDB trả về amount dưới dạng string cho decimal, cần ép kiểu lại
      const formattedData = data.map(t => ({ ...t, amount: Number(t.amount) }));
      this.transactionsSignal.set(formattedData);
    } catch (error) {
      console.error('Lỗi khi tải giao dịch:', error);
    }
  }

  // Tổng hợp số liệu
  readonly totalIncome = computed(() => 
    this.transactionsSignal()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly totalExpense = computed(() => 
    this.transactionsSignal()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly balance = computed(() => this.totalIncome() - this.totalExpense());

  // Thống kê tháng hiện tại
  readonly currentMonthIncome = computed(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    return this.transactionsSignal().filter(t => t.type === 'income' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0);
  });

  readonly currentMonthExpense = computed(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    return this.transactionsSignal().filter(t => t.type === 'expense' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0);
  });

  // Thống kê tháng trước
  readonly lastMonthIncome = computed(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const prefix = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    return this.transactionsSignal().filter(t => t.type === 'income' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0);
  });

  readonly lastMonthExpense = computed(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const prefix = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    return this.transactionsSignal().filter(t => t.type === 'expense' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0);
  });

  // So sánh tăng trưởng (%)
  readonly incomeChange = computed(() => {
    const curr = this.currentMonthIncome();
    const last = this.lastMonthIncome();
    if (last === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - last) / last) * 100);
  });

  readonly expenseChange = computed(() => {
    const curr = this.currentMonthExpense();
    const last = this.lastMonthExpense();
    if (last === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - last) / last) * 100);
  });

  // Biểu đồ: Phân bổ chi tiêu
  readonly expensesByCategory = computed(() => {
    const expenses = this.transactions().filter(t => t.type === 'expense');
    const categories: Record<number, number> = {};
    
    expenses.forEach(t => {
      categories[t.categoryId] = (categories[t.categoryId] || 0) + Number(t.amount);
    });

    return Object.entries(categories)
      .map(([id, amount]) => {
        const catId = Number(id);
        const cat = this.categoryService.categories().find(c => c.id === catId);
        return {
          id: catId,
          name: cat?.name || 'Khác',
          icon: cat?.icon || '✨',
          color: cat?.color || '#94A3B8',
          amount
        };
      })
      .sort((a, b) => b.amount - a.amount);
  });

  // Biểu đồ: Xu hướng 7 ngày
  readonly dailyTrend = computed(() => {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().substring(0, 10);
    }).reverse();

    return last7Days.map(date => {
      const dayTrans = this.transactionsSignal().filter(t => t.date === date);
      return {
        label: date.split('-').slice(1).reverse().join('/'),
        income: dayTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expense: dayTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      };
    });
  });

  // Biểu đồ: Xu hướng 6 tháng
  readonly monthlyTrend = computed(() => {
    const last6Months = Array.from({length: 6}, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        year: d.getFullYear(),
        month: d.getMonth() + 1
      };
    }).reverse();

    return last6Months.map(m => {
      const monthPrefix = `${m.year}-${m.month.toString().padStart(2, '0')}`;
      const monthTrans = this.transactionsSignal().filter(t => t.date.startsWith(monthPrefix));
      return {
        label: `Tháng ${m.month}`,
        income: monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expense: monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      };
    });
  });

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    try {
      const newT = await firstValueFrom(this.http.post<Transaction>(this.apiUrl, transaction));
      const formatted = { ...newT, amount: Number(newT.amount) };
      this.transactionsSignal.update(ts => [formatted, ...ts]);
      return formatted;
    } catch (error) {
      console.error('Lỗi khi lưu giao dịch:', error);
      throw error;
    }
  }

  async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction> {
    try {
      const updated = await firstValueFrom(this.http.patch<Transaction>(`${this.apiUrl}/${id}`, transaction));
      const formatted = { ...updated, amount: Number(updated.amount) };
      this.transactionsSignal.update(ts => ts.map(t => t.id === id ? formatted : t));
      return formatted;
    } catch (error) {
      console.error('Lỗi khi cập nhật giao dịch:', error);
      throw error;
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.transactionsSignal.update(ts => ts.filter(t => t.id !== id));
    } catch (error) {
      console.error('Lỗi khi xóa giao dịch:', error);
      throw error;
    }
  }

  private getCategoryColor(id: string): string {
    const colors: Record<string, string> = {
      '1': '#f43f5e', '2': '#f59e0b', '3': '#3b82f6', '4': '#8b5cf6',
      '5': '#ec4899', '6': '#06b6d4', '7': '#10b981', '8': '#64748b',
      '101': '#10b981', '102': '#34d399', '104': '#059669',
    };
    return colors[id] || '#cbd5e1';
  }
}
