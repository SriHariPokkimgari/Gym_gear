import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto'
import { sendResetEmail } from "@/lib/mailer";

export async function POST(request: NextRequest){
    try {
        const {email} = await request.json() as {email: string}

        if(!email){
            return NextResponse.json(
                {message: 'Email is required.'},
                {status: 400}
            )
        }

        const userResults = await pool.query(
            `SELECT id FROM users WHERE email = $1`,
            [email]
        );

        if(userResults.rowCount === 0){
            return NextResponse.json(
                {mesage: 'If this email exists, a reset link has been sent.'},
                {status: 200}
            )
        };

        const userId = userResults.rows[0].id;

        await pool.query(
            `DELETE FROM password_reset_tokens WHERE user_id = $1`,
            [userId]
        );

        const token = crypto.randomBytes(32).toString('hex');

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1)

        await pool.query(
            `INSERT INTO password_reset_tokens(user_id, token, expires_at)
            VALUES ($1, $2, $3)`,
            [userId, token, expiresAt]
        );

        const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/pages/reset-password?token=${token}`
        await sendResetEmail(email, resetUrl);

        return NextResponse.json(
             {mesage: 'If this email exists, a reset link has been sent.'},
                {status: 200}
        )
    } catch (error) {
        console.error('Forgot password error: ', error);
        return NextResponse.json(
            {message: 'Something went wrong, try again later.'},
            {status: 500}
        )
    }
}

