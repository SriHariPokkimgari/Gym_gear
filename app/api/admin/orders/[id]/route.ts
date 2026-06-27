import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

export async function PUT(request: NextRequest, {params}: {params: Promise<{id: string}>}){
    const authError = await requireAdmin(request);
    if(authError) return authError

    try {
        const {id}= await params;

        const {status} = await request.json();
        await pool.query(`
           UPDATE orders SET status = $1 WHERE id = $2 
        `, [status, id]);

        return NextResponse.json(
            {message: "Order status updated."},
            {status: 200}
        )
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {message: 'Something went wrong.'},
            {status: 500}
        )
    }
}