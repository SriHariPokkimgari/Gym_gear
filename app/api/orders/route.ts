import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/middleware";

export async function GET(request: NextRequest){
    const authError = await requireAuth(request);
    if(authError) return authError;

    const user = await getAuthUser(request);

    try {
        const orders = await pool.query(`
           SELECT o.id, o.total_amount, o.status, o.created_at,
                COUNT(oi.id) AS item_count
           FROM orders o
           JOIN order_items oi ON o.id = oi.order_id
           WHERE o.user_id = $1
           GROUP BY o.id
           ORDER BY o.created_at DESC 
        `, [user?.id]);

        return NextResponse.json({data: orders.rows}, {status: 200});
    } catch (error) {
        console.error("Get orders error: ", error)
        return NextResponse.json(
            {message: 'Something went wrong.'},
            {status: 500}
        )
    }

}