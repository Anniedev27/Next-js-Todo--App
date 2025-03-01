"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);

  const router = useRouter(); // ✅ Initialize Next.js router

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login"); // ✅ Redirect to login page instead of signup
      } else {
        setUser(currentUser);
        fetchTasks(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchTasks = async (userId) => {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    const tasksList = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((t) => t.userId === userId);
    setTasks(tasksList);
  };

  const addTask = async () => {
    if (!task.trim() || !user) return;
    if (editId) {
      await updateDoc(doc(db, "tasks", editId), { text: task, dueDate });
      setEditId(null);
    } else {
      await addDoc(collection(db, "tasks"), {
        text: task,
        completed: false,
        dueDate,
        userId: user.uid,
      });
    }
    setTask("");
    setDueDate("");
    toast.success("Task saved!");
    fetchTasks(user.uid);
  };

  const removeTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
    toast.error("Task deleted!");
    fetchTasks(user.uid);
  };

  const toggleComplete = async (id, completed) => {
    await updateDoc(doc(db, "tasks", id), { completed: !completed });
    fetchTasks(user.uid);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login"); // ✅ Redirect to login page after logout
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 p-2 rounded bg-blue-500 text-white"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      {user ? (
        <>
          <h1 className="text-4xl font-bold mb-4">To-Do App</h1>
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
                editId ? "bg-green-500" : "bg-blue-500"
              }`}
              onClick={addTask}
            >
              {editId ? "Update" : "Add"}
            </button>
          </div>

          <DragDropContext onDragEnd={() => {}}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <ul
                  className="w-64"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {tasks.map((t, index) => (
                    <Draggable key={t.id} draggableId={t.id} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex justify-between items-center p-2 mb-2 rounded cursor-grab transition-all ${
                            t.completed ? "bg-green-600" : "bg-gray-700"
                          }`}
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => toggleComplete(t.id, t.completed)}
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
                                onClick={() => {
                                  setTask(t.text);
                                  setDueDate(t.dueDate || "");
                                  setEditId(t.id);
                                }}
                              >
                                ✏️
                              </button>
                            )}
                            <button
                              className="text-red-500"
                              onClick={() => removeTask(t.id)}
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

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
          >
            Logout
          </button>
        </>
      ) : (
        <h1 className="text-2xl">Redirecting to Login...</h1>
      )}
    </div>
  );
}
