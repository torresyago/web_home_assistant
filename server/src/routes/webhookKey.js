const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    configured: Boolean(process.env.WEBHOOK_API_KEY),
    key: process.env.WEBHOOK_API_KEY || null,
    baseUrl: process.env.WEBHOOK_BASE_URL || null,
  });
});

module.exports = router;
