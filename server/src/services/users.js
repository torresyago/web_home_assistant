const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const passwordHash = require('./passwordHash');

function ensure(data) {
  if (!data.users) data.users = [];
  return data;
}

function sanitize(u) {
  return { id: u.id, username: u.username, role: u.role, createdAt: u.createdAt };
}

function isReservedUsername(username) {
  return Boolean(process.env.ADMIN_USER) && username.toLowerCase() === process.env.ADMIN_USER.toLowerCase();
}

function list() {
  const data = ensure(db.read());
  return data.users.map(sanitize);
}

function findByUsername(username) {
  const data = ensure(db.read());
  return data.users.find((u) => u.username.toLowerCase() === String(username || '').toLowerCase());
}

// Verifica usuario/contraseña contra los usuarios gestionados desde la app
// (el admin de arranque ADMIN_USER/ADMIN_PASSWORD se comprueba aparte, en
// routes/auth.js, y no vive en esta lista).
function verify(username, password) {
  const user = findByUsername(username);
  if (!user) return null;
  if (!passwordHash.verify(password, user.passwordHash)) return null;
  return sanitize(user);
}

function create({ username, password, role }) {
  const uname = String(username || '').trim();
  if (!uname) throw new Error('Nombre de usuario requerido');
  if (!password || String(password).length < 4) {
    throw new Error('La contraseña debe tener al menos 4 caracteres');
  }
  if (isReservedUsername(uname)) throw new Error('Ese nombre de usuario ya está reservado');
  const data = ensure(db.read());
  if (data.users.some((u) => u.username.toLowerCase() === uname.toLowerCase())) {
    throw new Error('Ese nombre de usuario ya existe');
  }
  const user = {
    id: uuidv4(),
    username: uname,
    passwordHash: passwordHash.hash(password),
    role: role === 'admin' ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };
  data.users.push(user);
  db.write(data);
  return sanitize(user);
}

function update(id, { username, password, role }) {
  const data = ensure(db.read());
  const user = data.users.find((u) => u.id === id);
  if (!user) throw new Error('Usuario no encontrado');
  if (username !== undefined) {
    const uname = String(username).trim();
    if (!uname) throw new Error('Nombre de usuario requerido');
    if (isReservedUsername(uname)) throw new Error('Ese nombre de usuario ya está reservado');
    if (data.users.some((u) => u.id !== id && u.username.toLowerCase() === uname.toLowerCase())) {
      throw new Error('Ese nombre de usuario ya existe');
    }
    user.username = uname;
  }
  if (password) {
    if (String(password).length < 4) throw new Error('La contraseña debe tener al menos 4 caracteres');
    user.passwordHash = passwordHash.hash(password);
  }
  if (role !== undefined) user.role = role === 'admin' ? 'admin' : 'user';
  db.write(data);
  return sanitize(user);
}

function remove(id) {
  const data = ensure(db.read());
  data.users = data.users.filter((u) => u.id !== id);
  db.write(data);
}

module.exports = { list, findByUsername, verify, create, update, remove };
