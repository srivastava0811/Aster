import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/auth/login.component';
import { GlobalCalendarComponent } from './pages/dashboard/global-calendar.component';
import { ClassesComponent } from './pages/classes/classes.component';
import { SmartInputComponent } from './pages/smart-input/smart-input.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: GlobalCalendarComponent, canActivate: [AuthGuard] },
  { path: 'classes', component: ClassesComponent, canActivate: [AuthGuard] },
  { path: 'classes/:id/inject', component: SmartInputComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: '**', redirectTo: 'welcome' }
];

