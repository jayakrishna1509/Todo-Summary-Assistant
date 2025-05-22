export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
  user_id?: string;
}