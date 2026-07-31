import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isRegistering: boolean = false;
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'register') {
        this.isRegistering = true;
        this.email = '';
        this.password = '';
      } else {
        // Login mode: pre-fill with demo credentials for convenience
        this.isRegistering = false;
        this.email = 'student@aster.edu';
        this.password = 'aster123';
      }
    });
  }

  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
    // Clear fields when switching to register; restore demo hints on login
    if (this.isRegistering) {
      this.email = '';
      this.password = '';
    } else {
      this.email = 'student@aster.edu';
      this.password = 'aster123';
    }
  }

  onSubmit(): void {
    if (!this.email.trim() || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    const authCall = this.isRegistering
      ? this.authService.register(this.email.trim(), this.password)
      : this.authService.login(this.email.trim(), this.password);

    authCall.subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Auth error:', err);
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (err.status === 401) {
          this.errorMessage = 'Incorrect email or password. Please try again.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot reach the backend. Please ensure the API server is running on http://localhost:5000.';
        } else {
          this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
        }
      }
    });
  }
}
