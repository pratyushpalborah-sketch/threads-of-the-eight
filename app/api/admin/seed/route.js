import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { CRAFTS_SEED } from '@/lib/data/crafts-seed';

export async function GET(request) {
  try {
    const db = await getDb();
    
    // Drop existing collections to ensure a fresh seed
    try { await db.collection('crafts').drop(); } catch(e) {}
    try { await db.collection('users').drop(); } catch(e) {}

    // Seed crafts
    await db.collection('crafts').insertMany(CRAFTS_SEED);
    
    // Seed admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.collection('users').insertOne({
      email: 'admin@necrafts.in',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, message: "Database seeded successfully! You can now visit the website." });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
