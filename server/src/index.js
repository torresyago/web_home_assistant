const path = require('path');
const express = require('express');
const session = require('express-session');

const { requireAuth, requireAdmin } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const instancesRoutes = require('./routes/instances');
const devicesRoutes = require('./routes/devices');
const actionsRoutes = require('./routes/actions');
const webhookRoutes = require('./routes/webhook');
const webhookKeyRoutes = require('./routes/webhookKey');
const securityRoutes = require('./routes/security');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ha-things-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/instances', requireAuth, instancesRoutes);
app.use('/api/devices', requireAuth, devicesRoutes);
app.use('/api/actions', requireAuth, actionsRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/webhook-key', requireAuth, webhookKeyRoutes);
app.use('/api/security', requireAuth, requireAdmin, securityRoutes);
app.use('/api/users', requireAuth, requireAdmin, usersRoutes);

const clientDist = path.join(__dirname, '..', 'public');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HA Things server escuchando en el puerto ${PORT}`);
});
