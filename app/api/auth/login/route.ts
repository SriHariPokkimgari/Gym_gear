import { NextRequest, NextResponse } from "next/server";
import { LoginData } from "@/types";
import pool from "@/lib/db";
import bcrypt from 'bcrypt'
import { signAccessToken, signRefreshToken } from "@/lib/auth";

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

        const accessToken = signAccessToken({id: user.id, role: user.role});

        const refresToken = signRefreshToken({id: user.id, role: user.role})

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await pool.query(`
          INSERT INTO refresh_tokens(user_id, token, expires_at) 
          VALUES($1, $2, $3) 
        `, [user.id, refresToken, expiresAt]);


        const response = NextResponse.json(
            {message: 'Login successful'},
            {status: 200}
        );

        response.cookies.set('AccessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 15, 
            path: "/",
        });

        response.cookies.set('RefreshToken', refresToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/'
        });
        
        return response;
    } catch (error) {
        console.log(error);
        return NextResponse.json({mesage: 'something went wrong'}, {status: 500})
    }
}