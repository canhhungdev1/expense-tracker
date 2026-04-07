import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api/auth';

  private userSignal = signal<User | null>(null);
  
  currentUser = computed(() => this.userSignal());
  isLoggedIn = computed(() => !!this.userSignal());

  constructor() {
    this.loadUser();
  }

  private loadUser() {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      this.userSignal.set(JSON.parse(savedUser));
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      );
      this.setSession(response);
      return response;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  }

  async register(email: string, password: string, name: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.post(`${this.apiUrl}/register`, { email, password, name })
      );
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem('token', authResult.access_token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.userSignal.set(authResult.user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
