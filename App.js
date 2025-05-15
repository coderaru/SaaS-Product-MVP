import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');

  const fetchTasks = async () => {
    if (!token) return;
    const res = await axios.get('http://localhost:5000/api/tasks', {
      headers: { Authorization: token },
    });
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const handleSignup = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', { email, password });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setMessage('Login successful');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  const addTask = async () => {
    const res = await axios.post('http://localhost:5000/api/tasks', { title: taskTitle }, {
      headers: { Authorization: token },
    });
    setTasks([...tasks, res.data]);
    setTaskTitle('');
  };

  const toggleComplete = async (task) => {
    const res = await axios.put(`http://localhost:5000/api/tasks/${task._id}`, { ...task, completed: !task.completed }, {
      headers: { Authorization: token },
    });
    setTasks(tasks.map(t => t._id === task._id ? res.data : t));
  };

  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
      headers: { Authorization: token },
    });
    setTasks(tasks.filter(t => t._id !== id));
  };

  return (
    <div className="App">
      <h2>Login / Signup</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Signup</button>
      <button onClick={handleLogin}>Login</button>
      <p>{message}</p>

      {token && (
        <div>
          <h3>Tasks Dashboard</h3>
          <input placeholder="New Task" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
          <button onClick={addTask}>Add Task</button>
          <ul>
            {tasks.map(task => (
              <li key={task._id}>
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</span>
                <button onClick={() => toggleComplete(task)}>{task.completed ? 'Undo' : 'Complete'}</button>
                <button onClick={() => deleteTask(task._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;