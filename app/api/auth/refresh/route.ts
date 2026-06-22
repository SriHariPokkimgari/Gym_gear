import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { signAccessToken, verifyRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest){
    try {
        const refreshtoken = request.cookies.get('RefreshToken')?.value;
        if(!refreshtoken){
            return NextResponse.json({message: 'No refresh token.'}, {status: 401})
        };

        let decode;
        try {
            decode = verifyRefreshToken(refreshtoken);
        } catch (error) {
            return NextResponse.json({message: 'Refresh token expired.'}, {status: 401})
        }

        const tokenCheck = await pool.query(`
          SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()  
        `, [refreshtoken, decode.id]);

        if(tokenCheck.rowCount === 0){
            return NextResponse.json({message: 'Refresh token invalid or revoked.'}, {status: 401});
        }

        const newAccessToken = signAccessToken({id: decode.id, role: decode.role});

        const response = NextResponse.json({message: 'Token refreshed.'}, {status: 200});

        response.cookies.set('AccessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 15,
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('refresh error: ', error);
        return NextResponse.json({message: 'Something went wrong.'}, {status: 500})
    }
}