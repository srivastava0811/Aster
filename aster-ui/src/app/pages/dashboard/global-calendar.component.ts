import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { AssignmentService } from '../../services/assignment.service';
import { CourseService } from '../../services/course.service';
import { UserService } from '../../services/user.service';
import { Assignment, Course } from '../../models/models';

@Component({
  selector: 'app-global-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, MatDialogModule],
  templateUrl: './global-calendar.component.html',
  styleUrls: ['./global-calendar.component.css']
})
export class GlobalCalendarComponent implements OnInit {
  assignments: Assignment[] = [];
  courses: Course[] = [];
  isLoading: boolean = true;
  selectedAssignment: Assignment | null = null;
  assignmentFocusLimit: number = 5;
  isFocusCollapsed: boolean = false;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: (typeof localStorage !== 'undefined' && localStorage.getItem('aster_preferred_calendar_view')) || 'dayGridMonth',
    timeZone: 'local',
    displayEventTime: false,
    allDaySlot: false,
    eventDisplay: 'block',
    slotMinTime: '01:00:00',
    slotDuration: '01:00:00',
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
      omitZeroMinute: true
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    buttonText: {
      today: 'Today',
      dayGridMonth: 'Month View',
      timeGridWeek: 'Week View'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventDidMount: (info) => {
      const fullTitle = info.event.extendedProps['fullTitle'] || info.event.title;
      info.el.setAttribute('title', fullTitle);
    },
    datesSet: (dateInfo) => {
      if (dateInfo.view && dateInfo.view.type) {
        localStorage.setItem('aster_preferred_calendar_view', dateInfo.view.type);
      }
    },
    height: 620,
    aspectRatio: 1.65
  };

  constructor(
    private assignmentService: AssignmentService,
    private courseService: CourseService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const savedFocus = localStorage.getItem('aster_assignment_focus_collapsed');
    if (savedFocus !== null) {
      this.isFocusCollapsed = savedFocus === 'true';
    }

    this.userService.getUserSettings().subscribe({
      next: (settings) => {
        this.assignmentFocusLimit = settings.assignmentFocusLimit > 0 ? settings.assignmentFocusLimit : 5;
      },
      error: () => {
        this.assignmentFocusLimit = 5;
      }
    });
    this.loadData();
  }

  toggleFocusCollapse(): void {
    this.isFocusCollapsed = !this.isFocusCollapsed;
    localStorage.setItem('aster_assignment_focus_collapsed', String(this.isFocusCollapsed));
  }

  get sortedAssignments(): Assignment[] {
    return [...this.assignments]
      .filter(a => !a.isCompleted)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, this.assignmentFocusLimit);
  }

  private formatEventTitle(rawTitle: string, courseName?: string): string {
    const titleStr = rawTitle || '';
    if (titleStr.includes(':')) {
      return titleStr.split(':')[0].trim();
    }
    if (courseName && courseName.includes(':')) {
      return courseName.split(':')[0].trim();
    }
    return (courseName || titleStr || 'Course').trim();
  }

  loadData(): void {
    this.isLoading = true;
    this.courseService.fetchCourses().subscribe(c => this.courses = c);

    this.assignmentService.getAssignments().subscribe({
      next: (data) => {
        this.assignments = data;

        const calendarEvents: EventInput[] = data.map((item: Assignment) => {
          const rawTitle = this.formatEventTitle(item.title, item.courseName);
          const displayTitle = item.isCompleted ? `✓ ${rawTitle}` : rawTitle;
          const fullTooltipText = item.courseName
            ? `${item.isCompleted ? '[Completed] ' : ''}${item.courseName} - ${item.title}`
            : item.title;

          const due = new Date(item.dueDate);
          const start = new Date(due.getTime() - 30 * 60 * 1000);

          return {
            id: item.id,
            title: displayTitle,
            start: start,
            end: due,
            backgroundColor: item.courseColorCode || '#4F46E5',
            borderColor: item.courseColorCode || '#4F46E5',
            textColor: '#FFFFFF',
            classNames: item.isCompleted ? ['completed-calendar-event'] : [],
            extendedProps: {
              fullTitle: fullTooltipText,
              assignmentTitle: item.title,
              courseName: item.courseName,
              rawText: item.rawInjectedText,
              isCompleted: item.isCompleted
            }
          };
        });

        this.calendarOptions = {
          ...this.calendarOptions,
          events: calendarEvents
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching calendar assignments:', err);
        this.isLoading = false;
      }
    });
  }

  handleEventClick(arg: any): void {
    const eventId = arg.event.id;
    this.selectedAssignment = this.assignments.find(a => a.id === eventId) || null;
  }

  selectAssignment(item: Assignment): void {
    this.selectedAssignment = item;
  }

  closeDetails(): void {
    this.selectedAssignment = null;
  }

  completeAssignment(item: Assignment, event?: Event): void {
    const targetInput = event?.target as HTMLInputElement;

    if (event) {
      event.stopPropagation();
    }

    const isCompleting = !item.isCompleted;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: isCompleting ? 'Complete Assignment?' : 'Mark as Incomplete?',
        message: isCompleting
          ? `Are you sure you want to mark "${item.title}" as completed? It will be removed from your Assignment Focus list.`
          : `Are you sure you want to mark "${item.title}" as incomplete?`,
        confirmText: isCompleting ? 'Mark Complete' : 'Mark Incomplete',
        cancelText: 'Cancel',
        confirmColor: isCompleting ? 'emerald' : 'amber',
        icon: isCompleting ? 'check_circle' : 'undo'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.assignmentService.toggleComplete(item.id).subscribe(() => {
          if (this.selectedAssignment?.id === item.id) {
            this.selectedAssignment = null;
          }
          this.loadData();
        });
      } else if (targetInput) {
        targetInput.checked = !!item.isCompleted;
      }
    });
  }

  deleteAssignment(id: string): void {
    const assignment = this.assignments.find(a => a.id === id);
    const title = assignment ? ` "${assignment.title}"` : '';

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Assignment?',
        message: `Are you sure you want to delete${title}? This action cannot be undone.`,
        confirmText: 'Delete Assignment',
        cancelText: 'Cancel',
        confirmColor: 'rose',
        icon: 'delete_forever'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.assignmentService.deleteAssignment(id).subscribe(() => {
          this.selectedAssignment = null;
          this.loadData();
        });
      }
    });
  }
}
