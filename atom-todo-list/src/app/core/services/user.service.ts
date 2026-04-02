import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../shared/environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  findByEmail(email: string): Observable<User | null> {
    const params = new HttpParams().set('email', email);
    return this.http.get<User>(`${environment.apiUrl}/users`, { params }).pipe(
      catchError(err => {
        if (err.status === 404) return of(null);
        throw err;
      }),
    );
  }

  createUser(email: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, { email });
  }
}
