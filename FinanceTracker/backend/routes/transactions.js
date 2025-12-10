const express = require('express');
const { Transaction } = require('../models');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// list transactions for current user
router.get('/', auth(true), async (req, res) => {
  const uid = req.user.id;
  const txs = await Transaction.findAll({ where: { userId: uid }, order: [['date','DESC']] });
  res.json({ transactions: txs });
});

// create
router.post('/', auth(true), async (req, res) => {
  const uid = req.user.id;
  const { type, amount, category, date, notes } = req.body;
  if (!type || !amount || !category || !date) return res.status(400).json({ error: 'Missing fields' });
  const tx = await Transaction.create({ userId: uid, type, amount, category, date, notes });
  res.json({ transaction: tx });
});

// update
router.put('/:id', auth(true), async (req, res) => {
  const uid = req.user.id;
  const id = req.params.id;
  const tx = await Transaction.findOne({ where: { id, userId: uid } });
  if (!tx) return res.status(404).json({ error: 'Not found' });
  const { type, amount, category, date, notes } = req.body;
  tx.type = type || tx.type;
  tx.amount = (amount !== undefined) ? amount : tx.amount;
  tx.category = category || tx.category;
  tx.date = date || tx.date;
  tx.notes = notes || tx.notes;
  await tx.save();
  res.json({ transaction: tx });
});

// delete
router.delete('/:id', auth(true), async (req, res) => {
  const uid = req.user.id;
  const id = req.params.id;
  const tx = await Transaction.findOne({ where: { id, userId: uid } });
  if (!tx) return res.status(404).json({ error: 'Not found' });
  await tx.destroy();
  res.json({ ok: true });
});

module.exports = router;
