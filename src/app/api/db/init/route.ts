import { NextResponse } from "next/server";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    const schemaPath = path.join(process.cwd(), "src/lib/schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");

    await pool.query(sql);
    await pool.end();

    return NextResponse.json({ success: true, message: "Schema initialized" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
