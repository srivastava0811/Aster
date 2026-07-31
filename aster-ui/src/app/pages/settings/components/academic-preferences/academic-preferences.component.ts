import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService } from '../../../../services/user.service';
import { UserSettings } from '../../../../models/models';

@Component({
  selector: 'app-academic-preferences',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatSlideToggleModule
  ],
  templateUrl: './academic-preferences.component.html',
  styleUrls: ['./academic-preferences.component.css']
})
export class AcademicPreferencesComponent implements OnChanges {
  @Input() settings: UserSettings | null = null;

  startDateStr: string = '';
  endDateStr: string = '';
  archivePastCourses: boolean = false;

  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['settings'] && this.settings) {
      this.startDateStr = this.settings.semesterStartDate ? this.formatDateForInput(this.settings.semesterStartDate) : '';
      this.endDateStr = this.settings.semesterEndDate ? this.formatDateForInput(this.settings.semesterEndDate) : '';
    }
  }

  private formatDateForInput(dateIsoStr: string): string {
    try {
      const d = new Date(dateIsoStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  onSave(): void {
    if (!this.settings) return;

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const startIso = this.startDateStr ? new Date(this.startDateStr).toISOString() : undefined;
    const endIso = this.endDateStr ? new Date(this.endDateStr).toISOString() : undefined;

    this.userService.updateUserSettings({
      semesterStartDate: startIso,
      semesterEndDate: endIso,
      notificationLeadTimeHours: this.settings.notificationLeadTimeHours,
      weeklyDigestEnabled: this.settings.weeklyDigestEnabled,
      defaultDueTime: this.settings.defaultDueTime,
      strictValidationEnabled: this.settings.strictValidationEnabled,
      assignmentFocusLimit: this.settings.assignmentFocusLimit ?? 5
    }).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.successMessage = 'Academic semester dates and archiving preferences saved!';
        this.settings = updated;
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to save academic preferences.';
      }
    });
  }
}
