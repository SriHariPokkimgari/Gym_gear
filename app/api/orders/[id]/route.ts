import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth, getAuthUser } from "@/lib/middleware";


export async function GET(request: NextRequest, {params}: {params: Promise<{id: string}>}){
    const authError = await requireAuth(request);
    if(authError) return authError;

    const user = await getAuthUser(request);

    try {
        const {id} = await params
        
        const orderResult = await pool.query(`
           SELECT * FROM orders WHERE id = $1 AND user_id = $2 
        `, [id, user?.id]);

        if(orderResult.rowCount === 0){
            return NextResponse.json(
                {message: 'Order not found.'},
                {status: 404}
            )
        };

        const order = orderResult.rows[0];

        const itemsResult = await pool.query(`
          SELECT oi.quantity, oi.price,
                 p.name, p.image_url
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1   
        `, [id]);

        return NextResponse.json(
            {
                data: {
                    ...order,
                    items: itemsResult.rows
                }
            },
            {status: 200}
        );
    } catch (error) {
        console.error("Get order error: ", error);
        return NextResponse.json(
            {message: "Something went wrong."},
            {status: 500}
        )
    }
}