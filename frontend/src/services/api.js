const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getTodos = async () => {
  const response = await fetch(`${API_BASE_URL}/todos`);
  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }
  return response.json();
};

export const createTodo = async (text) => {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error("Failed to add todo");
  }
  return response.json();
};

export const updateTodo = async (id, todo) => {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });
  if (!response.ok) {
    throw new Error("Failed to update todo");
  }
  return response.json();
};

export const deleteTodo = async (id) => {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete todo");
  }
  return response.json();
};

export const generateSummary = async (todos) => {
  const response = await fetch(`${API_BASE_URL}/summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todos }),
  });
  if (!response.ok) {
    throw new Error("Failed to generate and send summary");
  }
  return response.json();
};
