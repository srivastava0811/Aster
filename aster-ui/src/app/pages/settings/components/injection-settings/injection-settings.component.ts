import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService } from '../../../../services/user.service';
import { UserSettings } from '../../../../models/models';

@Component({
  selector: 'app-injection-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSlideToggleModule],
  templateUrl: './injection-settings.component.html',
  styleUrls: ['./injection-settings.component.css']
})
export class InjectionSettingsComponent implements OnChanges {
  @Input() settings: UserSettings | null = null;

  defaultDueTime: string = '23:59';
  strictValidation: boolean = true;

  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['settings'] && this.settings) {
      this.defaultDueTime = this.settings.defaultDueTime || '23:59';
      this.strictValidation = this.settings.strictValidationEnabled ?? true;
    }
  }

  onSave(): void {
    if (!this.settings) return;

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userService.updateUserSettings({
      semesterStartDate: this.settings.semesterStartDate,
      semesterEndDate: this.settings.semesterEndDate,
      notificationLeadTimeHours: this.settings.notificationLeadTimeHours,
      weeklyDigestEnabled: this.settings.weeklyDigestEnabled,
      defaultDueTime: this.defaultDueTime,
      strictValidationEnabled: this.strictValidation,
      assignmentFocusLimit: this.settings.assignmentFocusLimit ?? 5
    }).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.successMessage = 'AI Syllabus injection settings saved!';
        this.settings = updated;
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to update injection settings.';
      }
    });
  }
}
