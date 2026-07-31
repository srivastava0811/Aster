import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredUser(): AuthResponse | null {
    const data = localStorage.getItem('aster_user');
    return data ? JSON.parse(data) : null;
  }

  public get token(): string | null {
    return this.currentUserSubject.value?.token || null;
  }

  public get isLoggedIn(): boolean {
    return !!this.token;
  }

  public get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { email, password }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    localStorage.removeItem('aster_user');
    this.currentUserSubject.next(null);
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem('aster_user', JSON.stringify(res));
    this.currentUserSubject.next(res);
  }
}
