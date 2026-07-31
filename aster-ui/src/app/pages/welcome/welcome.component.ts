import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  constructor(private router: Router) {}

  MapsToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { mode: 'login' } });
  }

  MapsToRegister(): void {
    this.router.navigate(['/login'], { queryParams: { mode: 'register' } });
  }
}
