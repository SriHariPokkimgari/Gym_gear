import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth, getAuthUser } from "@/lib/middleware";

export async function POST(request: NextRequest){
    const authError = requireAuth(request);
    if(authError) return authError;

    const user = await getAuthUser(request);

    try {
        const {product_id} = await request.json();

        const cart = await pool.query(`
          SELECT id FROM carts WHERE user_id = $1  
        `, [user?.id]);

        if(cart.rowCount === 0){
            return NextResponse.json({message: 'Cart not found.'}, {status: 404});
        }

        const cart_id = cart.rows[0].id;

        await pool.query(`
          DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2  
        `, [cart_id, product_id]);

        return NextResponse.json({message: 'Item removed.'}, {status: 200});
    } catch (error) {
        console.error("Item remove error: ", error );
        return NextResponse.json({message: "something went wrong."}, {status: 500});
    }
}