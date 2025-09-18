import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET as string
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
export interface JwtPayload {
    userId: number
    email: string
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
}
export const generateAccessToken = (payload: JwtPayload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

export const generateRefreshToken = (payload: JwtPayload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions)
}

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
}
export const verifyRefreshToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload
}
