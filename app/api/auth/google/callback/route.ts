import { NextResponse,  NextRequest } from "next/server";
import pool from "@/lib/db";
import { getGoogleUser } from "@/lib/google";
import { signAccessToken, signRefreshToken } from "@/lib/auth";



export async function GET(request: NextRequest){
    const {searchParams} = new URL(request.url);
    const code = searchParams.get('code');

    if(!code){
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_API_URL}/pages/login?error=missing_code`
        )
    }

    try {
        const googleUser = await getGoogleUser(code);

        if(!googleUser.email || !googleUser.id){
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_API_URL}/pages/login?error=google_failed`
            )
        }

        let userResult = await pool.query(`
            SELECT * FROM users where google_id = $1
            `, [googleUser.id]);

        if(userResult.rowCount === 0){
            userResult = await pool.query(`
                SELECT * FROM users WHERE email = $1
            `, [googleUser.email]);

            if(userResult.rowCount && userResult.rowCount>0){
                await pool.query(`
                  UPDATE users SET google_id = $1, WHERE email = $2  
                `, [googleUser.id, googleUser.email])
            }else{
                userResult = await pool.query(`
                    INSERT INTO users(name, email, google_id)
                    VALUES ($1, $2, $3) RETURNING *
                `, [googleUser.name, googleUser.email, googleUser.id])
            }
        }

        const user = userResult.rows[0];
        const payload = {id: user.id, role: user.role}

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30)
        await pool.query(`
            INSERT INTO refresh_tokens(user_id, token, expires_at)
            VALUES ($1, $2, $3)
        `, [user.id, refreshToken, expiresAt]);

        const response = NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_API_URL}/pages/products`
        );

        response.cookies.set('AccessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite:'lax',
            maxAge: 60 *15,
            path: '/'
        });

        response.cookies.set('RefresToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/'
        })

        return response;
    } catch (error) {
        console.error("Google OAuth error:", error);
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_API_URL}/pages/login?error=0auth_failed`
        )
    }
}