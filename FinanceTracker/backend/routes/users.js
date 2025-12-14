const express = require('express');
const { User } = require('../models');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// get current profile
router.get('/me', auth(true), async (req, res) => {
  const uid = req.user.id;
  const user = await User.findByPk(uid, { attributes: { exclude: ['password'] } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user });
});

// update profile
router.put('/me', auth(true), async (req, res) => {
  const uid = req.user.id;
  const { name, email, income, savings, targetExpenses } = req.body;
  const user = await User.findByPk(uid);
  if (!user) return res.status(404).json({ error: 'Not found' });
  user.name = name || user.name;
  user.email = email || user.email;
  user.income = (income !== undefined) ? income : user.income;
  user.savings = (savings !== undefined) ? savings : user.savings;
  user.targetExpenses = (targetExpenses !== undefined) ? targetExpenses : user.targetExpenses;
  await user.save();
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, income: user.income, savings: user.savings, targetExpenses: user.targetExpenses } });
});

module.exports = router;
