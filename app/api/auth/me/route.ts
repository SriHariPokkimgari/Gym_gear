import { getAuthUser } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest){
    const user = getAuthUser(request);
    if(!user){
        return NextResponse.json(
            {message: 'Not Authenticated.'},
            {status: 401}
        )
    }

    return NextResponse.json(
        {user},
        {status: 200}
    )
}