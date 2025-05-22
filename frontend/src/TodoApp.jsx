import React, { useState, useEffect } from "react";
import { Moon, Sun, Plus, Check, X } from "lucide-react";
import confetti from "canvas-confetti";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(true);
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos);
        setTodos(Array.isArray(parsedTodos) ? parsedTodos : []);
      } catch (error) {
        console.error("Error parsing saved todos:", error);
        setTodos([]);
      }
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const completedCount = todos.filter((task) => task.completed).length;
    const totalCount = todos.length;
    if (totalCount > 0 && completedCount === totalCount) {
      blastConfetti();
    }
  }, [todos]);

  const blastConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) {
      showTempAlert("Please enter a todo item!", "info");
      return;
    }

    setLoading(true);

    // Simulate API delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newTodo = {
      id: generateId(),
      text: trimmedInput,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTodos((prevTodos) => [...prevTodos, newTodo]);
    showTempAlert("Todo Added Successfully!", "success");
    setInputValue("");
    setLoading(false);
  };

  const toggleComplete = async (index) => {
    setLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const updatedTodos = [...todos];
    updatedTodos[index] = {
      ...updatedTodos[index],
      completed: !updatedTodos[index].completed,
      updated_at: new Date().toISOString(),
    };

    setTodos(updatedTodos);

    showTempAlert(
      updatedTodos[index].completed
        ? "Task completed! 🎉"
        : "Task marked as pending",
      updatedTodos[index].completed ? "success" : "info"
    );

    setLoading(false);
  };

  const handleEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      showTempAlert("Todo text cannot be empty!", "info");
      return;
    }

    setLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const updatedTodos = todos.map((todo) =>
      todo.id === editingId
        ? {
            ...todo,
            text: editText.trim(),
            updated_at: new Date().toISOString(),
          }
        : todo
    );

    setTodos(updatedTodos);
    setEditingId(null);
    setEditText("");
    showTempAlert("Todo updated successfully!", "success");
    setLoading(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const deleteTask = async (index) => {
    if (window.confirm("Are you Delete this todo?")) {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      const updatedTodos = [...todos];
      updatedTodos.splice(index, 1);
      setTodos(updatedTodos);
      showTempAlert("Todo Deleted!", "success");
      setLoading(false);
    }
  };

  const clearAllTasks = async () => {
    if (todos.length === 0) {
      showTempAlert("No todos to clear!", "info");
      return;
    }

    if (window.confirm("Clear all todos?")) {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      setTodos([]);
      setSummary(""); // Clear summary when clearing todos
      showTempAlert("All Todos Cleared!", "success");
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (todos.length === 0) {
      showTempAlert("No todos to summarize!", "info");
      return;
    }

    setLoading(true);

    // Simulate API processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const completedTodos = todos.filter((todo) => todo.completed);
    const pendingTodos = todos.filter((todo) => !todo.completed);
    const completionRate = Math.round(
      (completedTodos.length / todos.length) * 100
    );

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

    const generatedSummary = `📋 Todo Summary Report - ${dateStr} at ${timeStr}

📊 OVERVIEW:
═══════════════════════════════════════
Total Tasks: ${todos.length}
✅ Completed: ${completedTodos.length}
⏳ Pending: ${pendingTodos.length}
📈 Progress: ${completionRate}%

${
  completedTodos.length > 0
    ? `
✅ COMPLETED TASKS:
═══════════════════════════════════════
${completedTodos.map((todo, index) => `${index + 1}. ${todo.text}`).join("\n")}
`
    : ""
}

${
  pendingTodos.length > 0
    ? `
⏳ PENDING TASKS:
═══════════════════════════════════════
${pendingTodos.map((todo, index) => `${index + 1}. ${todo.text}`).join("\n")}
`
    : ""
}

🎯 PRODUCTIVITY INSIGHTS:
═══════════════════════════════════════
${
  completionRate >= 80
    ? "🌟 Excellent progress! You're crushing your goals!"
    : completionRate >= 60
    ? "👍 Good work! Keep the momentum going!"
    : completionRate >= 40
    ? "💪 You're making progress! Stay focused!"
    : "🚀 Time to power through those remaining tasks!"
}

📤 Status: Summary Generated Successfully!
💡 Tip: Regular Task Reviews Help Maintain Productivity!`;

    setSummary(generatedSummary);
    showTempAlert("Summary generated successfully! 📋✨", "success");
    setLoading(false);
  };

  const showTempAlert = (message, type) => {
    setShowAlert({ show: true, message, type });
    setTimeout(() => {
      setShowAlert({ show: false, message: "", type: "" });
    }, 3000);
  };

  const filteredTasks = todos.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const completedTasks = todos.filter((task) => task.completed).length;
  const totalTasks = todos.length;
  const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (editingId) {
        handleSaveEdit();
      } else {
        handleSubmit();
      }
    }
    if (e.key === "Escape" && editingId) {
      handleCancelEdit();
    }
  };

  const exportTodos = () => {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `todos-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showTempAlert("Todos exported successfully! 📥", "success");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-black text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="container mx-auto px-4 py-8 max-w-md sm:max-w-lg md:max-w-2xl">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Todo Summary Assistant 📝
          </h1>
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-full transition-colors duration-300 ${
              darkMode
                ? "bg-gray-900 text-yellow-400 hover:bg-gray-800"
                : "bg-white text-gray-600 hover:bg-gray-100 shadow-md"
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Status indicator */}
        <div
          className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            darkMode
              ? "bg-gray-900 text-green-400 border border-gray-800"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Local Mode Active - Your data is saved in your browser
        </div>

        {/* Alert */}
        {showAlert.show && (
          <div
            className={`mb-4 p-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
              showAlert.type === "success"
                ? "bg-green-500 text-white"
                : showAlert.type === "danger"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {showAlert.message}
          </div>
        )}

        {/* Progress Card */}
        <div
          className={`p-6 rounded-xl mb-6 transition-colors duration-300 ${
            darkMode
              ? "bg-gray-900 border border-gray-800"
              : "bg-white shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Progress</h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {completedTasks} of {totalTasks} Tasks Completed
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {completedTasks}/{totalTasks}
            </div>
          </div>
          <div
            className={`h-3 rounded-full overflow-hidden ${
              darkMode ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Add Todo Input */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Add New Todo"
            disabled={loading}
            className={`flex-grow p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 ${
              darkMode
                ? "bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
                : "bg-white border-gray-200 text-gray-800 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !inputValue.trim()}
            className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              loading || !inputValue.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105 active:scale-95"
            } ${
              darkMode
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-purple-500 text-white hover:bg-purple-600"
            }`}
          >
            <Plus size={18} />
            {loading ? "Adding..." : "Add"}
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "completed"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                filter === type
                  ? "bg-purple-500 text-white"
                  : darkMode
                  ? "bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={clearAllTasks}
            disabled={loading || todos.length === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
              loading || todos.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105"
            } ${
              darkMode
                ? "bg-red-900 text-red-200 hover:bg-red-800 border border-red-800"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            Clear All
          </button>
          <button
            onClick={exportTodos}
            disabled={loading || todos.length === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
              loading || todos.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105"
            } ${
              darkMode
                ? "bg-blue-900 text-blue-200 hover:bg-blue-800 border border-blue-800"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            Export 📥
          </button>
        </div>

        {/* Todo List */}
        <div className="space-y-3 mb-6">
          {loading && todos.length === 0 ? (
            <div
              className={`p-6 rounded-xl text-center ${
                darkMode
                  ? "bg-gray-900 border border-gray-800"
                  : "bg-white shadow-md"
              }`}
            >
              <div className="animate-pulse">Loading todos...</div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div
              className={`p-6 rounded-xl text-center ${
                darkMode
                  ? "bg-gray-900 border border-gray-800"
                  : "bg-white shadow-md"
              }`}
            >
              <div
                className={`text-lg ${
                  darkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {filter === "all"
                  ? "No Todos Yet. Add one above! 👆"
                  : filter === "pending"
                  ? "No Pending Tasks! 🎉"
                  : "No Completed Tasks Yet."}
              </div>
            </div>
          ) : (
            filteredTasks.map((task, index) => {
              const originalIndex = todos.findIndex((t) => t === task);
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    darkMode
                      ? "bg-gray-900 border border-gray-800"
                      : "bg-white shadow-md"
                  } ${task.completed ? "opacity-75" : ""}`}
                >
                  {editingId === task.id ? (
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className={`flex-grow p-2 rounded border ${
                          darkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-gray-50 border-gray-300 text-gray-800"
                        }`}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        disabled={loading}
                        className="p-2 rounded bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 rounded bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-grow">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleComplete(originalIndex)}
                          disabled={loading}
                          className="w-5 h-5 rounded border-2 text-purple-500 focus:ring-purple-500 disabled:opacity-50"
                        />
                        <span
                          className={`flex-grow ${
                            task.completed
                              ? `line-through ${
                                  darkMode ? "text-gray-600" : "text-gray-400"
                                }`
                              : darkMode
                              ? "text-white"
                              : "text-gray-800"
                          }`}
                        >
                          {task.text}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(task)}
                          disabled={loading}
                          className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTask(originalIndex)}
                          disabled={loading}
                          className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Summary Section */}
        {summary && (
          <div
            className={`p-6 rounded-xl mb-6 ${
              darkMode
                ? "bg-gray-900 border border-gray-800"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              📋 Task Summary
            </h3>
            <pre
              className={`text-sm whitespace-pre-wrap font-mono ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {summary}
            </pre>
          </div>
        )}

        {/* Generate Summary Button */}
        <button
          onClick={handleGenerateSummary}
          disabled={loading || todos.length === 0}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
            loading || todos.length === 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-105 active:scale-95"
          } ${
            darkMode
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              : "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          }`}
        >
          {loading
            ? "Generating Summary..."
            : "📋 Generate Summary & Send to Slack"}
        </button>

        {/* Footer */}
        <p
          className={`text-center mt-6 text-sm opacity-75 ${
            darkMode ? "text-gray-500" : "text-gray-600"
          }`}
        >
          Todo Summary Assistant ✨ | Developed by Pillagolla Jayakrishna❤️
        </p>
      </div>
    </div>
  );
}
