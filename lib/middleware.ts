import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export async function getAuthUser(request: NextRequest){
    try {
        const token = request.cookies.get('AccessToken')?.value

        if(!token){
            return null
        }

        const decode = verifyToken(token);
        return decode
    } catch (error) {
        return null;
    }
};

export function requireAuth(request: NextRequest){
    const user = getAuthUser(request);

    if(!user){
        return NextResponse.json(
            {mesage: 'Access denied. Login again.'},
            {status: 401}
        )
    };

    return null
};

export async function requireAdmin(request: NextRequest){
    const user = await getAuthUser(request);

    if (!user) {
    return NextResponse.json(
      { message: "Access denied. Please login." },
      { status: 401 }
    )
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      { message: "Access denied. Admins only." },
      { status: 403 }
    )
  }

  return null;
}

