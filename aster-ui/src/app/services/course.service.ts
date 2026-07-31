import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Course, CreateCourseRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = '/api/courses';
  private coursesSubject = new BehaviorSubject<Course[]>(this.getStoredCourses());
  public courses$ = this.coursesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredCourses(): Course[] {
    try {
      const data = localStorage.getItem('aster_saved_courses');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToLocalStorage(courses: Course[]): void {
    try {
      localStorage.setItem('aster_saved_courses', JSON.stringify(courses));
    } catch (e) {
      console.warn('Failed to persist courses to localStorage', e);
    }
  }

  fetchCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl).pipe(
      tap(courses => {
        this.coursesSubject.next(courses);
        this.saveToLocalStorage(courses);
      }),
      catchError(err => {
        console.error('Failed to fetch courses from server, utilizing local cache', err);
        return of(this.coursesSubject.value);
      })
    );
  }

  createCourse(course: CreateCourseRequest): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course).pipe(
      tap(newCourse => {
        const current = this.coursesSubject.value;
        const updated = [newCourse, ...current.filter(c => c.id !== newCourse.id)];
        this.coursesSubject.next(updated);
        this.saveToLocalStorage(updated);
        // Refresh full list from server to get accurate count
        this.fetchCourses().subscribe();
      })
    );
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const updated = this.coursesSubject.value.filter(c => c.id !== id);
        this.coursesSubject.next(updated);
        this.saveToLocalStorage(updated);
      })
    );
  }

  clearLocalCache(): void {
    localStorage.removeItem('aster_saved_courses');
    this.coursesSubject.next([]);
  }

  get currentCourses(): Course[] {
    return this.coursesSubject.value;
  }
}
