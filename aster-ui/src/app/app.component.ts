import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { SidebarNavigationComponent } from './layout/sidebar-navigation/sidebar-navigation.component';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { CourseService } from './services/course.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarNavigationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isAuthPage: boolean = false;

  constructor(
    public authService: AuthService,
    private themeService: ThemeService,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Router URL monitoring for sidebar visibility
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      this.isAuthPage = url.includes('/login') || url.includes('/welcome');
    });

    // Auto-fetch courses when user session is active
    this.authService.currentUser$.subscribe(user => {
      if (user && user.token) {
        this.courseService.fetchCourses().subscribe();
      } else {
        this.courseService.clearLocalCache();
      }
    });
  }
}
