import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt'
export async function POST(request: NextRequest){
    try {
        const {token, password} = await request.json() as {token: string; password: string}

        if(!token || !password){
            return NextResponse.json(
                {message: "Token and password are required."},
                {status: 400}
            )
        };

        if(password.length < 6){
            return NextResponse.json(
                {message: "Password must be at least  characters."},
                {status: 400}
            )
        }

        const tokenResult = await pool.query(
            `SELECT * FROM password_reset_tokens
            WHERE token = $1 AND expires_at > NOW() AND used = false`,
            [token]
        );

        if(tokenResult.rowCount === 0){
            return NextResponse.json(
                {message: "Reset link is invalid or has expired."},
                {status: 400}
            )
        };

        const userId = tokenResult.rows[0].user_id;

        const hashedPassword = await bcrypt.hash(password, 12);

        await pool.query(
            `UPDATE users SET password = $1
            WHERE id = $2`,
            [hashedPassword, userId]
        );

        await pool.query(
            `UPDATE password_reset_tokens SET used = true WHERE token = $1`,
            [token]
        )

        await pool.query(
            `DELETE FROM password_reset_tokens WHERE user_id = $1`,
            [userId]
        );

        return NextResponse.json(
            {message: 'Password reset successfully. Please login.'},
            {status: 200}
        );
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            {message: "Something went wrong, try again later."},
            {status: 500}
        )
    }
}