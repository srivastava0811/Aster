import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assignment, CreateAssignmentRequest, ParseAssignmentRequest, ParseAssignmentResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private apiUrl = '/api/assignments';

  constructor(private http: HttpClient) {}

  parseAssignment(courseId: string, rawText: string): Observable<ParseAssignmentResponse[]> {
    const payload: ParseAssignmentRequest = { courseId, rawText };
    return this.http.post<ParseAssignmentResponse[]>(`${this.apiUrl}/parse`, payload);
  }

  createAssignment(assignment: CreateAssignmentRequest): Observable<Assignment> {
    return this.http.post<Assignment>(this.apiUrl, assignment);
  }

  createAssignmentsBulk(assignments: CreateAssignmentRequest[]): Observable<Assignment[]> {
    return this.http.post<Assignment[]>(`${this.apiUrl}/bulk`, assignments);
  }

  getAssignments(startDate?: string, endDate?: string): Observable<Assignment[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<Assignment[]>(this.apiUrl, { params });
  }

  toggleComplete(id: string): Observable<Assignment> {
    return this.http.put<Assignment>(`${this.apiUrl}/${id}/toggle-complete`, {});
  }

  deleteAssignment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
