import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../models/task.model';
import { environment } from '../../shared/environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  getTasks(userId: string): Observable<Task[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Task[]>(`${environment.apiUrl}/tasks`, { params });
  }

  createTask(payload: CreateTaskPayload): Observable<Task> {
    return this.http.post<Task>(`${environment.apiUrl}/tasks`, payload);
  }

  updateTask(id: string, payload: UpdateTaskPayload): Observable<Task> {
    return this.http.put<Task>(`${environment.apiUrl}/tasks/${id}`, payload);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tasks/${id}`);
  }
}
