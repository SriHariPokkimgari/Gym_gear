import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth, getAuthUser } from "@/lib/middleware";


export async function POST(request: NextRequest){
    const authError = await requireAuth(request);
    if(authError) return authError;

    const user = await getAuthUser(request);

    try {
        const {items} = await request.json() as {
            items: {product_id: number, quantity: number}[]
        }

        if(!items || items.length === 0){
            return NextResponse.json({message: 'Nothing to merge.'}, {status: 200});
        };

        //Get or create cart
        let cart = await pool.query(`
          SELECT id FROM carts
          WHERE user_id = $1  
        `, [user?.id]);

        if(cart.rowCount === 0){
            cart = await pool.query(`
              INSERT INTO carts(user_id) VALUES($1)
              RETURNING id  
            `, [user?.id]);
        }

        const cart_id = cart.rows[0].id;

        for(const item of items){
            await pool.query(`
              INSERT INTO cart_items(cart_id, product_id, quantity)
              VALUES($1, $2, $3)  
              ON CONFLICT (cart_id, product_id)
              DO UPDATE SET quantity = cart_items.quantity + $3
            `, [cart_id, item.product_id, item.quantity]);
        };

        return NextResponse.json({message: 'Cart merged.'}, {status: 200});
    } catch (error) {
        return NextResponse.json(
            {message: 'Something went wrong.'},
            {status: 500}
        )
    }
};