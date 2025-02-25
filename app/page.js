"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  // Load tasks & theme from LocalStorage
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    const savedTheme = JSON.parse(localStorage.getItem("darkMode"));
    if (savedTasks) setTasks(savedTasks);
    if (savedTheme !== null) setDarkMode(savedTheme);
  }, []);

  // Save tasks & theme to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Task Notifications for Due Dates
  useEffect(() => {
    const now = new Date();
    tasks.forEach((task) => {
      if (task.dueDate && new Date(task.dueDate) <= now && !task.completed) {
        toast.warning(`Task "${task.text}" is due!`, { autoClose: 5000 });
      }
    });
  }, [tasks]);

  // Add or Edit Task
  const addTask = () => {
    if (task.trim() === "") return;
    const newTask = { text: task, completed: false, dueDate };

    if (editIndex !== null) {
      const updatedTasks = tasks.map((t, i) => (i === editIndex ? newTask : t));
      setTasks(updatedTasks);
      setEditIndex(null);
    } else {
      setTasks([...tasks, newTask]);
    }
    setTask("");
    setDueDate("");
  };

  // Remove Task
  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // Edit Task
  const editTask = (index) => {
    setTask(tasks[index].text);
    setDueDate(tasks[index].dueDate || "");
    setEditIndex(index);
  };

  // Mark Task as Completed
  const toggleComplete = (index) => {
    const updatedTasks = tasks.map((t, i) =>
      i === index ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
  };

  // Handle Drag & Drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedTasks = [...tasks];
    const [movedTask] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, movedTask);
    setTasks(reorderedTasks);
  };

  // Calculate Task Progress
  const completedTasks = tasks.filter((task) => task.completed).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 p-2 rounded bg-blue-500 text-white"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <h1 className="text-4xl font-bold mb-4">To-Do App</h1>

      {/* Task Input Section */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          className="border p-2 rounded w-64 text-black"
          placeholder="Enter a task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded w-40 text-black"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button
          className={`px-4 py-2 rounded text-white ${
            editIndex !== null ? "bg-green-500" : "bg-blue-500"
          }`}
          onClick={addTask}
        >
          {editIndex !== null ? "Update" : "Add"}
        </button>
        {editIndex !== null && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => {
              setTask("");
              setDueDate("");
              setEditIndex(null);
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Task Progress Bar */}
      <div className="w-64 bg-gray-600 rounded h-4 mb-4">
        <div
          className="bg-green-500 h-4 rounded"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Drag & Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <ul
              className="w-64"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {tasks.map((t, index) => (
                <Draggable
                  key={index}
                  draggableId={index.toString()}
                  index={index}
                >
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex justify-between items-center p-2 mb-2 rounded transition-all cursor-grab ${
                        t.completed ? "bg-green-600" : "bg-gray-700"
                      }`}
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleComplete(index)}
                      >
                        <span
                          className={
                            t.completed ? "line-through opacity-50" : ""
                          }
                        >
                          {t.text}
                        </span>
                        {t.dueDate && (
                          <p className="text-sm text-gray-300">
                            📅 {t.dueDate}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!t.completed && (
                          <button
                            className="text-yellow-400"
                            onClick={() => editTask(index)}
                          >
                            ✏️
                          </button>
                        )}
                        <button
                          className="text-red-500"
                          onClick={() => removeTask(index)}
                        >
                          ❌
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
