import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import pool from "@/lib/db";
import { requireAuth, getAuthUser } from "@/lib/middleware";


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function POST(request: NextRequest){
    const authError = await requireAuth(request);
    if(authError) return authError;

    const user = await getAuthUser(request);
    if (!user?.id) {
        return NextResponse.json({ message: 'User not authenticated.' }, { status: 401 });
    }

    try {
        const {items} = await request.json() as {
            items: {product_id: number, name: string, price: number, quantity: number,}[]
        };

        if(!items || items.length === 0){
            return NextResponse.json({message: 'Cart is empty.'}, {status: 400})
        };

        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalInPaise = Math.round(totalAmount * 100);

        const orderResult = await pool.query(`
           INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, 'pending') RETURNING id
        `, [user?.id, totalAmount]);

        const orderId = orderResult.rows[0].id;

        for(const item of items){
            await pool.query(`
              INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)  
            `, [orderId, item.product_id, item.quantity, item.price])
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: totalInPaise,
            currency: "INR",
            receipt: `order_${orderId}`,
            notes:{
                order_id: orderId.toString(),
                user_id: user?.id.toString(),
            }
        });

        return NextResponse.json({
            orderId,
            razorpayOrderId: razorpayOrder.id,
            amount: totalInPaise,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
        }, {status: 200})
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            {message: "Something went wrong."},
            {status: 500}
        )
    }
}