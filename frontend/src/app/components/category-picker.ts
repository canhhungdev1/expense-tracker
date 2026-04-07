import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../services/category.service';

@Component({
  selector: 'app-category-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in" (click)="onClose()">
      <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden transition-all animate-in slide-in-from-bottom flex flex-col max-h-[90vh]" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <h3 class="text-xl font-black text-slate-800 dark:text-white">Chọn danh mục</h3>
          <button (click)="onClose()" class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
          </button>
        </div>

        <!-- Search & Create -->
        <div class="p-6 flex gap-4">
          <input [(ngModel)]="searchQuery" placeholder="Tìm kiến danh mục..." class="flex-1 pl-6 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200">
          <button (click)="showCreateForm = true" class="px-6 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
            + Tạo mới
          </button>
        </div>

        <!-- Categories List -->
        <div class="flex-1 overflow-y-auto px-6 pb-12 no-scrollbar">
          <div *ngFor="let group of filteredGroupedCategories()" class="mb-8">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">{{ group.label }}</h4>
            <div class="grid grid-cols-4 gap-4">
              <button *ngFor="let cat of group.categories" (click)="onSelect(cat)" class="group flex flex-col items-center gap-2 p-2 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <div class="w-16 h-16 rounded-[22px] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{{ cat.icon }}</div>
                <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">{{ cat.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Create Form Overlay -->
        <div *ngIf="showCreateForm" class="absolute inset-0 z-10 bg-white dark:bg-slate-900 animate-in slide-in-from-right flex flex-col">
          <div class="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4">
            <button (click)="showCreateForm = false" class="text-slate-400">← Quay lại</button>
            <h3 class="text-xl font-black text-slate-800 dark:text-white">Danh mục mới</h3>
          </div>
          <div class="p-8 space-y-10 overflow-y-auto no-scrollbar flex-1">
             <div class="grid grid-cols-5 gap-4">
               <button *ngFor="let icon of icons" (click)="newItem.icon = icon" [class.ring-4]="newItem.icon === icon" class="aspect-square rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl ring-rose-500/20">{{ icon }}</button>
             </div>
             <input [(ngModel)]="newItem.name" placeholder="Tên danh mục..." class="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-[28px] font-bold">
             <div class="flex flex-wrap gap-2">
               <button 
                 *ngFor="let g of groups" 
                 (click)="newItem.group = g.id" 
                 [ngClass]="{
                   'bg-slate-50 dark:bg-slate-800 text-slate-500': newItem.group !== g.id,
                   'bg-emerald-500 text-white shadow-lg shadow-emerald-200': newItem.group === g.id && g.type === 'income',
                   'bg-rose-500 text-white shadow-lg shadow-rose-200': newItem.group === g.id && g.type === 'expense'
                 }"
                 class="px-5 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-transparent"
                 [class.border-emerald-200]="g.type === 'income' && newItem.group !== g.id"
                 [class.border-rose-100]="g.type === 'expense' && newItem.group !== g.id"
               >
                 {{ g.label }}
               </button>
             </div>
          </div>
          <div class="p-8 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
            <button 
              (click)="save()" 
              [disabled]="!newItem.name" 
              [ngClass]="getSelectedGroupType() === 'income' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'"
              class="w-full py-5 rounded-[28px] text-white font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-50 transition-colors"
            >
              Lưu danh mục
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`.no-scrollbar::-webkit-scrollbar { display: none; }`]
})
export class CategoryPickerComponent {
  @Input() type: 'income' | 'expense' = 'expense';
  @Output() select = new EventEmitter<Category>();
  @Output() close = new EventEmitter<void>();

  private service = inject(CategoryService);
  searchQuery = '';
  showCreateForm = false;
  groups = [
    { id: 'sinh_hoat', label: 'Sinh hoạt', type: 'expense' },
    { id: 'phat_sinh', label: 'Phát sinh', type: 'expense' },
    { id: 'co_dinh', label: 'Cố định', type: 'expense' },
    { id: 'dau_tu', label: 'Đầu tư', type: 'expense' },
    { id: 'thu_nhap', label: 'Thu nhập', type: 'income' }
  ];
  icons = ['🍲', '🛒', '🚗', '🛍️', '🎬', '💄', '❤️', '🎁', '🧾', '🏠', '👶', '🧸', '💰', '📚', '✨', '🥪', '🎮', '💡', '🧪', '🧧'];
  newItem = { name: '', icon: '✨', group: 'sinh_hoat' };

  filteredGroupedCategories = computed(() => {
    const all = this.service.categories().filter(c => c.type === this.type);
    const q = this.searchQuery.toLowerCase().trim();
    const filtered = q ? all.filter(c => c.name.toLowerCase().includes(q)) : all;
    
    const results: any[] = [];
    const relevantGroups = this.groups.filter(g => this.type === 'income' ? g.id === 'thu_nhap' : g.id !== 'thu_nhap');
    
    relevantGroups.forEach(g => {
      const cats = filtered.filter(c => c.group === g.id || (!c.group && g.id === 'sinh_hoat'));
      if (cats.length > 0) results.push({ label: g.label, categories: cats });
    });
    return results;
  });

  getSelectedGroupType() {
    return this.groups.find(g => g.id === this.newItem.group)?.type || 'expense';
  }

  onSelect(cat: Category) { this.select.emit(cat); this.close.emit(); }
  onClose() { this.close.emit(); }
  async save() {
    const groupType = this.getSelectedGroupType();
    await this.service.create({ 
      ...this.newItem, 
      type: groupType as any, 
      color: groupType === 'income' ? '#10B981' : '#F43F5E' 
    });
    this.showCreateForm = false;
    this.newItem = { name: '', icon: '✨', group: 'sinh_hoat' };
  }
}
