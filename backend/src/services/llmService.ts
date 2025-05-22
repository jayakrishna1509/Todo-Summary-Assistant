import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const summarizeTodos = async (todos: any[]) => {
  const todoList = todos.map((todo) => `- ${todo.title}`).join("\n");

  const response = await openai.completions.create({
    model: "gpt-3.5-turbo-instruct",
    prompt: `Summarize these todos in a concise and meaningful way:\n${todoList}`,
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0].text?.trim();
};
