import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth, getAuthUser } from "@/lib/middleware";


export async function DELETE(request: NextRequest){
    const authError = await requireAuth(request);
    if(authError) return authError;

    const user = await getAuthUser(request);

    try {
        await pool.query(`
           DELETE FROM cart_items
           WHERE cart_id = (
            SELECT id from carts WHERE user_id = $1
           ) 
        `, [user?.id]);
        return NextResponse.json(
            {message: 'All cart items removed.'},
            {status: 200}
        );
    } catch (error) {
        console.error("Items clear error: ", error);
        return NextResponse.json(
            {message: 'Something went wrong.'},
            {status: 500}
        )
    }
}