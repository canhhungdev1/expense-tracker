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
  private apiUrl = 'http://localhost:3000/api/transactions';

  private transactionsSignal = signal<Transaction[]>([]);
  readonly transactions = this.transactionsSignal.asReadonly();

  // Dữ liệu cho trang Lịch sử (Phân trang)
  private historyTransactionsSignal = signal<Transaction[]>([]);
  readonly historyTransactions = this.historyTransactionsSignal.asReadonly();
  
  historyTotal = signal<number>(0);
  hasMoreHistory = signal<boolean>(false);
  historyPage = signal<number>(1);

  // Bộ lọc cho thống kê
  selectedMonth = signal<number>(new Date().getMonth() + 1);
  selectedYear = signal<number>(new Date().getFullYear());

  constructor() {
    this.loadTransactions();
    this.categoryService.loadCategories();
  }

  async loadTransactions() {
    try {
      // Tải 1000 cái gần nhất cho Dashboard/Stats
      const res = await firstValueFrom(this.http.get<{data: Transaction[], total: number}>(`${this.apiUrl}?limit=1000`));
      const formattedData = res.data.map(t => ({ ...t, amount: Number(t.amount) }));
      this.transactionsSignal.set(formattedData);
    } catch (error) {
      console.error('Lỗi khi tải giao dịch:', error);
    }
  }

  async loadHistory(filters: any = {}, append: boolean = false) {
    try {
      const page = append ? this.historyPage() + 1 : 1;
      
      // Chỉ giữ lại các tham số có giá trị
      const cleanFilters: any = {};
      Object.keys(filters).forEach(key => {
        const val = filters[key];
        if (val !== undefined && val !== null && val !== '' && val !== 'all') {
          cleanFilters[key] = val;
        }
      });

      const params = { ...cleanFilters, page, limit: 10 };
      console.log('--- ĐANG GỌI API LỊCH SỬ ---', params);
      
      const res = await firstValueFrom(
        this.http.get<{data: Transaction[], total: number, hasMore: boolean}>(this.apiUrl, { params })
      );
      
      console.log('--- KẾT QUẢ API LỊCH SỬ ---', res);
      const formattedData = res.data.map(t => ({ ...t, amount: Number(t.amount) }));
      
      if (append) {
        this.historyTransactionsSignal.update(prev => [...prev, ...formattedData]);
      } else {
        this.historyTransactionsSignal.set(formattedData);
      }
      
      this.historyTotal.set(res.total);
      this.hasMoreHistory.set(res.hasMore);
      this.historyPage.set(page);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử:', error);
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

  // Dữ liệu lọc theo kỳ (Tháng/Năm chọn trên trang Phân tích)
  readonly filteredTransactions = computed(() => {
    const month = this.selectedMonth().toString().padStart(2, '0');
    const year = this.selectedYear();
    const prefix = `${year}-${month}`;
    return this.transactionsSignal().filter(t => t.date.startsWith(prefix));
  });

  readonly periodIncome = computed(() => 
    this.filteredTransactions().filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  );

  readonly periodExpense = computed(() => 
    this.filteredTransactions().filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  );

  readonly savingsRate = computed(() => {
    const inc = this.periodIncome();
    const exp = this.periodExpense();
    if (inc <= 0) return 0;
    const rate = ((inc - exp) / inc) * 100;
    return Math.max(0, Math.round(rate)); // Đảm bảo không âm (nếu chi > thu)
  });

  // Biểu đồ: Phân bổ chi tiêu (theo kỳ lọc)
  readonly expensesByCategory = computed(() => {
    const expenses = this.filteredTransactions().filter(t => t.type === 'expense');
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

  // Biểu đồ: Phân bổ thu nhập (theo kỳ lọc)
  readonly incomeByCategory = computed(() => {
    const income = this.filteredTransactions().filter(t => t.type === 'income');
    const categories: Record<number, number> = {};
    
    income.forEach(t => {
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
          color: cat?.color || '#10b981',
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

  // Biểu đồ: Xu hướng 6 tháng (Thu, Chi, Tồn)
  readonly monthlyTrend = computed(() => {
    const last6Months = Array.from({length: 6}, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        year: d.getFullYear(),
        month: d.getMonth() + 1
      };
    }).reverse();

    let cumulativeBalance = 0;
    // Tính số dư gốc trước khi bắt đầu 6 tháng (để làm mốc cumulative)
    const oldestMonth = last6Months[0];
    const prefixOldest = `${oldestMonth.year}-${oldestMonth.month.toString().padStart(2, '0')}`;
    
    cumulativeBalance = this.transactionsSignal()
      .filter(t => t.date < prefixOldest)
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

    return last6Months.map(m => {
      const monthPrefix = `${m.year}-${m.month.toString().padStart(2, '0')}`;
      const monthTrans = this.transactionsSignal().filter(t => t.date.startsWith(monthPrefix));
      
      const income = monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const balance = income - expense;
      cumulativeBalance += balance;

      return {
        label: `T${m.month}/${m.year.toString().slice(-2)}`,
        income,
        expense,
        balance,
        cumulative: cumulativeBalance
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
