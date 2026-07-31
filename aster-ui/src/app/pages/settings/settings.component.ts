import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { UserSettings } from '../../models/models';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { AcademicPreferencesComponent } from './components/academic-preferences/academic-preferences.component';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component';
import { InjectionSettingsComponent } from './components/injection-settings/injection-settings.component';
import { ThemeSettingsComponent } from './components/theme-settings/theme-settings.component';

export type SettingsCategory = 'account' | 'academic' | 'notifications' | 'injection' | 'theme';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    AccountSettingsComponent,
    AcademicPreferencesComponent,
    NotificationSettingsComponent,
    InjectionSettingsComponent,
    ThemeSettingsComponent
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  activeCategory: SettingsCategory = 'account';
  settings: UserSettings | null = null;
  isLoading = true;
  errorMessage = '';

  menuItems: Array<{ id: SettingsCategory; label: string; icon: string; description: string }> = [
    { id: 'account', label: 'Account & Security', icon: 'manage_accounts', description: 'Email, password & backup' },
    { id: 'academic', label: 'Academic Term', icon: 'school', description: 'Semester dates & archiving' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications_active', description: 'Reminders & weekly digest' },
    { id: 'injection', label: 'AI Injection', icon: 'psychology', description: 'Default due time & validation' },
    { id: 'theme', label: 'Theme & Accent', icon: 'palette', description: 'Custom app accent color' }
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.userService.getUserSettings().subscribe({
      next: (data) => {
        this.settings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading user settings', err);
        this.errorMessage = 'Failed to load user settings from backend.';
        this.isLoading = false;
      }
    });
  }

  selectCategory(category: SettingsCategory): void {
    this.activeCategory = category;
  }
}
