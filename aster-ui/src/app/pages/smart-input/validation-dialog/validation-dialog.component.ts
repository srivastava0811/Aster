import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ParseAssignmentResponse, Course } from '../../../models/models';

export interface ExtractedAssignmentItem {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DDTHH:mm
  confidenceScore: number;
  extractedNotes?: string;
  included: boolean;
}

export interface ValidationDialogData {
  course: Course;
  parsedDataList: ParseAssignmentResponse[];
  rawText: string;
}

@Component({
  selector: 'app-validation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './validation-dialog.component.html',
  styleUrls: ['./validation-dialog.component.css']
})
export class ValidationDialogComponent {
  items: ExtractedAssignmentItem[] = [];

  constructor(
    public dialogRef: MatDialogRef<ValidationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ValidationDialogData
  ) {
    const list = data.parsedDataList || [];
    this.items = list.map((item, index) => {
      return {
        id: `item-${index}-${Date.now()}`,
        title: item.parsedTitle || 'Untitled Assignment',
        dueDate: this.formatDateForInput(item.parsedDueDate),
        confidenceScore: item.confidenceScore || 0.8,
        extractedNotes: item.extractedNotes,
        included: true
      };
    });
  }

  private formatDateForInput(dateInput: any): string {
    let date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  get includedItemsCount(): number {
    return this.items.filter(i => i.included && i.title.trim() && i.dueDate).length;
  }

  get allSelected(): boolean {
    return this.items.length > 0 && this.items.every(i => i.included);
  }

  toggleSelectAll(): void {
    const nextState = !this.allSelected;
    this.items.forEach(i => i.included = nextState);
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  getConfidenceBadge(score: number): { label: string; class: string } {
    const pct = Math.round(score * 100);
    if (pct >= 85) return { label: `${pct}% High`, class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    if (pct >= 70) return { label: `${pct}% Med`, class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return { label: `${pct}% Low`, class: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onConfirm(): void {
    const validItems = this.items
      .filter(i => i.included && i.title.trim() && i.dueDate)
      .map(i => {
        let isoStr = i.dueDate;
        if (isoStr.length === 16) {
          isoStr += ':00';
        }
        return {
          title: i.title.trim(),
          dueDate: isoStr
        };
      });

    if (validItems.length === 0) return;

    this.dialogRef.close(validItems);
  }
}
