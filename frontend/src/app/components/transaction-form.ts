import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { CategoryService } from '../services/category.service';
import { CategoryPickerComponent } from './category-picker';

type TransactionType = 'income' | 'expense';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CategoryPickerComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 flex flex-col items-center pb-24 transition-colors duration-500">
      <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 border border-white dark:border-slate-800">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <button routerLink="/dashboard" class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <h2 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Ghi chép giao dịch</h2>
          <div class="w-10"></div>
        </div>

        <!-- Type Selector -->
        <div class="p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-[28px] flex mb-10 border border-slate-100 dark:border-slate-800">
          <button 
            (click)="setType('expense')"
            [ngClass]="type === 'expense' ? 'bg-white dark:bg-slate-900 shadow-sm text-rose-500' : 'text-slate-400 opacity-60'"
            class="flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-[22px] transition-all duration-300"
          >
            Chi tiền
          </button>
          <button 
            (click)="setType('income')"
            [ngClass]="type === 'income' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-500' : 'text-slate-400 opacity-60'"
            class="flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-[22px] transition-all duration-300"
          >
            Thu nhập
          </button>
        </div>

        <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="space-y-8">
          
          <!-- Amount Input - Large -->
          <div class="text-center group">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Số tiền</label>
            <div class="flex items-center justify-center gap-2">
              <span 
                [ngClass]="type === 'expense' ? 'text-rose-500' : 'text-emerald-500'"
                class="text-4xl font-semibold mb-2"
              >₫</span>
              <input 
                type="text" 
                formControlName="amount"
                (input)="onAmountInput($event)"
                class="w-auto min-w-[50px] text-center text-6xl font-black text-slate-900 dark:text-white border-none focus:ring-0 outline-none p-0 bg-transparent"
                [ngClass]="type === 'expense' ? 'placeholder-rose-100 dark:placeholder-rose-900/30' : 'placeholder-emerald-100 dark:placeholder-emerald-900/30'"
                placeholder="0"
                autofocus
                [style.width]="(transactionForm.get('amount')?.value?.toString()?.length || 1) * 35 + 'px'"
              >
            </div>
            <!-- Quick Amounts -->
            <div class="flex flex-wrap justify-center gap-2 mt-4 px-4 h-10 overflow-hidden">
               <button *ngFor="let q of quickAmounts" (click)="addQuickAmount(q)" type="button"
                 class="px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all">
                 +{{ q / 1000 }}k
               </button>
               <button (click)="clearAmount()" type="button" class="px-3 py-1.5 rounded-full border border-rose-100 dark:border-rose-900/30 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 active:scale-95 transition-all">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <div 
              [ngClass]="type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'"
              class="h-1.5 w-32 mx-auto rounded-full opacity-20 group-focus-within:w-60 group-focus-within:opacity-100 transition-all duration-500 mt-4"
            ></div>
          </div>

          <!-- Category Selection -->
          <div class="space-y-4">
            <div class="flex items-center justify-between px-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Danh mục</label>
              <span class="text-[9px] text-slate-400 dark:text-slate-500 font-medium italic underline underline-offset-4 decoration-slate-200 dark:decoration-slate-800">Trượt ngang</span>
            </div>
            <div class="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-6 px-6 snap-x snap-mandatory">
              <button 
                type="button"
                *ngFor="let cat of quickCategories()"
                (click)="transactionForm.patchValue({category: cat.id})"
                class="flex-shrink-0 flex flex-col items-center justify-center w-[92px] h-[92px] rounded-[32px] transition-all duration-300 border snap-center"
                [ngClass]="transactionForm.get('category')?.value === cat.id ? 
                  (type === 'expense' ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 ring-4 ring-rose-500/10 shadow-lg shadow-rose-100/50' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 ring-4 ring-emerald-500/10 shadow-lg shadow-emerald-100/50') : 
                  'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'"
              >
                <div class="text-3xl mb-1 transition-transform" [class.scale-125]="transactionForm.get('category')?.value === cat.id">{{cat.icon}}</div>
                <span class="text-[11px] font-bold" [ngClass]="transactionForm.get('category')?.value === cat.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'">{{cat.name}}</span>
              </button>

              <!-- "Khác" button -->
              <button 
                type="button"
                (click)="showPicker.set(true)"
                class="flex-shrink-0 flex flex-col items-center justify-center w-[92px] h-[92px] rounded-[32px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 snap-center active:scale-95 transition-all"
              >
                <div class="text-2xl mb-1 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>
                </div>
                <span class="text-[11px] font-bold text-slate-400">Khác</span>
              </button>
            </div>
          </div>

          <!-- Category Picker Modal -->
          <app-category-picker 
            *ngIf="showPicker()" 
            [type]="type" 
            (close)="showPicker.set(false)"
            (select)="onCategorySelect($event)"
          ></app-category-picker>

          <!-- Date and Note Group -->
          <div class="space-y-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800">
            <div class="space-y-2">
              <label class="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Ghi chú</label>
              <input 
                type="text" 
                formControlName="note"
                placeholder="Ví dụ: Ăn tối..."
                class="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-slate-100 dark:focus:ring-emerald-950/30 focus:border-slate-200 dark:focus:border-slate-700 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all text-sm"
              >
            </div>
            <div class="space-y-2">
              <label class="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Ngày giao dịch</label>
              <div class="relative">
                <input 
                  type="date" 
                  formControlName="date"
                  class="w-full pl-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-slate-100 dark:focus:ring-emerald-950/30 focus:border-slate-200 dark:focus:border-slate-700 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all text-sm"
                >
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            [disabled]="transactionForm.invalid || isSubmitting()"
            class="relative w-full py-5 rounded-[28px] text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:grayscale overflow-hidden"
            [ngClass]="type === 'expense' ? 'bg-rose-500 shadow-rose-200 dark:shadow-none' : 'bg-emerald-500 shadow-emerald-200 dark:shadow-none'"
          >
            <span *ngIf="!isSubmitting()" class="flex items-center justify-center gap-2">
               Lưu giao dịch
            </span>
            <div *ngIf="isSubmitting()" class="flex items-center justify-center gap-2">
               <!-- Spinner -->
               <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Đang lưu...
            </div>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class TransactionFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private transactionService = inject(TransactionService);

  private categoryService = inject(CategoryService);

  transactionForm: FormGroup;
  type: TransactionType = 'expense';
  isSubmitting = signal(false);
  showPicker = signal(false);

  quickAmounts = [20000, 50000, 100000, 200000, 500000];

  activeCategories = computed(() => {
    return this.categoryService.categories().filter(c => c.type === this.type);
  });

  quickCategories = computed(() => {
    const cats = this.activeCategories();
    // Show only the first 5 categories as quick chips
    return cats.slice(0, 5);
  });

  constructor() {
    this.transactionForm = this.fb.group({
      amount: ['', Validators.required],
      category: [null, Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      note: ['']
    });

    // Auto-select first category when loaded
    effect(() => {
      const cats = this.activeCategories();
      if (cats.length > 0 && !this.transactionForm.get('category')?.value) {
        this.transactionForm.patchValue({ category: cats[0].id });
      }
    });
  }

  setType(type: TransactionType) {
    this.type = type;
    const firstCat = this.activeCategories()[0]?.id;
    if (firstCat) {
      this.transactionForm.patchValue({ category: firstCat });
    }
  }

  onCategorySelect(category: any) {
    this.transactionForm.patchValue({ category: category.id });
    this.showPicker.set(false);
  }

  onAmountInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    this.updateAmountValue(value);
  }

  addQuickAmount(amountToAdd: number) {
    const currentStr = this.transactionForm.get('amount')?.value?.replace(/\D/g, '') || '0';
    const newAmount = Number(currentStr) + amountToAdd;
    this.updateAmountValue(newAmount.toString());
  }

  clearAmount() {
    this.updateAmountValue('');
  }

  private updateAmountValue(value: string) {
    if (value && value !== '0') {
      const formatted = Number(value).toLocaleString('en-US');
      this.transactionForm.get('amount')?.setValue(formatted, { emitEvent: false });
    } else {
      this.transactionForm.get('amount')?.setValue('', { emitEvent: false });
    }
  }

  async onSubmit() {
    if (this.transactionForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      
      const formValue = this.transactionForm.value;
      const rawAmount = Number(formValue.amount.replace(/,/g, ''));
      
      if (rawAmount < 1000) {
        alert('Số tiền tối thiểu là 1,000₫');
        this.isSubmitting.set(false);
        return;
      }

      try {
        await this.transactionService.addTransaction({
          note: formValue.note,
          amount: rawAmount,
          type: this.type,
          categoryId: formValue.category,
          date: formValue.date
        });
        
        // Satisfying delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 300);
        
      } catch (error) {
        alert('Lỗi khi lưu giao dịch vào máy chủ. Vui lòng kiểm tra lại kết nối!');
        this.isSubmitting.set(false);
      }
    }
  }
}
