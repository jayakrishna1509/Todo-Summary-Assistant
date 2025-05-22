import { Router } from "express";
import {
  getAllTodos,
  createTodo,
  deleteTodo,
  summarizeTodos,
} from "../controllers/todoController";

const router = Router();

// Add proper type annotations for the request handlers
router.get("/", getAllTodos);
router.post("/", createTodo);
router.delete("/:id", deleteTodo);
router.post("/summarize", summarizeTodos);

export default router;
