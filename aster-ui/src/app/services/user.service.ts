import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserSettings, UpdateUserSettingsRequest, UpdatePasswordRequest, UserDataExport } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getUserSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(`${this.apiUrl}/settings`);
  }

  updateUserSettings(request: UpdateUserSettingsRequest): Observable<UserSettings> {
    return this.http.put<UserSettings>(`${this.apiUrl}/settings`, request);
  }

  updatePassword(request: UpdatePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/password`, request);
  }

  exportUserData(): Observable<UserDataExport> {
    return this.http.get<UserDataExport>(`${this.apiUrl}/export`);
  }
}
