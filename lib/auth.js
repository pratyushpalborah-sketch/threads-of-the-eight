import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDb } from './mongodb';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const COOKIE_NAME = 'ne_token';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export async function getCurrentUser(request) {
  let token = null;
  try {
    const ck = cookies();
    token = ck.get(COOKIE_NAME)?.value;
  } catch {}
  if (!token && request) {
    const auth = request.headers.get('authorization') || '';
    if (auth.startsWith('Bearer ')) token = auth.slice(7);
    if (!token) {
      const cookieHeader = request.headers.get('cookie') || '';
      const m = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      if (m) token = m[1];
    }
  }
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.userId) return null;
  const db = await getDb();
  const user = await db.collection('users').findOne({ id: payload.userId });
  if (!user) return null;
  delete user.password;
  delete user._id;
  return user;
}

export async function seedAdmin() {
  const db = await getDb();
  const email = (process.env.ADMIN_EMAIL || 'admin@necrafts.in').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const existing = await db.collection('users').findOne({ email });
  if (!existing) {
    const hashed = await hashPassword(password);
    await db.collection('users').insertOne({
      id: uuidv4(),
      email,
      password: hashed,
      name: 'Admin',
      role: 'admin',
      createdAt: new Date()
    });
  } else if (existing.role !== 'admin') {
    await db.collection('users').updateOne({ email }, { $set: { role: 'admin' } });
  }
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
}

export { COOKIE_NAME };
