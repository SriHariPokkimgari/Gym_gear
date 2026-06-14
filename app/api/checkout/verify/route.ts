import { NextResponse, NextRequest } from "next/server";
import crypto from 'crypto'
import pool from "@/lib/db";
import { requireAuth, getAuthUser } from "@/lib/middleware";


export async function POST(request: NextRequest){
    const authError = await requireAuth(request);
    if(authError) return authError;

    const user = await getAuthUser(request);

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_id
        } = await request.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(body).digest('hex');
      
        if(expectedSignature !== razorpay_signature){
            return NextResponse.json(
                {message: "Payment verification failed." },
                {status: 400}
            )
        };

        await pool.query(`
          UPDATE orders SET status = 'paid', stripe_payment_id = $1 WHERE id = $2  
        `, [razorpay_payment_id, order_id]);

        const orderItems = await pool.query(`
          SELECT product_id, quantity FROM order_items WHERE order_id = $1  
        `, [order_id])
        for(const item of orderItems.rows){
            await pool.query(`
               UPDATE products SET stock = stock - $1 WHERE id = $2 
            `, [item.quantity, item.product_id]);
        } 
        
        await pool.query(`
          DELETE FROM cart_items WHERE cart_id = (
            SELECT id FROM carts WHERE user_id = $1
          )  
        `, [user?.id])

        return NextResponse.json({massage: 'Payment verified.', status: 'paid'}, {status: 200})

    } catch (error) {
       console.log("Verify error: ", error);
       return NextResponse.json(
        {message: "Something went wrong."},
        {status: 500}
       ) 
    }
}