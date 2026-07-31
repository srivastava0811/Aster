import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/models';

@Component({
  selector: 'app-sidebar-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-navigation.component.html',
  styleUrls: ['./sidebar-navigation.component.css']
})
export class SidebarNavigationComponent implements OnInit {
  courses: Course[] = [];
  userEmail: string = '';
  isCollapsed: boolean = false;

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('aster_sidebar_collapsed');
    if (saved !== null) {
      this.isCollapsed = saved === 'true';
    }

    const user = this.authService.currentUserValue;
    this.userEmail = user ? user.email : '';

    this.courseService.courses$.subscribe(c => {
      this.courses = c;
    });

    if (this.authService.isLoggedIn) {
      this.courseService.fetchCourses().subscribe();
    }
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('aster_sidebar_collapsed', String(this.isCollapsed));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
