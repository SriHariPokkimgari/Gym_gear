import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
   const refreshToken = request.cookies.get('RefreshToken')?.value;

   if(refreshToken){
    await pool.query(`DELETE FROM refresh_tokens WHERE token = $1`, [refreshToken])
   }


    const response = NextResponse.json(
        {message: 'Logout successful'},
        {status: 200}
    );

    response.cookies.delete('AccessToken');
    response.cookies.delete('RefreshToken');

    return response; 
  
  
}