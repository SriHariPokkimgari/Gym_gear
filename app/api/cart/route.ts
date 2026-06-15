import pool from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    const authError = await requireAuth(request);
    if(authError) return authError;
  
    const user = await getAuthUser(request);
   
    try {
        let cart = await pool.query(`
          SELECT id FROM carts
          WHERE user_id = $1  
        `, [user?.id]);
        
        if(cart.rowCount === 0){
            cart = await pool.query(`
              INSERT INTO carts(user_id) VALUES($1) RETURNING id  
            `, [user?.id]);

        };

        const cartId  = cart.rows[0].id;

        const items = await pool.query(`
          SELECT ci.id, ci.quantity, ci.product_id,
            p.name, p.price, p.image_url, p.stock,
            c.name AS category_name
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE ci.cart_id = $1
        `, [cartId])

         return NextResponse.json({data: items.rows}, {status: 200});
    } catch (error) {
        console.error("Get cart error:", error);
      return NextResponse.json({message: 'Something went wrong.'}, {status: 500});  
    }

   
}

