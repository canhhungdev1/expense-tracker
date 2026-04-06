import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard';
import { TransactionFormComponent } from './components/transaction-form';
import { TransactionHistoryComponent } from './components/transaction-history';
import { StatisticsComponent } from './components/statistics';
import { SettingsComponent } from './components/settings';
import { LoginComponent } from './components/auth/login';
import { RegisterComponent } from './components/auth/register';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Các trang được bảo vệ bởi AuthGuard
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'add', component: TransactionFormComponent, canActivate: [authGuard] },
  { path: 'history', component: TransactionHistoryComponent, canActivate: [authGuard] },
  { path: 'statistics', component: StatisticsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
