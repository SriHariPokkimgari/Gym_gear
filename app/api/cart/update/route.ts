import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth, getAuthUser } from "@/lib/middleware";

export async function PUT(request: NextRequest){
    const authError = requireAuth(request);
    if(authError) return authError;

    const user = await getAuthUser(request);

    try {
        const {product_id, quantity} = await request.json();

        const cart = await pool.query(`
          SELECT id FROM carts WHERE user_id = $1  
        `, [user?.id]);

        if(cart.rowCount === 0){
            return NextResponse.json({message: 'Cart not found'}, {status: 404});
        };

        const cartId = cart.rows[0].id;

        if(quantity <= 0){
            await pool.query(`
                DELETE FROM cart_items WHERE product_id = $1
            `, [product_id]);
        }else{
            await pool.query(`
              UPDATE cart_items SET quantity = $1
              WHERE cart_id = $2 AND product_id = $3 
            `, [quantity, cartId, product_id]);
        }

        return NextResponse.json({message: 'Cart updated.'}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: 'Something went wrong.'}, {status: 500});
    }
}