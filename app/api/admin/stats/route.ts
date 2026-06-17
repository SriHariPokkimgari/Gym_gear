import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

export async function GET(request: NextRequest){
    const authError = await requireAdmin(request);
    if(authError) return authError;

    try {
        const [revenue, orders, users, products] = await Promise.all([
            pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status = 'paid'`),
            pool.query(`SELECT COUNT(*) AS total FROM orders`),
            pool.query(`SELECT COUNT(*) total FROM users`),
            pool.query(`SELECT COUNT(*) AS total FROM products`),
        ]);

        return NextResponse.json(
        {
            data:{
                revenue: revenue.rows[0].total,
                orders: orders.rows[0].total,
                users: users.rows[0].total,
                products: products.rows[0].total
            }
        }, 
        {status: 200}
    );
    } catch (error) {
        return NextResponse.json(
            {message: "Something went wrong."},
            {status: 500}
        )
    }
}