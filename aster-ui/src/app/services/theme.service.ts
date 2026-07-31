import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'aster_theme_primary';
  private readonly DEFAULT_COLOR = '#6366F1';

  private primaryColorSubject = new BehaviorSubject<string>(this.getStoredColor());
  public primaryColor$: Observable<string> = this.primaryColorSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  public get currentPrimaryColor(): string {
    return this.primaryColorSubject.value;
  }

  public getStoredColor(): string {
    return localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_COLOR;
  }

  public initTheme(): void {
    const color = this.getStoredColor();
    this.applyTheme(color);
  }

  public applyTheme(hexColor: string): void {
    const validHex = /^#[0-9A-Fa-f]{6}$/.test(hexColor) ? hexColor : this.DEFAULT_COLOR;

    // Persist immediately in localStorage so reloads keep the theme 100%
    localStorage.setItem(this.STORAGE_KEY, validHex);
    this.primaryColorSubject.next(validHex);

    const { r, g, b } = this.hexToRgb(validHex);
    const { h, s } = this.hexToHsl(validHex);
    const darkHex = this.adjustBrightness(validHex, -15);

    // Derive entire app color palette (backgrounds, surfaces, sidebar, borders) from the chosen hue
    const sat = Math.min(s, 35);
    const appBg = `hsl(${h}, ${sat}%, 6%)`;
    const cardBg = `hsl(${h}, ${sat}%, 11%)`;
    const sidebarBg = `hsl(${h}, ${sat + 2}%, 9%)`;
    const inputBg = `hsl(${h}, ${sat}%, 7%)`;
    const borderColor = `hsl(${h}, ${sat}%, 18%)`;
    const borderLight = `hsl(${h}, ${sat}%, 24%)`;

    const root = document.documentElement;
    root.style.setProperty('--aster-primary', validHex);
    root.style.setProperty('--aster-primary-hover', darkHex);
    root.style.setProperty('--aster-primary-rgb', `${r}, ${g}, ${b}`);
    root.style.setProperty('--aster-primary-light', `rgba(${r}, ${g}, ${b}, 0.15)`);
    root.style.setProperty('--aster-primary-glow', `rgba(${r}, ${g}, ${b}, 0.35)`);

    // Entire application theme background and surface variables
    root.style.setProperty('--aster-bg', appBg);
    root.style.setProperty('--aster-card-bg', cardBg);
    root.style.setProperty('--aster-sidebar-bg', sidebarBg);
    root.style.setProperty('--aster-input-bg', inputBg);
    root.style.setProperty('--aster-border', borderColor);
    root.style.setProperty('--aster-border-light', borderLight);
  }

  public resetToDefault(): void {
    this.applyTheme(this.DEFAULT_COLOR);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const cleanHex = hex.replace('#', '');
    const num = parseInt(cleanHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    const { r, g, b } = this.hexToRgb(hex);
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private adjustBrightness(hex: string, percent: number): string {
    const { r, g, b } = this.hexToRgb(hex);
    const clamp = (val: number) => Math.min(255, Math.max(0, val));
    const factor = (100 + percent) / 100;
    
    const newR = clamp(Math.round(r * factor));
    const newG = clamp(Math.round(g * factor));
    const newB = clamp(Math.round(b * factor));

    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }
}
