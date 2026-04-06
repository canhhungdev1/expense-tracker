import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, Transaction } from '../services/transaction.service';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pb-24 transition-colors duration-500">
      <!-- Header with Search & Filter -->
      <div class="mb-8 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Lịch sử</h1>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Theo dõi chi tiêu của bạn</p>
          </div>
          <div class="flex gap-2">
            <button (click)="showFilters.set(!showFilters())" [class]="showFilters() ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-white dark:bg-slate-900 text-slate-400'" class="w-11 h-11 rounded-2xl shadow-sm flex items-center justify-center transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Search Bar -->
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-emerald-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Tìm kiếm giao dịch..."
              class="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border-transparent rounded-[22px] focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm text-slate-700 dark:text-slate-200 transition-all placeholder:text-slate-400"
            >
          </div>

          <!-- Advanced Filter Panel -->
          <div *ngIf="showFilters()" class="bg-white dark:bg-slate-900 rounded-[32px] p-6 space-y-6 border border-slate-100 dark:border-slate-800 shadow-xl">
            <div class="flex items-center justify-between">
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bộ lọc nâng cao</h3>
              <button (click)="clearFilters()" class="text-[9px] font-black text-rose-500 uppercase tracking-widest">Xóa hết</button>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Loại giao dịch</label>
                <div class="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <button (click)="filterType.set('all')" [class]="filterType() === 'all' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-600' : 'text-slate-400'" class="flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all">Tất cả</button>
                  <button (click)="filterType.set('income')" [class]="filterType() === 'income' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-600' : 'text-slate-400'" class="flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all">Thu nhập</button>
                  <button (click)="filterType.set('expense')" [class]="filterType() === 'expense' ? 'bg-white dark:bg-slate-900 shadow-sm text-rose-600' : 'text-slate-400'" class="flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all">Chi tiêu</button>
                </div>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Từ ngày</label>
                <input type="date" [ngModel]="startDate()" (ngModelChange)="startDate.set($event)" class="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none">
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Đến ngày</label>
                <input type="date" [ngModel]="endDate()" (ngModelChange)="endDate.set($event)" class="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none">
              </div>
              <div class="col-span-2 pt-2">
                <button (click)="showFilters.set(false)" class="w-full py-4 bg-emerald-500 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/25">
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Horizontal Scroll -->
        <div class="flex gap-3 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
          <button 
            (click)="selectedCategory.set('all')"
            [class]="selectedCategory() === 'all' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800'"
            class="px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300"
          >Tất cả</button>
          <button 
            *ngFor="let cat of categoryService.categories()"
            (click)="selectedCategory.set(cat.id.toString())"
            [class]="selectedCategory() === cat.id.toString() ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800'"
            class="px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 flex items-center gap-2"
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
          </button>
        </div>
      </div>

      <!-- Transaction Groups -->
      <div class="space-y-10 relative">
        <!-- Loading Overlay -->
        <div *ngIf="isLoading()" class="absolute inset-x-0 -top-4 flex justify-center z-10">
          <div class="bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-full flex items-center gap-2 animate-bounce">
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span class="text-[9px] font-black uppercase tracking-widest text-slate-500">Đang tải...</span>
          </div>
        </div>

        <div *ngFor="let group of groupedTransactions()">
          <div class="flex items-center justify-between mb-4 px-2">
            <h2 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{{ group.dateLabel }}</h2>
            <span class="text-[10px] font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{{ group.total | number:'1.0-0' }}₫</span>
          </div>

          <div class="space-y-3">
            <div *ngFor="let t of group.transactions" class="bg-white dark:bg-slate-900 p-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-md transition-all duration-300">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-[20px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                  {{ t.category?.icon || '✨' }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="font-black text-slate-900 dark:text-white text-sm tracking-tight capitalize">{{ t.note || t.category?.name || 'Giao dịch' }}</h3>
                    <div class="flex flex-col items-end">
                      <span [class]="t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'" class="font-black text-base tracking-tight">
                        {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | number:'1.0-0' }}₫
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ t.category?.name || 'Khác' }}</span>
                    <div class="flex gap-2">
                      <button (click)="onEdit(t)" class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button (click)="onDelete(t.id)" class="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div *ngIf="transactionService.hasMoreHistory() && !isLoading()" class="pt-4 pb-8 flex justify-center">
           <button (click)="onLoadMore()" class="group relative px-8 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
             <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-emerald-500 transition-colors">Xem thêm giao dịch</span>
           </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="groupedTransactions().length === 0 && !isLoading()" class="pt-20 text-center">
          <div class="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[40px] flex items-center justify-center mx-auto mb-6 text-4xl grayscale opacity-50">
            🔎
          </div>
          <h3 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">Không tìm thấy giao dịch</h3>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      </div>

      <!-- Edit Modal -->
      <div *ngIf="isEditModalOpen()" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" (click)="isEditModalOpen.set(false)"></div>
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Sửa giao dịch</h2>
            <button (click)="isEditModalOpen.set(false)" class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <form *ngIf="editingTransaction()" class="space-y-6">
            <div class="space-y-2 text-center pb-4">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Loại giao dịch</p>
              <div class="flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-[24px] max-w-[280px] mx-auto border border-slate-100 dark:border-slate-700/50">
                <button type="button" 
                  (click)="editingTransaction.update(t => t ? ({...t, type: 'expense'}) : null)"
                  [class]="editingTransaction()?.type === 'expense' ? 'bg-white dark:bg-slate-950 text-rose-500 shadow-md scale-105' : 'text-slate-400'"
                  class="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-300">
                  Chi tiêu
                </button>
                <button type="button"
                  (click)="editingTransaction.update(t => t ? ({...t, type: 'income'}) : null)"
                  [class]="editingTransaction()?.type === 'income' ? 'bg-white dark:bg-slate-950 text-emerald-500 shadow-md scale-105' : 'text-slate-400'"
                  class="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-300">
                  Thu nhập
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Số tiền (₫)</label>
              <input type="number" [(ngModel)]="editingTransaction()!.amount" name="amount" class="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-2xl font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-center">
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Danh mục</label>
              <div class="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                <button type="button"
                  *ngFor="let cat of filteredCategories()"
                  (click)="editingTransaction.update(t => t ? ({...t, categoryId: cat.id}) : null)"
                  [class]="editingTransaction()?.categoryId === cat.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105 ring-4 ring-emerald-500/10' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
                  class="flex flex-col items-center gap-2 p-4 rounded-[24px] transition-all duration-300">
                  <span class="text-2xl">{{ cat.icon }}</span>
                  <span class="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center">{{ cat.name }}</span>
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ghi chú & Ngày</label>
              <div class="grid grid-cols-2 gap-4">
                <input type="text" [(ngModel)]="editingTransaction()!.note" name="note" placeholder="Nhập ghi chú..." class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none">
                <input type="date" [(ngModel)]="editingTransaction()!.date" name="date" class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none">
              </div>
            </div>

            <div class="pt-4 flex gap-4">
              <button (click)="isEditModalOpen.set(false)" type="button" class="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Hủy</button>
              <button (click)="onSaveEdit()" type="button" class="flex-[2] py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class TransactionHistoryComponent {
  transactionService = inject(TransactionService);
  categoryService = inject(CategoryService);

  searchQuery = signal('');
  selectedCategory = signal<string>('all');
  
  showFilters = signal(false);
  filterType = signal<'all' | 'income' | 'expense'>('all');
  startDate = signal('');
  endDate = signal('');
  minAmount = signal<number | undefined>(undefined);
  maxAmount = signal<number | undefined>(undefined);

  isLoading = signal(false);
  editingTransaction = signal<Transaction | null>(null);
  isEditModalOpen = signal(false);

  constructor() {
    // Tự động tải lại lịch sử khi có bất kỳ bộ lọc nào thay đổi
    effect(() => {
      const filters = {
        search: this.searchQuery(),
        type: this.filterType() !== 'all' ? this.filterType() : undefined,
        categoryId: this.selectedCategory() !== 'all' ? Number(this.selectedCategory()) : undefined,
        startDate: this.startDate(),
        endDate: this.endDate()
      };
      
      this.isLoading.set(true);
      this.transactionService.loadHistory(filters).then(() => {
        this.isLoading.set(false);
      });
    }, { allowSignalWrites: true });
  }

  filteredCategories = computed(() => {
    const type = this.editingTransaction()?.type || 'expense';
    return this.categoryService.categories().filter(c => c.type === type);
  });

  async onLoadMore() {
    if (this.isLoading()) return;
    
    const filters = {
      search: this.searchQuery(),
      type: this.filterType() !== 'all' ? this.filterType() : undefined,
      categoryId: this.selectedCategory() !== 'all' ? Number(this.selectedCategory()) : undefined,
      startDate: this.startDate(),
      endDate: this.endDate()
    };

    this.isLoading.set(true);
    await this.transactionService.loadHistory(filters, true);
    this.isLoading.set(false);
  }

  async onDelete(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa giao dịch này không?')) {
      try {
        await this.transactionService.deleteTransaction(id);
        // Tải lại lịch sử sau khi xóa
        this.onLoadMore(); // Hoặc reset về trang 1
      } catch (error) {
        alert('Lỗi khi xóa giao dịch. Vui lòng thử lại!');
      }
    }
  }

  onEdit(transaction: Transaction) {
    this.editingTransaction.set({ ...transaction });
    this.isEditModalOpen.set(true);
  }

  async onSaveEdit() {
    const t = this.editingTransaction();
    if (t) {
      try {
        await this.transactionService.updateTransaction(t.id, {
          type: t.type,
          amount: t.amount,
          categoryId: t.categoryId,
          date: t.date,
          note: t.note
        });
        this.isEditModalOpen.set(false);
        this.editingTransaction.set(null);
        // Tải lại lịch sử sau khi sửa
      } catch (error) {
        alert('Lỗi khi cập nhật giao dịch. Vui lòng kiểm tra lại!');
      }
    }
  }

  clearFilters() {
    this.filterType.set('all');
    this.selectedCategory.set('all');
    this.startDate.set('');
    this.endDate.set('');
    this.minAmount.set(undefined);
    this.maxAmount.set(undefined);
    this.searchQuery.set('');
  }

  groupedTransactions = computed(() => {
    // Dữ liệu ở đây đã được Backend lọc sẵn
    const list = this.transactionService.historyTransactions();
    
    const groups: Record<string, Transaction[]> = {};
    list.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });

    return Object.entries(groups)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, items]) => ({
        date,
        dateLabel: this.formatDateLabel(date),
        transactions: items,
        total: items.reduce((sum, item) => sum + (item.type === 'income' ? Number(item.amount) : -Number(item.amount)), 0)
      }));
  });

  private formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return `${days[d.getDay()]}, ${d.toLocaleDateString('vi-VN')}`;
  }
}
