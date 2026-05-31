import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const result = await pool.query(`SELECT * FROM categories ORDER BY name`)
    return NextResponse.json({ data: result.rows }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    )
  }
}