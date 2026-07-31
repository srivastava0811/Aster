import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/models';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatDialogModule],
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {
  courses: Course[] = [];
  isLoading: boolean = true;
  newCourseName: string = '';
  selectedColor: string = '#4F46E5';

  presetColors: string[] = [
    '#4F46E5', // Deep Indigo
    '#14B8A6', // Teal Accent
    '#F59E0B', // Amber
    '#EF4444', // Soft Crimson
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#10B981', // Emerald
    '#3B82F6'  // Blue
  ];

  get isCustomColor(): boolean {
    return !this.presetColors.includes(this.selectedColor);
  }

  constructor(
    private courseService: CourseService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.fetchCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load courses', err);
        this.isLoading = false;
      }
    });
  }

  createCourse(): void {
    if (!this.newCourseName.trim()) return;

    this.courseService.createCourse({
      name: this.newCourseName.trim(),
      colorCode: this.selectedColor
    }).subscribe({
      next: () => {
        this.newCourseName = '';
        this.loadCourses();
      }
    });
  }

  deleteCourse(id: string, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      backdropClass: 'cdk-overlay-dark-backdrop',
      data: {
        title: 'Delete Academic Course',
        courseName: name
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.courseService.deleteCourse(id).subscribe(() => {
          this.loadCourses();
        });
      }
    });
  }
}
