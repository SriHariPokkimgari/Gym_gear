import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET as string;

export const signToken = (payload: {id: number; role: string}) : string =>{
    return jwt.sign(payload, SECRET, {expiresIn: '15m'});
}

export const verifyToken = (token : string): {id: number; role: string} =>{
    return jwt.verify(token, SECRET) as {id: number; role: string}
}