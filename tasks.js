const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
}

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id });
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const { title } = req.body;
  const task = new Task({ userId: req.user.id, title });
  await task.save();
  res.status(201).json(task);
});

router.put('/:id', async (req, res) => {
  const { title, completed } = req.body;
  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { title, completed }, { new: true });
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Task deleted' });
});

module.exports = router;
