export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string; // ISO date string from JSON response
}

export interface CreateTaskPayload {
  userId: string;
  title: string;
  description: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  completed?: boolean;
}
