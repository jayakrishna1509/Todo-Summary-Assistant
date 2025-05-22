import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { sendToSlack } from "../services/slackService";

export const getAllTodos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data || []);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

export const createTodo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      res.status(400).json({ message: "Todo text is required" });
      return;
    }

    const { data, error } = await supabase
      .from("todos")
      .insert([
        {
          text: text.trim(),
          completed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      res.status(500).json({ message: "Database error" });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) throw error;
    res.json({ message: "Todo deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const summarizeTodos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { data: todos, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      res.status(500).json({ message: "Failed to fetch todos" });
      return;
    }

    if (!todos?.length) {
      res.json({ message: "No todos to summarize" });
      return;
    }

    const summary = todos
      .map((todo) => `• ${todo.completed ? "✓" : "⃝"} ${todo.text}`)
      .join("\n");

    await sendToSlack(`Todo Summary:\n${summary}`);
    res.json({ message: "Summary sent to Slack successfully" });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ message: "Failed to generate summary" });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  try {
    const { data, error } = await supabase
      .from("todos")
      .update({
        text,
        completed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return res.status(500).json({ message: "Failed to update todo" });
    }

    if (!data) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
