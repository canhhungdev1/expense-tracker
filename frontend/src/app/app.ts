import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="max-w-md mx-auto min-h-screen relative bg-slate-50 dark:bg-slate-950 shadow-xl overflow-hidden font-sans transition-colors duration-300">
      <!-- Main Content Area -->
      <main class="h-full overflow-y-auto">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Navigation Bar - Only show when logged in -->
      <nav *ngIf="authService.isLoggedIn()" class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex justify-between items-center z-50 animate-in fade-in slide-in-from-bottom-10 duration-500">
        <!-- Dashboard -->
        <a routerLink="/dashboard" 
           routerLinkActive="active-nav"
           class="flex flex-col items-center gap-1 group">
          <div class="w-12 h-8 rounded-2xl flex items-center justify-center transition-all group-[.active-nav]:bg-emerald-50 group-[.active-nav]:dark:bg-emerald-950/30 text-slate-400 group-[.active-nav]:text-emerald-600 group-[.active-nav]:dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-[.active-nav]:text-emerald-600 group-[.active-nav]:dark:text-emerald-400">Tổng quan</span>
        </a>

        <!-- History -->
        <a routerLink="/history" 
           routerLinkActive="active-nav"
           class="flex flex-col items-center gap-1 group">
          <div class="w-12 h-8 rounded-2xl flex items-center justify-center transition-all group-[.active-nav]:bg-emerald-50 group-[.active-nav]:dark:bg-emerald-950/30 text-slate-400 group-[.active-nav]:text-emerald-600 group-[.active-nav]:dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-[.active-nav]:text-emerald-600 group-[.active-nav]:dark:text-emerald-400">Lịch sử</span>
        </a>

        <!-- Spacer for Floating Button -->
        <div class="w-12"></div>

        <!-- Floating Add Button -->
        <a routerLink="/add" 
           class="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-200 dark:shadow-emerald-950/50 flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 border-4 border-white dark:border-slate-900 z-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
          </svg>
        </a>

        <!-- Statistics -->
        <a routerLink="/statistics" 
           routerLinkActive="active-nav"
           class="flex flex-col items-center gap-1 group">
          <div class="w-12 h-8 rounded-2xl flex items-center justify-center transition-all group-[.active-nav]:bg-emerald-50 group-[.active-nav]:dark:bg-emerald-950/30 text-slate-400 group-[.active-nav]:text-emerald-600 group-[.active-nav]:dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-[.active-nav]:text-emerald-600 group-[.active-nav]:dark:text-emerald-400">Thống kê</span>
        </a>

        <!-- Settings/Me -->
        <a routerLink="/settings" 
           routerLinkActive="active-nav"
           class="flex flex-col items-center gap-1 group">
          <div class="w-12 h-8 rounded-2xl flex items-center justify-center transition-all group-[.active-nav]:bg-emerald-50 group-[.active-nav]:dark:bg-emerald-950/30 text-slate-400 group-[.active-nav]:text-emerald-600 group-[.active-nav]:dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-[.active-nav]:text-emerald-600 group-[.active-nav]:dark:text-emerald-400">Cá nhân</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .active-nav { /* Custom active state handled by tailwind classes */ }
  `]
})
export class App {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
}
