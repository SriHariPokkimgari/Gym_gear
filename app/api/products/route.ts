import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

//GET all products
export async function GET(request: NextRequest){
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const search = searchParams.get("search");

        let query = `
            SELECT p.*,c.name AS category_name
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `

        const values : string[] = [];
        let index = 1;

        if(category) {
            query += ` AND c.name ILIKE $${index}`
            values.push(`%${category}%`);
            index++
        }

        if(search) {
            query += ` AND p.name ILIKE $${index}`
            values.push(`%${search}%`);
            index++
        };

        query += ` ORDER BY p.created_at DESC`

        const result = await pool.query(query, values);
        return NextResponse.json(
            {data: result.rows},
            {status: 200}
        )
    } catch (error) {
        console.error("GET products error:", error);
        return NextResponse.json(
            {message: 'Something went wrong.'},
            {status: 500}
        )
    };
};

//POST create product (admin only)
export async function POST(request: NextRequest){
    const authError = await requireAdmin(request);
    
    if(authError) return authError

    try {
        const {name, description, price, stock, image_url, category_id} = await request.json();
        
        if(!name || !price || !category_id){
            return NextResponse.json(
                {message: 'Name, price and category are required.'},
                {status: 400}
            )
        };

        const result = await pool.query(
            `INSERT INTO products(name, description, price, stock, image_url, category_id)
            VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, description, price, stock, image_url, category_id]
        );

        return NextResponse.json(
            {message: 'Product created.', data: result.rows[0]},
            {status: 201}
        )
    } catch (error) {
        console.error("Create product error:", error)
        return NextResponse.json(
            {message: 'Somrthing went wrong.'},
            {status: 500}
        )
    }
}