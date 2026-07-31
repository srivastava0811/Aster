import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService } from '../../../../services/user.service';
import { UserSettings } from '../../../../models/models';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSlideToggleModule],
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.css']
})
export class NotificationSettingsComponent implements OnChanges {
  @Input() settings: UserSettings | null = null;

  leadTimeHours: number = 24;
  weeklyDigest: boolean = false;
  assignmentFocusLimit: number = 5;

  isSaving = false;
  successMessage = '';
  errorMessage = '';

  reminderOptions = [
    { label: '12 Hours before deadline', hours: 12 },
    { label: '24 Hours before deadline (1 Day)', hours: 24 },
    { label: '48 Hours before deadline (2 Days)', hours: 48 },
    { label: '72 Hours before deadline (3 Days)', hours: 72 },
    { label: '168 Hours before deadline (1 Week)', hours: 168 }
  ];

  constructor(private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['settings'] && this.settings) {
      this.leadTimeHours = this.settings.notificationLeadTimeHours || 24;
      this.weeklyDigest = this.settings.weeklyDigestEnabled || false;
      this.assignmentFocusLimit = this.settings.assignmentFocusLimit || 5;
    }
  }

  onSave(): void {
    if (!this.settings) return;

    const limit = Number(this.assignmentFocusLimit);
    if (isNaN(limit) || limit < 1) {
      this.errorMessage = 'Assignment Focus limit must be a positive number.';
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userService.updateUserSettings({
      semesterStartDate: this.settings.semesterStartDate,
      semesterEndDate: this.settings.semesterEndDate,
      notificationLeadTimeHours: Number(this.leadTimeHours),
      weeklyDigestEnabled: this.weeklyDigest,
      defaultDueTime: this.settings.defaultDueTime,
      strictValidationEnabled: this.settings.strictValidationEnabled,
      assignmentFocusLimit: limit
    }).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.successMessage = 'Notification and smart reminder preferences saved!';
        this.settings = updated;
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to update notification settings.';
      }
    });
  }
}
