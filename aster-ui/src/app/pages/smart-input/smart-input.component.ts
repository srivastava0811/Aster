import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CourseService } from '../../services/course.service';
import { AssignmentService } from '../../services/assignment.service';
import { Course, ParseAssignmentResponse, CreateAssignmentRequest } from '../../models/models';
import { ValidationDialogComponent } from './validation-dialog/validation-dialog.component';

@Component({
  selector: 'app-smart-input',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatDialogModule],
  templateUrl: './smart-input.component.html',
  styleUrls: ['./smart-input.component.css']
})
export class SmartInputComponent implements OnInit {
  courseId: string = '';
  course: Course | null = null;
  rawText: string = '';
  isParsing: boolean = false;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  presetExamples: string[] = [
    `CS 301 Full Semester Syllabus Schedule:
Week 1: Quiz 1 on Math Foundations due Sep 12th at 11:59 PM.
Week 4: Homework 1: Sorting Algorithms due Oct 5th at 5:00 PM.
Week 8: Midterm Examination on Oct 24th at 2:00 PM (25% of grade).
Week 12: Final Project Prototype Submission due Nov 28th at 11:59 PM.
Week 16: Final Comprehensive Exam on Dec 12th at 9:00 AM.`,
    
    `Biology 101 Course Schedule:
- Lab Report 1: Cell Staining due Sep 20th
- Midterm Quiz on Oct 14th
- Research Paper Submission due Nov 15th
- Final Lab Exam on Dec 8th`,

    `Single Announcement Sample:
Homework 3: Graph Traversal Algorithms due next Tuesday by 11:59 PM.`
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id') || '';
      if (this.courseId) {
        this.loadCourseDetails();
      }
    });
  }

  loadCourseDetails(): void {
    this.courseService.fetchCourses().subscribe(courses => {
      this.course = courses.find(c => c.id === this.courseId) || null;
      if (!this.course && courses.length > 0) {
        this.course = courses[0];
      }
    });
  }

  useExample(example: string): void {
    this.rawText = example;
  }

  onParseAndInject(): void {
    if (!this.rawText.trim() || !this.courseId) return;

    this.isParsing = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Call API POST /api/assignments/parse returning List<ParseAssignmentResponse>
    this.assignmentService.parseAssignment(this.courseId, this.rawText.trim()).subscribe({
      next: (parsedResults: ParseAssignmentResponse[]) => {
        this.isParsing = false;
        if (!parsedResults || parsedResults.length === 0) {
          this.errorMessage = 'No assignments could be extracted from the text. Try reformatting or pasting explicit deadline dates.';
          return;
        }
        this.openValidationModal(parsedResults);
      },
      error: (err) => {
        console.error('NLP Parse error:', err);
        this.isParsing = false;
        this.errorMessage = 'Failed to extract syllabus events. Please check server connections.';
      }
    });
  }

  openValidationModal(parsedResults: ParseAssignmentResponse[]): void {
    if (!this.course) return;

    const dialogRef = this.dialog.open(ValidationDialogComponent, {
      width: '780px',
      backdropClass: 'cdk-overlay-dark-backdrop',
      data: {
        course: this.course,
        parsedDataList: parsedResults,
        rawText: this.rawText.trim()
      }
    });

    dialogRef.afterClosed().subscribe((validatedItems: { title: string; dueDate: string }[] | null) => {
      if (validatedItems && validatedItems.length > 0) {
        this.commitAssignmentsToDatabase(validatedItems);
      }
    });
  }

  commitAssignmentsToDatabase(validatedItems: { title: string; dueDate: string }[]): void {
    this.isSaving = true;

    const bulkPayload: CreateAssignmentRequest[] = validatedItems.map(item => ({
      courseId: this.courseId,
      title: item.title,
      dueDate: item.dueDate,
      rawInjectedText: this.rawText.trim()
    }));

    this.assignmentService.createAssignmentsBulk(bulkPayload).subscribe({
      next: (savedList) => {
        this.isSaving = false;
        this.successMessage = `Successfully extracted & added ${savedList.length} assignments to your calendar!`;
        this.rawText = '';
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1200);
      },
      error: (err) => {
        console.error('Error bulk saving assignments:', err);
        this.isSaving = false;
        this.errorMessage = 'Failed to commit extracted syllabus assignments to database.';
      }
    });
  }
}
