import pool from "@/lib/db";
import { RegisterData } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt'
import { signAccessToken, signRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest){
    try {
        const {name, email, password} = await request.json() as RegisterData;

        if(!name || !email || !password){
            return NextResponse.json(
                {message: 'Credentials were missing or invalid'},
                {status: 400}
            )
        };

        const user = await pool.query(
            `SELECT id FROM users
            WHERE email = $1`,
            [email]
        );

        if(user.rowCount !== 0){
            return NextResponse.json(
                {message: 'Email already exists. Try another one or login'},
                {status: 400}
            )
        };

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users(name, email, password) 
            VALUES($1, $2, $3)
            RETURNING id, role`,
            [name, email, hashedPassword]
        )

        const newUser = result.rows[0];
        
        const accessToken = signAccessToken({id: newUser.id, role: newUser.role});
        const refreshToken = signRefreshToken({id: newUser.id, role: newUser.role});
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

          await pool.query(`
          INSERT INTO refresh_tokens(user_id, token, expires_at)
          VALUES ($1, $2, $3)  
        `, [newUser.id, refreshToken, expiresAt]);
        
        const response =  NextResponse.json(
            {message: 'Account creation successful'},
            {status: 200}
        );

          response.cookies.set('AccessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 15, 
            path: "/",
        });

        response.cookies.set('RefreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/' 
        });

         return response;
    } catch (error) {
        console.log("Register error: ", error);
        return NextResponse.json(
            {message: 'Something went wrong. Try again later'},
            {status: 500}
        )
    }
}