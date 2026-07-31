import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { UserSettings } from '../../../../models/models';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent {
  @Input() settings: UserSettings | null = null;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  isUpdatingPassword = false;
  isExporting = false;
  passwordSuccessMessage = '';
  passwordErrorMessage = '';
  exportSuccessMessage = '';

  constructor(private userService: UserService) {}

  onUpdatePassword(): void {
    if (!this.currentPassword || !this.newPassword) return;

    if (this.newPassword !== this.confirmPassword) {
      this.passwordErrorMessage = 'New passwords do not match.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordErrorMessage = 'New password must be at least 6 characters long.';
      return;
    }

    this.isUpdatingPassword = true;
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';

    this.userService.updatePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        this.isUpdatingPassword = false;
        this.passwordSuccessMessage = res.message || 'Password changed successfully.';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.isUpdatingPassword = false;
        this.passwordErrorMessage = err.error?.message || 'Failed to update password. Please check your current password.';
      }
    });
  }

  onExportData(): void {
    this.isExporting = true;
    this.exportSuccessMessage = '';

    this.userService.exportUserData().subscribe({
      next: (data) => {
        this.isExporting = false;
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Aster_Academic_Export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.exportSuccessMessage = 'Academic data exported successfully as JSON!';
      },
      error: (err) => {
        console.error('Export error:', err);
        this.isExporting = false;
      }
    });
  }
}
