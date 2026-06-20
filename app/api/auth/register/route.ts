import pool from "@/lib/db";
import { RegisterData } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt'
import  jwt from "jsonwebtoken";
import { signToken } from "@/lib/auth";

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

        const newUser = await pool.query(
            `INSERT INTO users(name, email, password) 
            VALUES($1, $2, $3)
            RETURNING *`,
            [name, email, hashedPassword]
        )

        const token = signToken({id: newUser.rows[0].id, role: newUser.rows[0].role});

        const response =  NextResponse.json(
            {message: 'Account creation successful'},
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
        console.log("Register error: ", error);
        return NextResponse.json(
            {message: 'Something went wrong. Try again later'},
            {status: 500}
        )
    }
}