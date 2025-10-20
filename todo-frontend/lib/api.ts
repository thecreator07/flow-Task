import {
  AuthResponse,
  User,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStats,
  TaskFilters,
  BulkDeleteResponse,
} from '@/types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://flow-task-server-285212977651.asia-south2.run.app')
  : 'http://localhost:4000';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<{ success: boolean; user?: User }> {
    return this.request<{ success: boolean; user?: User }>('/auth/me', {
      method: 'POST',
    });
  }

  // Task endpoints with role-based filtering
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.priority) queryParams.append('priority', filters.priority);
    if (filters?.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
    if (filters?.createdBy) queryParams.append('createdBy', filters.createdBy);

    const query = queryParams.toString();
    return this.request<Task[]>(`/tasks${query ? `?${query}` : ''}`);
  }

  async getMyTasks(): Promise<Task[]> {
    return this.request<Task[]>('/tasks/my-tasks');
  }

  async getTaskStats(): Promise<TaskStats> {
    return this.request<TaskStats>('/tasks/stats');
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/user/${userId}`);
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(task: CreateTaskDto): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, updates: UpdateTaskDto): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async assignTask(id: string, assignedTo: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    });
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteTasks(ids: string[]): Promise<BulkDeleteResponse> {
    return this.request<BulkDeleteResponse>(`/tasks/bulk/${ids.join(',')}`, {
      method: 'DELETE',
    });
  }

  // User management endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users/list');
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async suggestDescription(description: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/ai-suggest/improvement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials:'include',
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    throw new Error("AI suggestion failed");
  }

  return response.text(); // since backend returns string
}

}

export const api = new ApiService();
