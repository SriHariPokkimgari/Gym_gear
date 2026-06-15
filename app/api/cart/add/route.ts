import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/middleware";

export async function POST(request: NextRequest){
    const authError = await requireAuth(request);
    if(authError) return authError;
    
    const user = await getAuthUser(request);

    try {
        const {product_id, quantity =1} = await request.json();
        let cart = await pool.query(`
          SELECT id FROM carts WHERE user_id = $1  
        `, [user?.id]);

        if(cart.rowCount === 0){
            cart = await pool.query(`
              INSERT INTO carts(user_id) VALUES ($1) RETURNING id  
            `, [user?.id]);
        }

        const cartId = cart.rows[0].id;

        await pool.query(`
          INSERT INTO cart_items(cart_id, product_id, quantity)
          VALUES ($1, $2, $3)
          ON CONFLICT(cart_id, product_id)
          DO UPDATE SET quantity = cart_items.quantity + $3  
        `, [cartId, product_id, quantity]);

        return NextResponse.json({mesage: 'Item added to cart.'}, {status: 200});

    } catch (error) {
        console.error("Add to cart error:", error);
        return NextResponse.json({message: 'Something went wrong.'}, {status: 500})
    }
}