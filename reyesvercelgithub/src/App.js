import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [category, setCategory] = useState("personal");
  const [dueDate, setDueDate] = useState("");
  const [currentCategory, setCurrentCategory] = useState("all");

  // LOAD TASKS
  const loadTasks = async () => {
    const snapshot = await getDocs(collection(db, "tasks"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // ADD TASK
  const addTask = async (e) => {
    e.preventDefault();

    if (!taskInput.trim()) {
      alert("Please enter a task");
      return;
    }

    await addDoc(collection(db, "tasks"), {
      text: taskInput,
      category: category,
      dueDate: dueDate,
      completed: false,
      createdAt: new Date()
    });

    setTaskInput("");
    setDueDate("");
    setCategory("personal");

    loadTasks();
  };

  // TOGGLE COMPLETE
  const toggleTask = async (task) => {
    const taskRef = doc(db, "tasks", task.id);

    await updateDoc(taskRef, {
      completed: !task.completed
    });

    loadTasks();
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    const taskRef = doc(db, "tasks", id);
    await deleteDoc(taskRef);
    loadTasks();
  };

  // FILTER TASKS
  const filteredTasks =
    currentCategory === "all"
      ? tasks
      : tasks.filter(t => t.category === currentCategory);

  const completedCount = tasks.filter(t => t.completed).length;
  const percent =
    tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  return (
    <div className="container">
      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>📋 Task Master</h1>
            <p className="tagline">Organize, Track, Achieve</p>
          </div>

          <div className="header-right">
            <button className="btn btn-export">
              📥 Export Tasks
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="main">

        {/* SIDEBAR */}
        <aside className="sidebar">

          <div className="sidebar-section">
            <h3>Categories</h3>
            <div className="category-buttons">
              <button
                className={`category-btn ${currentCategory === "all" ? "active" : ""}`}
                onClick={() => setCurrentCategory("all")}
              >
                📌 All Tasks
              </button>

              <button
                className={`category-btn ${currentCategory === "work" ? "active" : ""}`}
                onClick={() => setCurrentCategory("work")}
              >
                💼 Work
              </button>

              <button
                className={`category-btn ${currentCategory === "school" ? "active" : ""}`}
                onClick={() => setCurrentCategory("school")}
              >
                🎓 School
              </button>

              <button
                className={`category-btn ${currentCategory === "personal" ? "active" : ""}`}
                onClick={() => setCurrentCategory("personal")}
              >
                🎯 Personal
              </button>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="sidebar-section stats-section">
            <h3>Progress</h3>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <p className="progress-text">
                {completedCount} of {tasks.length} completed
              </p>
            </div>
          </div>

          {/* STATS */}
          <div className="sidebar-section">
            <h3>Statistics</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-number">{tasks.length}</div>
                <div className="stat-label">Total</div>
              </div>

              <div className="stat-box">
                <div className="stat-number">{completedCount}</div>
                <div className="stat-label">Done</div>
              </div>

              <div className="stat-box">
                <div className="stat-number">
                  {tasks.filter(t => !t.completed).length}
                </div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
          </div>

        </aside>

        {/* CONTENT */}
        <section className="content">

          {/* ADD TASK */}
          <div className="add-task-card">
            <h2>Add New Task</h2>

            <form onSubmit={addTask} className="task-form">

              <div className="form-row">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter task title..."
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                />
              </div>

              <div className="form-row">
                <select
                  className="input-field select-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="personal">🎯 Personal</option>
                  <option value="work">💼 Work</option>
                  <option value="school">🎓 School</option>
                </select>

                <input
                  type="date"
                  className="input-field date-field"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />

                <button className="btn btn-add">Add Task ➕</button>
              </div>

            </form>
          </div>

          {/* TASK LIST */}
          <div className="tasks-section">
            <h2>Your Tasks</h2>

            <ul className="task-list">
              {filteredTasks.map(task => (
                <li
                  key={task.id}
                  className={`task-item ${task.completed ? "completed" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
                  />

                  <div className="task-content">
                    <div className="task-header">
                      <span className="task-text">{task.text}</span>

                      <span className={`task-category ${task.category}`}>
                        {task.category === "work"
                          ? "💼 Work"
                          : task.category === "school"
                          ? "🎓 School"
                          : "🎯 Personal"}
                      </span>
                    </div>

                    <div className="task-footer">
                      {task.dueDate && (
                        <span className="task-date">
                          📅 {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="task-actions">
                    <button
                      className="task-btn task-btn-delete"
                      onClick={() => deleteTask(task.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>

          </div>

        </section>
      </main>
    </div>
  );
}

export default App;