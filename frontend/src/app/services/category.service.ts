import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  group?: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/categories`;

  categories = signal<Category[]>([]);

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.loadCategories();
      } else {
        this.clearData();
      }
    });
  }

  async loadCategories() {
    try {
      const data = await firstValueFrom(this.http.get<Category[]>(this.apiUrl));
      this.categories.set(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  }

  clearData() {
    this.categories.set([]);
  }

  async create(category: Partial<Category>) {
    await firstValueFrom(this.http.post(this.apiUrl, category));
    await this.loadCategories();
  }

  async update(id: string, category: Partial<Category>) {
    await firstValueFrom(this.http.patch(`${this.apiUrl}/${id}`, category));
    await this.loadCategories();
  }

  async delete(id: string) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
    await this.loadCategories();
  }

  getCategoryIcon(id: string): string {
    return this.categories().find(c => c.id === id)?.icon || '✨';
  }

  getCategoryName(id: string): string {
    return this.categories().find(c => c.id === id)?.name || 'Khác';
  }
}
