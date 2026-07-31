import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../../services/theme.service';

export interface ColorPreset {
  name: string;
  hex: string;
}

@Component({
  selector: 'app-theme-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-settings.component.html',
  styleUrls: ['./theme-settings.component.css']
})
export class ThemeSettingsComponent implements OnInit {
  selectedColor: string = '#6366F1';
  successMessage: string = '';

  presetSwatches: ColorPreset[] = [
    { name: 'Indigo (Default)', hex: '#6366F1' },
    { name: 'Teal Accent', hex: '#14B8A6' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Rose', hex: '#F43F5E' },
    { name: 'Violet', hex: '#8B5CF6' },
    { name: 'Amber', hex: '#F59E0B' },
    { name: 'Cyan', hex: '#06B6D4' },
    { name: 'Sky', hex: '#0EA5E9' }
  ];

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    this.selectedColor = this.themeService.currentPrimaryColor;
  }

  selectPreset(hex: string): void {
    this.selectedColor = hex;
    this.applyTheme();
  }

  onColorChange(): void {
    this.applyTheme();
  }

  applyTheme(): void {
    this.themeService.applyTheme(this.selectedColor);
    this.successMessage = `Global application theme color updated to ${this.selectedColor.toUpperCase()}!`;
    setTimeout(() => this.successMessage = '', 3000);
  }

  resetDefault(): void {
    this.themeService.resetToDefault();
    this.selectedColor = this.themeService.currentPrimaryColor;
    this.successMessage = 'Theme reset to default Indigo (#6366F1)!';
    setTimeout(() => this.successMessage = '', 3000);
  }
}
