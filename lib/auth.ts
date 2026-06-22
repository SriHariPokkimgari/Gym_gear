import jwt from 'jsonwebtoken'


const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const signAccessToken = (payload: {id: number; role: string}) : string =>{
    return jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: '15m'
    });
}

export const signRefreshToken = (payload: {id: number; role: string}) : string =>{
    return jwt.sign(payload, REFRESH_SECRET, {expiresIn: '30d'});
}

export const verifyAccessToken = (token : string): {id: number; role: string} =>{
    return jwt.verify(token, ACCESS_SECRET) as {id: number; role: string}
}

export const verifyRefreshToken = (token: string): {id: number, role: string} =>{
    return jwt.verify(token, REFRESH_SECRET) as {id: number; role: string}
}