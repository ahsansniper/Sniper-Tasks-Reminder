export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'pending' | 'completed' | 'missed';
  createdAt?: string;
}

export type NewTask = Omit<Task, 'status' | 'createdAt'>;
