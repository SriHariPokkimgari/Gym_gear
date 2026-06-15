import { NextRequest, NextResponse } from "next/server";
import { LoginData } from "@/types";
import pool from "@/lib/db";
import bcrypt from 'bcrypt'
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest){
    try {
       
        const  {email, password} = await request.json() as LoginData;

        if(!email || !password){
            return NextResponse.json({message: ' Invalid credentials'}, {status: 400});
        }

        const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);

        if(result.rowCount === 0){
            return NextResponse.json({message: 'Email or password incorrect'}, {status: 400});
        }

        const user = result.rows[0];    
       
        const passCheck = await bcrypt.compare(password, user.password);
        if(!passCheck){ 
            return NextResponse.json({message: 'Email or password incorrect'}, {status: 400});
        }

        const token = signToken({id: user.id, role: user.role});

        const response = NextResponse.json(
            {message: 'Login successful'},
            {status: 200}
        );

        response.cookies.set('AccessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // seconds (1 day)
            path: "/",
        });
        return response;
    } catch (error) {
        console.log(error);
        return NextResponse.json({mesage: 'something went wrong.'}, {status: 500})
    }
}