import { Request, Response } from "express";
import { summarizeTodos } from "../services/llmService";
import { sendToSlack } from "../services/slackService";
import { supabase } from "../config/supabase";

export const generateAndSendSummary = async (req: Request, res: Response) => {
  try {
    const { data: todos, error } = await supabase.from("todos").select("*");

    if (error) throw error;

    const summary = await summarizeTodos(todos);
    await sendToSlack(summary);

    res.json({ message: "Summary sent to Slack successfully", summary });
  } catch (error) {
    res.status(500).json({ error: "Error generating and sending summary" });
  }
};
