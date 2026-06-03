import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

export async function GET(request: NextRequest, {params}: {params: {id:string}}){
    
    try {
        const result = await pool.query(
            `SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1`,
            [params.id]
        );

        if(result.rowCount === 0) {
            return NextResponse.json(
                {message: 'Products not found.'},
                {status: 404}
            )
        };

        return NextResponse.json(
            {data: result.rows[0]},
            {status: 200}
        )
    } catch (error) {
        console.log("Product by id error:", error);
        return NextResponse.json(
            {message: 'Somthing went wrong.'},
            {status: 500}
        )
    }
};

//PUT update product (Admin only)
export async function PUT(request: NextRequest, {params}: {params: {id: string}}){
    const authError = requireAdmin(request);

    if(authError) return authError;

    try {
        const {name, description, price, stock, image_url, category_id} = await request.json()
        const result = await pool.query(
            `UPDATE products
            SET name=$1, description=$2, price=$3, stock=$4, image_url=$5, category_id=$6
            WHERE id=$7 RETURNING *
            `,
            [name, description, price, stock, image_url, category_id, params.id]
        );

        return NextResponse.json(
            {message: "Product updated", data: result.rows[0]},
            {status: 200}
        )
    } catch (error) {
        console.error("Product update error: ", error);
        return NextResponse.json(
            {message: 'Something went wrong.'},
            {status: 500}
        )
    }
};

//DELETE product (Admin only)
export async function DELETE(request: NextRequest, {params} : {params: {id: string}}){
    const authError = requireAdmin(request)
    
    if(authError) authError;

    try {
        const result = await pool.query(
            `DELETE FROM products
            WHERE id = $1 RETURNING *`,
            [params.id]
        );

        return NextResponse.json(
            {message: 'Product deleted.', data: result.rows[0]},
            {status: 202}
        )
    } catch (error) {
        console.error("Product delete error: ", error);
        return NextResponse.json(
            {mesage: "Something went wrong." },
            {status: 500}
        )
    }

}