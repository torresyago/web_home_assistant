const express = require('express');
const users = require('../services/users');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(users.list());
});

router.post('/', (req, res) => {
  const { username, password, role } = req.body || {};
  try {
    res.status(201).json(users.create({ username, password, role }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const { username, password, role } = req.body || {};
  try {
    res.json(users.update(req.params.id, { username, password, role }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  users.remove(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
