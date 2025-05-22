import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TodoSummaryData {
  todos: Todo[];
  completedCount: number;
  pendingCount: number;
  totalCount: number;
  completionRate: number;
}

function logSlackError(error: any) {
  console.error("Slack request failed:", error);
  if (axios.isAxiosError(error) && error.response) {
    console.error(
      "Slack API Response:",
      JSON.stringify(error.response.data, null, 2)
    );
  }
}

export async function sendToSlack(message: string): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    throw new Error("SLACK_WEBHOOK_URL is not configured");
  }

  try {
    const payload = {
      text: `📋 *Todo Summary*\n${message}`,
    };
    console.log("Slack Payload:", JSON.stringify(payload, null, 2));
    await axios.post(SLACK_WEBHOOK_URL, payload);
  } catch (error) {
    logSlackError(error);
    throw error;
  }
}

export async function sendTodoSummaryToSlack(
  summaryData: TodoSummaryData
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    throw new Error("SLACK_WEBHOOK_URL is not configured");
  }

  const { todos, completedCount, pendingCount, totalCount, completionRate } =
    summaryData;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const blocks: any[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `📋 Todo Summary Report - ${dateStr}` },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Total Tasks:* ${totalCount}` },
        { type: "mrkdwn", text: `*Completed:* ${completedCount} ✅` },
        { type: "mrkdwn", text: `*Pending:* ${pendingCount} ⏳` },
        { type: "mrkdwn", text: `*Progress:* ${completionRate}% 📈` },
      ],
    },
  ];

  if (completedCount > 0) {
    const completedText = todos
      .filter((todo) => todo.completed)
      .map((todo, i) => `${i + 1}. ${todo.text}`)
      .join("\n");

    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*✅ Completed Tasks:*\n${completedText}` },
    });
  }

  if (pendingCount > 0) {
    const pendingText = todos
      .filter((todo) => !todo.completed)
      .map((todo, i) => `${i + 1}. ${todo.text}`)
      .join("\n");

    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*⏳ Pending Tasks:*\n${pendingText}` },
    });
  }

  let insightText = "";
  if (completionRate >= 80) {
    insightText = "🌟 Excellent progress! You're crushing your goals!";
  } else if (completionRate >= 60) {
    insightText = "👍 Good work! Keep the momentum going!";
  } else if (completionRate >= 40) {
    insightText = "💪 You're making progress! Stay focused!";
  } else {
    insightText = "🚀 Time to power through those remaining tasks!";
  }

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*🎯 Productivity Insights:*\n${insightText}`,
    },
  });

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `📤 Summary generated at ${timeStr} | 💡 Regular reviews help stay productive!`,
      },
    ],
  });

  const payload = {
    blocks,
    text: `Todo Summary - ${completedCount}/${totalCount} tasks completed (${completionRate}%)`,
  };

  try {
    console.log("Slack Payload:", JSON.stringify(payload, null, 2));
    await axios.post(SLACK_WEBHOOK_URL, payload);
  } catch (error) {
    logSlackError(error);
    throw error;
  }
}

export async function sendTodoActionToSlack(
  action: string,
  todoText?: string,
  additionalInfo?: string
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    throw new Error("SLACK_WEBHOOK_URL is not configured");
  }

  let emoji = "",
    message = "";
  switch (action) {
    case "added":
      emoji = "➕";
      message = `*Todo Added:* ${todoText}`;
      break;
    case "completed":
      emoji = "✅";
      message = `*Todo Completed:* ${todoText}`;
      break;
    case "uncompleted":
      emoji = "⏳";
      message = `*Todo Marked as Pending:* ${todoText}`;
      break;
    case "deleted":
      emoji = "🗑️";
      message = `*Todo Deleted:* ${todoText}`;
      break;
    case "updated":
      emoji = "✏️";
      message = `*Todo Updated:* ${todoText}`;
      break;
    case "cleared_all":
      emoji = "🧹";
      message = "*All Todos Cleared*";
      break;
    case "exported":
      emoji = "📥";
      message = "*Todos Exported Successfully*";
      break;
    default:
      emoji = "📋";
      message = `*Todo Action:* ${action}`;
  }

  if (additionalInfo) message += `\n_${additionalInfo}_`;

  const blocks = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `${emoji} ${message}` },
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `📅 ${new Date().toLocaleString("en-US")}` },
      ],
    },
  ];

  try {
    const payload = { blocks, text: `${emoji} ${message.replace(/\*/g, "")}` };
    console.log("Slack Payload:", JSON.stringify(payload, null, 2));
    await axios.post(SLACK_WEBHOOK_URL, payload);
  } catch (error) {
    logSlackError(error);
    throw error;
  }
}

export async function sendSimpleNotification(
  title: string,
  message: string,
  emoji: string = "📋"
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    throw new Error("SLACK_WEBHOOK_URL is not configured");
  }

  const blocks = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `${emoji} *${title}*\n${message}` },
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `📅 ${new Date().toLocaleString("en-US")}` },
      ],
    },
  ];

  try {
    const payload = { blocks, text: `${emoji} ${title}: ${message}` };
    console.log("Slack Payload:", JSON.stringify(payload, null, 2));
    await axios.post(SLACK_WEBHOOK_URL, payload);
  } catch (error) {
    logSlackError(error);
    throw error;
  }
}

export async function sendTodoReport(
  todos: Todo[],
  reportType: "daily" | "weekly" = "daily"
): Promise<void> {
  if (!todos || todos.length === 0) {
    await sendSimpleNotification(
      `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Todo Report`,
      "No todos found for this period.",
      "📋"
    );
    return;
  }

  const completed = todos.filter((t) => t.completed);
  const pending = todos.filter((t) => !t.completed);
  const rate = Math.round((completed.length / todos.length) * 100);

  const summary: TodoSummaryData = {
    todos,
    completedCount: completed.length,
    pendingCount: pending.length,
    totalCount: todos.length,
    completionRate: rate,
  };

  await sendTodoSummaryToSlack(summary);
}

export async function safeSlackOperation<T>(
  operation: () => Promise<T>,
  fallbackMessage: string = "Slack operation failed"
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${fallbackMessage}:`, error);
    try {
      await sendSimpleNotification(
        "Todo App Error",
        `${fallbackMessage}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "⚠️"
      );
    } catch (notifyError) {
      console.error("Failed to send error notification to Slack:", notifyError);
    }
    return null;
  }
}
