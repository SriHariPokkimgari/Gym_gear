import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

export async function GET(request: NextRequest){
    const authError = await requireAdmin(request);
    if(authError) return authError;

    try {
        const result = await pool.query(`
           select o.id, o.total_amount, o.status, o.created_at,
                u.name AS user_name, u.email AS user_email,
                COUNT(oi.id) AS item_count
           FROM orders o
           JOIN users u ON o.user_id = u.id
           LEFT JOIN order_items oi ON o.id = oi.order_id
           GROUP BY o.id, u.name, u.email
           ORDER BY o.created_at DESC
        `);
        return NextResponse.json(
            {data: result.rows},
            {status: 200}
        )
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {message: "Something went wrong."},
            {status: 500}
        )
    }
}; 