import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'emerald' | 'rose' | 'indigo' | 'amber';
  icon?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="p-6 bg-aster-card text-slate-100 rounded-2xl border border-aster-theme shadow-2xl space-y-5 max-w-md w-full">
      <!-- Header with Icon & Text -->
      <div class="flex items-start space-x-3.5">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
             [ngClass]="{
               'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': data.confirmColor === 'emerald',
               'bg-rose-500/10 text-rose-400 border border-rose-500/20': data.confirmColor === 'rose',
               'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20': data.confirmColor === 'indigo',
               'bg-amber-500/10 text-amber-400 border border-amber-500/20': data.confirmColor === 'amber'
             }">
          <span class="material-icons text-xl">{{ data.icon || 'help_outline' }}</span>
        </div>

        <div>
          <h3 class="text-base font-bold text-white font-heading">{{ data.title }}</h3>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">{{ data.message }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end space-x-3 pt-2">
        <button (click)="onCancel()"
                type="button"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-aster-input hover:bg-white/5 border border-aster-theme transition-colors cursor-pointer">
          {{ data.cancelText || 'Cancel' }}
        </button>

        <button (click)="onConfirm()"
                type="button"
                class="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                [ngClass]="{
                  'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20': data.confirmColor === 'emerald',
                  'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20': data.confirmColor === 'rose',
                  'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20': data.confirmColor === 'indigo',
                  'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20': data.confirmColor === 'amber'
                }">
          <span>{{ data.confirmText || 'Confirm' }}</span>
        </button>
      </div>
    </div>
  `
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
