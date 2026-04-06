import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 pb-12 transition-colors duration-500">
      <!-- Logo / Welcome -->
      <div class="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="w-40 h-40 mx-auto mb-4 drop-shadow-2xl">
          <img src="login-illustration.png" alt="Smart Finance" class="w-full h-full object-contain transform hover:scale-105 transition-transform duration-500">
        </div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Tạo tài khoản</h1>
        <p class="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">Bắt đầu hành trình tiết kiệm</p>
      </div>

      <!-- Register Form Card -->
      <div class="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 border border-white dark:border-slate-800 animate-in zoom-in-95 duration-500 delay-200">
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tên của bạn</label>
            <input 
              type="text" 
              formControlName="name"
              placeholder="Antigravity"
              class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-950/30 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
            >
          </div>

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
            [disabled]="registerForm.invalid || isLoading()"
            class="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <span *ngIf="!isLoading()">Đăng ký</span>
            <svg *ngIf="isLoading()" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>

        <div class="mt-10 text-center">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Đã có tài khoản? 
            <a routerLink="/login" class="text-indigo-500 hover:text-indigo-600 ml-1">Đăng nhập</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      try {
        await this.authService.register(
          this.registerForm.value.email, 
          this.registerForm.value.password,
          this.registerForm.value.name
        );
        // Sau khi đăng ký thành công, tự động đăng nhập hoặc chuyển về Login
        alert('Đăng ký thành công! Mời bạn đăng nhập.');
        this.router.navigate(['/login']);
      } catch (error: any) {
        this.errorMessage.set(error.error?.message || 'Đăng ký không thành công. Email có thể đã tồn tại!');
      } finally {
        this.isLoading.set(false);
      }
    }
  }
}
