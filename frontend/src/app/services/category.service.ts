import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  userId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://192.168.1.15:3000/api/categories';

  categories = signal<Category[]>([]);

  async loadCategories() {
    try {
      const data = await firstValueFrom(this.http.get<Category[]>(this.apiUrl));
      this.categories.set(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  }

  getCategoryIcon(id: number): string {
    return this.categories().find(c => c.id === id)?.icon || '✨';
  }

  getCategoryName(id: number): string {
    return this.categories().find(c => c.id === id)?.name || 'Khác';
  }
}
