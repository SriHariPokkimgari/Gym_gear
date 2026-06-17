import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

export async function GET(request: NextRequest){
    const authError = await requireAdmin(request);
    if(authError) return authError

    try {
        const result = await pool.query(`
          SELECT p.*, c.name AS category_name
          FROM products p
          JOIN categories c ON p.category_id = c.id
          ORDER BY p.created_at DESC   
        `);
        return NextResponse.json(
            {data: result.rows},
            {status: 200}
        );
    } catch (error) {
        return NextResponse.json(
            {message: "Something went wrong."},
            {status: 500}
        )
    }
}