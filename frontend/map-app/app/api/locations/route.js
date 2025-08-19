// Force Node runtime (pg doesn't work on Edge)
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Reuse one pool across invocations
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }, // Supabase uses SSL
  max: 1, // keep it tiny in dev / serverless
});

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        name,
        latitude::float8 AS latitude,
        longitude::float8 AS longitude,
        created_at
      FROM public.locations
      ORDER BY created_at ASC
    `);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('DB error:', err);
    return NextResponse.json({ error: 'DB query failed' }, { status: 500 });
  }
}