import { Todo } from '../types/todo';

const API_BASE_URL = 'http://localhost:5000/api';

export const getTodos = async (): Promise<Todo[]> => {
  const response = await fetch(`${API_BASE_URL}/todos`);
  
  // If response is not JSON, log the actual response
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Received non-JSON response:', text);
    throw new Error('Invalid server response');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch todos');
  }
  return data;
};

export const createTodo = async (text: string): Promise<Todo> => {
  if (!text?.trim()) {
    throw new Error('Todo text is required');
  }

  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ text: text.trim() })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create todo');
  }
  return data;
};

export const generateSummary = async (): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/todos/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to generate summary');
  }
  return data;
};
