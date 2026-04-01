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

  const [studentName, setStudentName] = useState("");
  const [studentCourse, setStudentCourse] = useState("");
  const [studentYear, setStudentYear] = useState("");
  const [students, setStudents] = useState([]);

  const loadTasks = async () => {
    const snapshot = await getDocs(collection(db, "tasks"));
    const data = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data()
    }));
    setTasks(data);
  };

  const loadStudents = async () => {
    const snapshot = await getDocs(collection(db, "students"));
    const data = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data()
    }));
    setStudents(data);
  };

  useEffect(() => {
    loadTasks();
    loadStudents();
  }, []);

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
      createdAt: new Date().toISOString()
    });

    setTaskInput("");
    setDueDate("");
    setCategory("personal");
    loadTasks();
  };

  const toggleTask = async (task) => {
    const taskRef = doc(db, "tasks", task.id);

    await updateDoc(taskRef, {
      completed: !task.completed
    });

    loadTasks();
  };

  const deleteTask = async (id) => {
    const taskRef = doc(db, "tasks", id);
    await deleteDoc(taskRef);
    loadTasks();
  };

  const saveStudent = async (e) => {
    e.preventDefault();

    if (!studentName.trim() || !studentCourse.trim() || !studentYear) {
      alert("Please fill in all student fields");
      return;
    }

    await addDoc(collection(db, "students"), {
      name: studentName,
      course: studentCourse,
      yearLevel: studentYear,
      createdAt: new Date().toISOString()
    });

    setStudentName("");
    setStudentCourse("");
    setStudentYear("");
    loadStudents();
  };

  const filteredTasks =
    currentCategory === "all"
      ? tasks
      : tasks.filter((task) => task.category === currentCategory);

  const completedCount = tasks.filter((task) => task.completed).length;
  const percent = tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>📋 Task Master</h1>
            <p className="tagline">Organize, Track, Achieve</p>
          </div>

          <div className="header-right">
            <button className="btn btn-export" type="button">
              📥 Export Tasks
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Categories</h3>
            <div className="category-buttons">
              <button
                className={`category-btn ${currentCategory === "all" ? "active" : ""}`}
                onClick={() => setCurrentCategory("all")}
                type="button"
              >
                📌 All Tasks
              </button>

              <button
                className={`category-btn ${currentCategory === "work" ? "active" : ""}`}
                onClick={() => setCurrentCategory("work")}
                type="button"
              >
                💼 Work
              </button>

              <button
                className={`category-btn ${currentCategory === "school" ? "active" : ""}`}
                onClick={() => setCurrentCategory("school")}
                type="button"
              >
                🎓 School
              </button>

              <button
                className={`category-btn ${currentCategory === "personal" ? "active" : ""}`}
                onClick={() => setCurrentCategory("personal")}
                type="button"
              >
                🎯 Personal
              </button>
            </div>
          </div>

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
                  {tasks.filter((task) => !task.completed).length}
                </div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="content">
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

                <button className="btn btn-add" type="submit">
                  Add Task ➕
                </button>
              </div>
            </form>
          </div>

          <div className="tasks-section">
            <h2>Your Tasks</h2>

            <ul className="task-list">
              {filteredTasks.map((task) => (
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
                        <span className="task-date">📅 {task.dueDate}</span>
                      )}
                    </div>
                  </div>

                  <div className="task-actions">
                    <button
                      className="task-btn task-btn-delete"
                      onClick={() => deleteTask(task.id)}
                      type="button"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="add-task-card">
            <h2>Student Record Form</h2>

            <form onSubmit={saveStudent} className="task-form">
              <div className="form-row">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter student name..."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter course..."
                  value={studentCourse}
                  onChange={(e) => setStudentCourse(e.target.value)}
                />

                <select
                  className="input-field select-field"
                  value={studentYear}
                  onChange={(e) => setStudentYear(e.target.value)}
                >
                  <option value="">Select Year Level</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>

                <button className="btn btn-add" type="submit">
                  Save Student 💾
                </button>
              </div>
            </form>
          </div>

          <div className="tasks-section">
            <h2>Saved Student Records</h2>

            {students.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎓</div>
                <p>No student records yet.</p>
              </div>
            ) : (
              <ul className="task-list">
                {students.map((student) => (
                  <li key={student.id} className="task-item">
                    <div className="task-content">
                      <div className="task-header">
                        <span className="task-text">{student.name}</span>
                        <span className="task-category school">
                          🎓 Year {student.yearLevel}
                        </span>
                      </div>

                      <div className="task-footer">
                        <span className="task-date">📘 {student.course}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;