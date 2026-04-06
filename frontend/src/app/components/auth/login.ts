import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 pb-12 transition-colors duration-500">
      <!-- Logo / Welcome -->
      <div class="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[32px] shadow-xl shadow-emerald-200 dark:shadow-none mx-auto mb-6 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Chào mừng bạn</h1>
        <p class="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Quản lý tài chính thông minh</p>
      </div>

      <!-- Login Form Card -->
      <div class="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 border border-white dark:border-slate-800 animate-in zoom-in-95 duration-500 delay-200">
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
            <input 
              type="email" 
              formControlName="email"
              placeholder="name@example.com"
              class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-950/30 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mật khẩu</label>
            <input 
              type="password" 
              formControlName="password"
              placeholder="••••••••"
              class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-950/30 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
            >
          </div>

          <div *ngIf="errorMessage()" class="p-4 bg-rose-50 rounded-2xl border border-rose-100">
            <p class="text-[11px] font-bold text-rose-500 text-center">{{ errorMessage() }}</p>
          </div>

          <button 
            type="submit"
            [disabled]="loginForm.invalid || isLoading()"
            class="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <span *ngIf="!isLoading()">Đăng nhập</span>
            <svg *ngIf="isLoading()" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>

        <div class="mt-10 text-center">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Chưa có tài khoản? 
            <a routerLink="/register" class="text-emerald-500 hover:text-emerald-600 ml-1">Đăng ký ngay</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      try {
        await this.authService.login(this.loginForm.value.email, this.loginForm.value.password);
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.errorMessage.set(error.error?.message || 'Đăng nhập không thành công. Vui lòng thử lại!');
      } finally {
        this.isLoading.set(false);
      }
    }
  }
}
