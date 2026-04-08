import { Component, EventEmitter, HostListener, Input, Output, signal, ElementRef, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pull-to-refresh',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative overflow-hidden min-h-full">
      <!-- Refresh Indicator -->
      <div 
        class="absolute left-0 right-0 flex justify-center z-50 pointer-events-none transition-transform duration-200 ease-out"
        [style.transform]="'translateY(' + pullDistance() + 'px)'"
        [style.opacity]="pullDistance() > 0 ? 1 : 0"
      >
        <div 
          class="bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-full p-2 mt-2 flex items-center justify-center transition-all duration-300"
          [class.scale-110]="isRefreshing()"
        >
          <div 
            class="transition-transform"
            [style.transform]="'rotate(' + (pullDistance() * 3) + 'deg)'"
            [class.animate-spin]="isRefreshing()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          
          <span *ngIf="isRefreshing()" class="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Đang cập nhật...
          </span>
        </div>
      </div>

      <!-- Content Container -->
      <div 
        class="transition-transform duration-200 ease-out"
        [style.transform]="'translateY(' + (pullDistance() / 1.5) + 'px)'"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { 
      display: block; 
      height: 100%; 
      overscroll-behavior-y: contain;
    }
  `]
})
export class PullToRefreshComponent implements AfterViewInit, OnDestroy {
  @Input() loading = false;
  @Output() refresh = new EventEmitter<void>();

  private el = inject(ElementRef);
  private readonly REFRESH_THRESHOLD = 80;
  private readonly MAX_PULL = 150;
  private touchStartListener?: (e: TouchEvent) => void;
  private touchMoveListener?: (e: TouchEvent) => void;
  private touchEndListener?: (e: TouchEvent) => void;

  pullDistance = signal(0);
  isRefreshing = signal(false);

  private startY = 0;
  private startX = 0;
  private currentY = 0;
  private active = false;
  private isSwipingHorizontally = false;

  ngAfterViewInit() {
    // All touch events are manual and non-passive to fully control the scroll sequence
    // and prevent conflicts with browser native pull-to-refresh
    this.touchStartListener = (e: TouchEvent) => this.onTouchStart(e);
    this.touchMoveListener = (e: TouchEvent) => this.onTouchMove(e);
    this.touchEndListener = (e: TouchEvent) => this.onTouchEnd();

    const el = this.el.nativeElement;
    el.addEventListener('touchstart', this.touchStartListener, { passive: false });
    el.addEventListener('touchmove', this.touchMoveListener, { passive: false });
    el.addEventListener('touchend', this.touchEndListener, { passive: false });
  }

  ngOnDestroy() {
    const el = this.el.nativeElement;
    if (this.touchStartListener) el.removeEventListener('touchstart', this.touchStartListener);
    if (this.touchMoveListener) el.removeEventListener('touchmove', this.touchMoveListener);
    if (this.touchEndListener) el.removeEventListener('touchend', this.touchEndListener);
  }

  private getScrollTop(event: TouchEvent): number {
    const parent = (event.target as HTMLElement).closest('.overflow-y-auto');
    if (parent) return parent.scrollTop;
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  onTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    this.startY = touch.pageY;
    this.startX = touch.pageX;
    this.isSwipingHorizontally = false;

    const scrollTop = this.getScrollTop(event);

    if (scrollTop <= 0 && !this.isRefreshing()) {
      this.active = true;
    } else {
      this.active = false;
    }
  }

  onTouchMove(event: TouchEvent) {
    if (!this.active || this.isSwipingHorizontally) return;

    this.currentY = event.touches[0].pageY;
    const currentX = event.touches[0].pageX;
    
    const diffY = this.currentY - this.startY;
    const diffX = currentX - this.startX;

    // Detect horizontal swipe to avoid accidental refresh
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      this.isSwipingHorizontally = true;
      this.active = false;
      return;
    }

    if (diffY > 0) {
      // Pulling DOWN - block native behavior to handle refresh
      if (event.cancelable) {
        event.preventDefault();
      }
      
      const resistance = 0.5;
      const cappedDiff = Math.min(diffY * resistance, this.MAX_PULL);
      this.pullDistance.set(cappedDiff);
    } else if (diffY < -5) {
      // Swiping UP - explicitly release control to allow natural scrolling DOWN
      // This is crucial to prevent "stuck" scrolling when starting at top
      this.active = false;
      this.pullDistance.set(0);
    } else {
      this.pullDistance.set(0);
    }
  }

  onTouchEnd() {
    if (!this.active || this.isSwipingHorizontally) {
      this.resetPull();
      return;
    }

    if (this.pullDistance() >= this.REFRESH_THRESHOLD) {
      this.triggerRefresh();
    } else {
      this.resetPull();
    }
    
    this.active = false;
  }

  private triggerRefresh() {
    this.isRefreshing.set(true);
    this.pullDistance.set(this.REFRESH_THRESHOLD);
    this.refresh.emit();
  }

  private resetPull() {
    this.pullDistance.set(0);
    this.isRefreshing.set(false);
    this.active = false;
  }

  ngOnChanges() {
    if (this.isRefreshing() && !this.loading) {
      setTimeout(() => this.resetPull(), 400);
    } else if (this.loading && !this.isRefreshing()) {
      this.isRefreshing.set(true);
      this.pullDistance.set(this.REFRESH_THRESHOLD);
    }
  }
}
